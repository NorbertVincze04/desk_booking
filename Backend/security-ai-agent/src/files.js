import fs from "node:fs";
import path from "node:path";

export function readJsonIfExists(filePath, fallback) {
  try {
    const content = fs
      .readFileSync(filePath, "utf8")
      .replace(/^\uFEFF/, "")
      .trim();
    return JSON.parse(content);
  } catch {
    try {
      const raw = fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
      const startBrace = raw.indexOf("{");
      const startBracket = raw.indexOf("[");
      const start =
        startBrace === -1
          ? startBracket
          : startBracket === -1
            ? startBrace
            : Math.min(startBrace, startBracket);

      if (start >= 0) {
        const candidate = raw.slice(start).trim();
        return JSON.parse(candidate);
      }
    } catch {
      // fall through to fallback
    }

    return fallback;
  }
}

export function readTextIfExists(filePath, fallback = "") {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return fallback;
  }
}

export function resolvePaths(reportsDir, outputDir) {
  const r = path.resolve(reportsDir);
  const o = path.resolve(outputDir);

  return {
    backendAudit: path.join(r, "backend-audit.json"),
    frontendAudit: path.join(r, "frontend-audit.json"),
    codeqlSarif: path.join(r, "codeql.sarif"),
    codeqlAlerts: path.join(r, "codeql-alerts.json"),
    dependencyChanges: path.join(r, "dependency-changes.txt"),
    summaryJson: path.join(o, "ai-security-summary.json"),
    summaryMd: path.join(o, "ai-security-report.md"),
  };
}

export function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function writeFileUtf8(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}
