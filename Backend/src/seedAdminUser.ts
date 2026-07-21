import bcrypt from "bcrypt";
import { pool } from "./db.ts";

export async function seedAdminUser(): Promise<void> {
  const adminEmail = "admin@mail.com";
  const adminPassword = "Admin12!";
  const adminSecretKey = "Admin12!";

  const existingAdmin = await pool.query(
    `
    SELECT id FROM users
    WHERE email = $1
    `,
    [adminEmail],
  );

  if (existingAdmin.rowCount === 0) {
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await pool.query(
      `
      INSERT INTO users
        (full_name, email, password_hash, secret_key, type)
      VALUES
        ($1, $2, $3, $4, $5)
      `,
      ["Admin User", adminEmail, passwordHash, adminSecretKey, "admin"],
    );

    console.log("Admin user seeded.");
  }
}
