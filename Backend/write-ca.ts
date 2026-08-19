import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";

type ServiceKeyCredentials = {
  cacrt: string;
  host: string;
};

type ServiceKeyResponse = {
  credentials: ServiceKeyCredentials;
};

function main() {
  const raw = execSync("cf service-key pg-ico-n8n testkey", {
    encoding: "utf8",
  });
  const json = raw.slice(raw.indexOf("{"));
  const { credentials } = JSON.parse(json) as ServiceKeyResponse;

  writeFileSync("rb-ca.crt", credentials.cacrt, "utf8");
  console.log("Wrote rb-ca.crt");
  console.log("Now set in .env:");
  console.log("  PGCA=rb-ca.crt");
  console.log(`  PGSERVERNAME=${credentials.host}`);
}

main();
