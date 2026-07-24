import "dotenv/config";
import { existsSync, readFileSync } from "node:fs";
import { Client } from "pg";

type SslConfig = {
  ca?: string;
  servername?: string;
  rejectUnauthorized: boolean;
};

function buildSsl(): SslConfig {
  // The DB requires SSL. Because we connect through a localhost tunnel, the
  // server certificate's name is the real DB host, not localhost. Two options:
  //  (A) strict: verify against the Bosch CA and force SNI/servername to the
  //      real host (set PGCA + PGSERVERNAME in .env, run `npm run ca` once).
  //  (B) simple: skip verification (rejectUnauthorized:false).
  if (process.env.PGCA && existsSync(process.env.PGCA)) {
    return {
      ca: readFileSync(process.env.PGCA, "utf8"),
      servername: process.env.PGSERVERNAME,
      rejectUnauthorized: true,
    };
  }

  return { rejectUnauthorized: false };
}

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
    process.argv.slice(2).join(" ").trim() ||
    'SELECT * FROM "ico-env".bookings';

  assertReadOnly(sql);

  const client = new Client({
    host: process.env.PGHOST || "127.0.0.1",
    port: Number(process.env.PGPORT || 15432),
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    ssl: buildSsl(),
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
      "\nIs the tunnel running? In another terminal: npm run tunnel",
    );
  }
  process.exit(1);
});
