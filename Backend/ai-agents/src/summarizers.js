import { LEVEL_ORDER } from "./constants.js";
import { normalizeLevel, securitySeverityToLevel } from "./severity.js";

export function summarizeNpmAudit(label, report) {
  const base = {
    source: label,
    counts: {
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0,
      info: 0,
    },
    findings: [],
    total: 0,
  };

  if (!report || typeof report !== "object") {
    return base;
  }

  const metaCounts = report.metadata?.vulnerabilities;
  if (metaCounts) {
    for (const level of LEVEL_ORDER) {
      if (typeof metaCounts[level] === "number") {
        base.counts[level] = metaCounts[level];
      }
    }
  }

  const vulnerabilities = report.vulnerabilities || {};
  for (const [pkg, details] of Object.entries(vulnerabilities)) {
    const level = normalizeLevel(details?.severity);
    const via = Array.isArray(details?.via)
      ? details.via
          .map((v) => (typeof v === "string" ? v : v?.title || v?.name || ""))
          .filter(Boolean)
      : [];

    base.findings.push({
      package: pkg,
      severity: level,
      isDirect: Boolean(details?.isDirect),
      via,
      fixAvailable: details?.fixAvailable || false,
    });
  }

  base.total = Object.values(base.counts).reduce((acc, n) => acc + n, 0);
  return base;
}

export function summarizeCodeQlFromSarif(report) {
  const result = {
    source: "codeql-sarif",
    counts: {
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0,
      info: 0,
    },
    findings: [],
    total: 0,
  };

  if (!report || !Array.isArray(report.runs)) {
    return result;
  }

  for (const run of report.runs) {
    const ruleMap = new Map();
    for (const rule of run?.tool?.driver?.rules || []) {
      ruleMap.set(rule.id, rule);
    }

    for (const finding of run.results || []) {
      const rule = ruleMap.get(finding.ruleId);
      const sec =
        finding?.properties?.["security-severity"] ||
        rule?.properties?.["security-severity"];
      const normalized = sec
        ? securitySeverityToLevel(sec)
        : normalizeLevel(finding.level);

      result.counts[normalized] += 1;
      result.findings.push({
        ruleId: finding.ruleId,
        severity: normalized,
        message: finding.message?.text || "No message provided",
        location:
          finding.locations?.[0]?.physicalLocation?.artifactLocation?.uri ||
          "unknown",
      });
    }
  }

  result.total = Object.values(result.counts).reduce((acc, n) => acc + n, 0);
  return result;
}

export function summarizeCodeQlAlerts(alerts) {
  const result = {
    source: "codeql-alerts",
    counts: {
      critical: 0,
      high: 0,
      moderate: 0,
      low: 0,
      info: 0,
    },
    findings: [],
    total: 0,
  };

  if (!Array.isArray(alerts)) {
    return result;
  }

  for (const alert of alerts) {
    const level = normalizeLevel(alert?.rule?.security_severity_level || "");
    result.counts[level] += 1;
    result.findings.push({
      ruleId: alert?.rule?.id || "unknown-rule",
      severity: level,
      message:
        alert?.most_recent_instance?.message?.text || "No message provided",
      location:
        alert?.most_recent_instance?.location?.path ||
        alert?.most_recent_instance?.location?.start_line ||
        "unknown",
    });
  }

  result.total = Object.values(result.counts).reduce((acc, n) => acc + n, 0);
  return result;
}

export function aggregateCounts(summaries) {
  const total = {
    critical: 0,
    high: 0,
    moderate: 0,
    low: 0,
    info: 0,
  };

  for (const summary of summaries) {
    for (const level of Object.keys(total)) {
      total[level] += summary?.counts?.[level] || 0;
    }
  }

  return total;
}

export function classifyRisk(counts) {
  if (counts.critical > 0) {
    return { decision: "block", risk: "critical" };
  }

  if (counts.high > 0) {
    return { decision: "block", risk: "high" };
  }

  if (counts.moderate > 0) {
    return { decision: "allow", risk: "medium" };
  }

  if (counts.low > 0 || counts.info > 0) {
    return { decision: "allow", risk: "low" };
  }

  return { decision: "allow", risk: "none" };
}

export function topFindings(summaries, limit = 8) {
  const weighted = [];
  const scoreByLevel = {
    critical: 5,
    high: 4,
    moderate: 3,
    low: 2,
    info: 1,
  };

  for (const summary of summaries) {
    for (const finding of summary.findings || []) {
      weighted.push({
        ...finding,
        source: summary.source,
        score: scoreByLevel[finding.severity] || 0,
      });
    }
  }

  return weighted
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ score, ...clean }) => clean);
}

export function suggestActions(counts, dependencyChangesText) {
  const actions = [];

  if (counts.critical > 0 || counts.high > 0) {
    actions.push(
      "Run `npm audit fix` in both Backend and Frontend, then validate with full test runs.",
    );
    actions.push(
      "For vulnerabilities without automatic fixes, upgrade the direct package to a patched major/minor version and check release notes for breaking changes.",
    );
    actions.push(
      "If a vulnerable package is transitive, pin a safe version using `overrides` and remove the pin after upstream packages are updated.",
    );
  }

  if (counts.moderate > 0) {
    actions.push(
      "Create follow-up tickets for moderate findings with clear owner and due date; resolve before the next release cut.",
    );
  }

  if (dependencyChangesText.trim().length > 0) {
    actions.push(
      "Review changed dependencies in this PR and verify each upgrade/downgrade against changelog, CVEs, and lockfile integrity.",
    );
  }

  if (actions.length === 0) {
    actions.push(
      "No security findings detected in provided reports. Keep CodeQL and npm audit running on every PR and push to dev.",
    );
  }

  return actions;
}
