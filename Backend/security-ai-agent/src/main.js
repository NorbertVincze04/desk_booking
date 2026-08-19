import path from "node:path";
import { parseArgs } from "./args.js";
import {
  ensureDir,
  readJsonIfExists,
  readTextIfExists,
  resolvePaths,
  writeFileUtf8,
} from "./files.js";
import { azureOpenAIEndpoint, llm, proxyUrl } from "./llm.js";

function buildConnectionDiagnostics() {
  const endpointHost = new URL(azureOpenAIEndpoint).host;
  const diagnostics = [
    `Endpoint host: ${endpointHost}`,
    `Proxy configured: ${proxyUrl ? "yes" : "no"}`,
    `GitHub Actions: ${process.env.GITHUB_ACTIONS === "true" ? "yes" : "no"}`,
  ];

  if (!proxyUrl) {
    diagnostics.push(
      "No proxy env var is set. If this endpoint is internal-only, use a self-hosted runner or a reachable corporate proxy.",
    );
    return diagnostics;
  }

  try {
    const proxyHost = new URL(proxyUrl).hostname;
    diagnostics.push(`Proxy host: ${proxyHost}`);

    if (proxyHost === "127.0.0.1" || proxyHost === "localhost") {
      diagnostics.push(
        "The configured proxy points to runner localhost. This works only on your machine; GitHub-hosted runners cannot use your local 127.0.0.1 proxy.",
      );
      diagnostics.push(
        "Use a self-hosted runner on the required network or configure HTTP_PROXY/HTTPS_PROXY secrets to a proxy reachable from GitHub Actions.",
      );
    }
  } catch {
    diagnostics.push(
      "Proxy URL could not be parsed. Verify HTTP_PROXY/HTTPS_PROXY secret format.",
    );
  }

  return diagnostics;
}

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
    if (err.message === "Connection error.") {
      for (const line of buildConnectionDiagnostics()) {
        console.error(line);
      }
    }
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
