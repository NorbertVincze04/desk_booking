import "dotenv/config";
import path from "node:path";
import { parseArgs } from "./args.js";
import {
  ensureDir,
  readJsonIfExists,
  readTextIfExists,
  resolvePaths,
  writeFileUtf8,
} from "./files.js";
import {
  aggregateCounts,
  classifyRisk,
  suggestActions,
  summarizeCodeQlAlerts,
  summarizeCodeQlFromSarif,
  summarizeNpmAudit,
  topFindings,
} from "./summarizers.js";
import { buildMarkdownReport } from "./reporting.js";

export function run() {
  const args = parseArgs(process.argv.slice(2));
  const reportsDir =
    args["reports-dir"] || process.env.SECURITY_REPORTS_DIR || "./reports";
  const outputDir =
    args["output-dir"] || process.env.SECURITY_OUTPUT_DIR || reportsDir;

  const files = resolvePaths(reportsDir, outputDir);
  ensureDir(path.dirname(files.summaryJson));

  const backendAudit = readJsonIfExists(files.backendAudit, {});
  const frontendAudit = readJsonIfExists(files.frontendAudit, {});
  const codeqlSarif = readJsonIfExists(files.codeqlSarif, null);
  const codeqlAlerts = readJsonIfExists(files.codeqlAlerts, null);
  const dependencyChanges = readTextIfExists(files.dependencyChanges, "");

  const backendSummary = summarizeNpmAudit("npm-audit-backend", backendAudit);
  const frontendSummary = summarizeNpmAudit(
    "npm-audit-frontend",
    frontendAudit,
  );

  const codeqlSummary = codeqlSarif
    ? summarizeCodeQlFromSarif(codeqlSarif)
    : summarizeCodeQlAlerts(codeqlAlerts);

  const summaries = [backendSummary, frontendSummary, codeqlSummary];
  const counts = aggregateCounts(summaries);
  const { decision, risk } = classifyRisk(counts);
  const highlights = topFindings(summaries);
  const nextActions = suggestActions(counts, dependencyChanges);
  const generatedAt = new Date().toISOString();

  const markdown = buildMarkdownReport({
    decision,
    risk,
    counts,
    dependencyChanges,
    summaries,
    highlights,
    nextActions,
    generatedAt,
  });

  const summaryJson = {
    decision,
    risk,
    generatedAt,
    counts,
    summaries,
    highlights,
    nextActions,
    files,
  };

  writeFileUtf8(files.summaryMd, markdown);
  writeFileUtf8(files.summaryJson, JSON.stringify(summaryJson, null, 2));

  console.log(markdown);
  console.log(`\nSummary JSON written to: ${files.summaryJson}`);
  console.log(`Summary Markdown written to: ${files.summaryMd}`);

  if (decision === "block") {
    process.exitCode = 1;
  }
}
