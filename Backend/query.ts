import "dotenv/config";
import { Client } from "pg";

function assertReadOnly(sql: string) {
  const first = sql.trim().split(/\s+/)[0]?.toLowerCase();
  const allowed = ["select", "with", "explain", "show", "table"];

  if (!first || !allowed.includes(first)) {
    throw new Error(
      `Refusing to run a non-read statement (starts with "${first ?? ""}"). Allowed: ${allowed.join(", ")}.`,
    );
  }

  if (/;\s*\S/.test(sql.trim().replace(/;\s*$/, ""))) {
    throw new Error(
      "Refusing to run multiple statements. Send one SELECT at a time.",
    );
  }
}

async function main() {
  const sql =
    process.argv.slice(2).join(" ").trim() || 'SELECT * FROM "ico-env".users';

  assertReadOnly(sql);

  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionTimeoutMillis: 15000,
  });

  await client.connect();
  const res = await client.query(sql);
  console.table(res.rows);
  console.log(`${res.rowCount} row(s).`);
  await client.end();
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);

  console.error("Query failed:", message);
  if (/ECONNREFUSED|timeout/i.test(message)) {
    console.error(
      "\nMake sure your local Postgres server is running and credentials are configured in .env",
    );
  }
  process.exit(1);
});
