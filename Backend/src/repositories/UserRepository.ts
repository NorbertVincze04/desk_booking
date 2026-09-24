import { runQuery } from "../config/db.ts";
import type { UserRecord } from "../types/user.types.ts";

export class UserRepository {
  static async findByEmail(email: string): Promise<UserRecord | null> {
    const result = await runQuery<UserRecord>(
      `
      SELECT id, full_name, email, password_hash, temp_password_hash, secret_key, type
      FROM "ico-env".users
      WHERE email = $1
      `,
      [email],
    );

    return result[0] || null;
  }

  static async create(
    fullName: string,
    email: string,
    passwordHash: string,
    secretKey: string,
    type: "admin" | "user" = "user",
  ): Promise<UserRecord> {
    const result = await runQuery<UserRecord>(
      `
      INSERT INTO "ico-env".users
        (full_name, email, password_hash, secret_key, type)
      VALUES
        ($1, $2, $3, $4, $5)
      RETURNING id, full_name, email, password_hash, temp_password_hash, secret_key, type
      `,
      [fullName, email, passwordHash, secretKey, type],
    );

    return result[0];
  }

  static async updatePasswordHash(
    email: string,
    passwordHash: string,
  ): Promise<number | null> {
    const result = await runQuery<UserRecord>(
      `
      UPDATE "ico-env".users
      SET password_hash = $1, temp_password_hash = NULL
      WHERE email = $2
      RETURNING id
      `,
      [passwordHash, email],
    );

    return result[0]?.id || null;
  }

  static async updateTempPasswordHash(
    userId: number,
    tempPasswordHash: string,
  ): Promise<void> {
    await runQuery<UserRecord>(
      `
      UPDATE "ico-env".users
      SET temp_password_hash = $1
      WHERE id = $2
      `,
      [tempPasswordHash, userId],
    );
  }

  static async clearTempPassword(userId: number): Promise<void> {
    await runQuery<UserRecord>(
      `
      UPDATE "ico-env".users
      SET temp_password_hash = NULL
      WHERE id = $1
      `,
      [userId],
    );
  }

  static async getAllUsers(): Promise<
    Array<{
      id: number;
      fullName: string;
      email: string;
      type: string;
    }>
  > {
    const result = await runQuery<UserRecord>(
      `
      SELECT id, full_name, email, type
      FROM "ico-env".users
      ORDER BY id ASC
      `,
    );

    return result.map((user) => ({
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      type: user.type,
    }));
  }

  // used when registering a new user
  static async existsByEmail(email: string): Promise<boolean> {
    const result = await runQuery(
      `
      SELECT id FROM "ico-env".users
      WHERE email = $1
      `,
      [email],
    );

    return result.length > 0;
  }
}
