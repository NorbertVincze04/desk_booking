export function buildMarkdownReport({
  decision,
  risk,
  counts,
  dependencyChanges,
  summaries,
  highlights,
  nextActions,
  generatedAt,
}) {
  const decisionLabel = decision === "block" ? "BLOCK" : "ALLOW";
  const riskLabel = risk.toUpperCase();

  const lines = [
    "<!-- ai-security-agent -->",
    "# AI Security Agent Report",
    "",
    `- Decision: **${decisionLabel}**`,
    `- Risk Level: **${riskLabel}**`,
    `- Generated: ${generatedAt}`,
    "",
    "## Vulnerability Totals",
    "",
    `- Critical: ${counts.critical}`,
    `- High: ${counts.high}`,
    `- Moderate: ${counts.moderate}`,
    `- Low: ${counts.low}`,
    `- Info: ${counts.info}`,
    "",
    "## Tool Summary",
    "",
  ];

  for (const summary of summaries) {
    lines.push(
      `- ${summary.source}: critical=${summary.counts.critical}, high=${summary.counts.high}, moderate=${summary.counts.moderate}, low=${summary.counts.low}, info=${summary.counts.info}`,
    );
  }

  lines.push("", "## Dependency Changes", "");

  if (dependencyChanges.trim().length === 0) {
    lines.push("No dependency file changes detected in this comparison.");
  } else {
    lines.push("```diff", dependencyChanges.trimEnd(), "```");
  }

  lines.push("", "## Top Findings", "");

  if (highlights.length === 0) {
    lines.push("No detailed findings were present in the input reports.");
  } else {
    for (const finding of highlights) {
      const id = finding.package || finding.ruleId || "unknown";
      const msg =
        finding.message || (finding.via || []).join(", ") || "No details";
      lines.push(`- [${finding.severity}] ${id} (${finding.source}): ${msg}`);
    }
  }

  lines.push("", "## Recommended Next Actions", "");

  for (const action of nextActions) {
    lines.push(`- ${action}`);
  }

  lines.push(
    "",
    "## Simple Risk Explanation",
    "",
    decision === "block"
      ? "This change is blocked because at least one severe vulnerability (critical/high) was detected. Merging now could expose users or data to known attack paths."
      : "This change can proceed because no critical or high vulnerabilities were detected in the provided reports. Continue tracking lower-risk issues.",
  );

  return lines.join("\n");
}
