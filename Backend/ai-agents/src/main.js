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
import { llm } from "./llm.js";

export async function run() {
  const args = parseArgs(process.argv.slice(2));
  const reportsDir =
    args["reports-dir"] || process.env.SECURITY_REPORTS_DIR || "./reports";
  const outputDir =
    args["output-dir"] || process.env.SECURITY_OUTPUT_DIR || reportsDir;

  const files = resolvePaths(reportsDir, outputDir);
  ensureDir(path.dirname(files.summaryJson));

  const backendAudit = readJsonIfExists(files.backendAudit, null);
  const frontendAudit = readJsonIfExists(files.frontendAudit, null);
  const codeqlSarif = readJsonIfExists(files.codeqlSarif, null);
  const dependencyChanges = readTextIfExists(files.dependencyChanges, "");

  const context = JSON.stringify(
    { backendAudit, frontendAudit, codeqlSarif, dependencyChanges },
    null,
    2,
  );

  console.log("Calling AI security agent...");

  let response;
  try {
    response = await llm.invoke([
      [
        "system",
        `You are a senior application security engineer reviewing automated scan results for a web application.
Analyze the provided data and produce a security report in plain Markdown covering:
1. Overall risk assessment and a clear ALLOW or BLOCK recommendation for merging
2. The most urgent findings and why they matter
3. Any patterns or attack chains you notice across findings
4. Concrete, prioritized remediation steps

Be direct and specific. Do not repeat raw numbers without context.`,
      ],
      [
        "human",
        `Here are the security scan results:\n\`\`\`json\n${context}\n\`\`\``,
      ],
    ]);
  } catch (err) {
    console.error(`AI security agent failed: ${err.message}`);
    process.exit(1);
  }

  const report = response.content;
  const generatedAt = new Date().toISOString();

  writeFileUtf8(files.summaryMd, report);
  writeFileUtf8(
    files.summaryJson,
    JSON.stringify({ generatedAt, report, files }, null, 2),
  );

  console.log(report);
  console.log(`\nReport written to: ${files.summaryMd}`);
  console.log(`JSON written to:   ${files.summaryJson}`);
}
