// import { Pool } from "pg";

<<<<<<< HEAD
// Validate required environment variables
const requiredEnvVars = [
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Log connection errors
pool.on("error", (error) => {
  console.error("Unexpected error on idle client", error);
});
=======
// export const pool = new Pool({
//   host: process.env.DB_HOST,
//   port: Number(process.env.DB_PORT),
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// // connects database

import { Client } from "pg";
import fs from "fs";

function buildSsl() {
  if (process.env.PGCA && fs.existsSync(process.env.PGCA)) {
    return {
      ca: fs.readFileSync(process.env.PGCA, "utf8"),
      servername: process.env.PGSERVERNAME,
      rejectUnauthorized: true,
    };
  }
  return { rejectUnauthorized: false };
}

export async function runQuery<T = unknown>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
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
  try {
    const res = await client.query(sql, params);
    return res.rows as T[];
  } finally {
    await client.end();
  }
}
>>>>>>> f3fb716ba32bb359a2f79b2df8129ac1fc64d985
