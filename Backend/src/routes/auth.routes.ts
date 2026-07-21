import { Router, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import { pool } from "../db.ts";
import { generateToken, type UserPayload } from "../auth.ts";
import { generateTempPasswordString } from "../password.ts";

interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  secretKey: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface ResetPasswordRequest {
  email: string;
  newPassword: string;
}

interface TempPasswordRequest {
  email: string;
  secretKey: string;
}

export const authRouter = Router();

authRouter.post(
  "/register",
  async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
    const { fullName, email, password, secretKey } = req.body;

    if (!fullName || !email || !password || !secretKey) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    try {
      const existingUser = await pool.query(
        `
        SELECT id FROM users
        WHERE email = $1
        `,
        [email],
      );

      if ((existingUser.rowCount ?? 0) > 0) {
        return res.status(409).json({
          success: false,
          message: "An account with that email already exists.",
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const result = await pool.query(
        `
        INSERT INTO users
          (full_name, email, password_hash, secret_key, type)
        VALUES
          ($1, $2, $3, $4, $5)
        RETURNING id, full_name, email, type
        `,
        [fullName, email, passwordHash, secretKey, "user"],
      );

      return res.status(201).json({
        success: true,
        payload: result.rows[0],
      });
    } catch (error) {
      console.error("Register failed:", error);

      return res.status(500).json({
        success: false,
        message: "Register failed.",
      });
    }
  },
);

authRouter.post(
  "/login",
  async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    try {
      const result = await pool.query(
        `
        SELECT 
          id,
          full_name,
          email,
          password_hash,
          temp_password_hash,
          type
        FROM users
        WHERE email = $1
        `,
        [email],
      );

      if (result.rowCount === 0) {
        return res.status(401).json({
          success: false,
          message: "Email or password is incorrect.",
        });
      }

      const user = result.rows[0];

      let isTempPassword = false;
      let passwordValid = false;

      if (user.temp_password_hash) {
        isTempPassword = await bcrypt.compare(
          password,
          user.temp_password_hash,
        );
      }

      if (!isTempPassword) {
        passwordValid = await bcrypt.compare(password, user.password_hash);
      }

      if (!isTempPassword && !passwordValid) {
        return res.status(401).json({
          success: false,
          message: "Email or password is incorrect.",
        });
      }

      if (isTempPassword) {
        await pool.query(
          `
          UPDATE users
          SET temp_password_hash = NULL
          WHERE id = $1
          `,
          [user.id],
        );
      }

      const userPayload: UserPayload = {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        type: user.type,
      };

      const token = generateToken(userPayload);

      return res.json({
        success: true,
        payload: {
          ...userPayload,
          token,
          isTempPassword,
        },
      });
    } catch (error) {
      console.error("Login failed:", error);

      return res.status(500).json({
        success: false,
        message: "Login failed.",
      });
    }
  },
);

authRouter.post(
  "/reset-password",
  async (req: Request<{}, {}, ResetPasswordRequest>, res: Response) => {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required.",
      });
    }

    try {
      const passwordHash = await bcrypt.hash(newPassword, 10);

      const result = await pool.query(
        `
        UPDATE users
        SET password_hash = $1,
            temp_password_hash = NULL
        WHERE email = $2
        RETURNING id
        `,
        [passwordHash, email],
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      return res.json({
        success: true,
        message: "Password reset successfully.",
      });
    } catch (error) {
      console.error("Reset password failed:", error);

      return res.status(500).json({
        success: false,
        message: "Reset password failed.",
      });
    }
  },
);

authRouter.post(
  "/temp-password",
  async (req: Request<{}, {}, TempPasswordRequest>, res: Response) => {
    const { email, secretKey } = req.body;

    if (!email || !secretKey) {
      return res.status(400).json({
        success: false,
        message: "Email and secret key are required.",
      });
    }

    try {
      const result = await pool.query(
        `
        SELECT id, secret_key
        FROM users
        WHERE email = $1
        `,
        [email],
      );

      if (result.rowCount === 0) {
        return res.status(401).json({
          success: false,
          message: "Email or secret key is incorrect.",
        });
      }

      const user = result.rows[0];

      if (user.secret_key !== secretKey) {
        return res.status(401).json({
          success: false,
          message: "Email or secret key is incorrect.",
        });
      }

      const tempPassword = generateTempPasswordString();
      const tempPasswordHash = await bcrypt.hash(tempPassword, 10);

      await pool.query(
        `
        UPDATE users
        SET temp_password_hash = $1
        WHERE id = $2
        `,
        [tempPasswordHash, user.id],
      );

      return res.json({
        success: true,
        payload: {
          tempPassword,
        },
      });
    } catch (error) {
      console.error("Generate temp password failed:", error);

      return res.status(500).json({
        success: false,
        message: "Generate temp password failed.",
      });
    }
  },
);

authRouter.get("/users", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `
      SELECT 
        id,
        full_name,
        email,
        type
      FROM users
      ORDER BY id ASC
      `,
    );

    return res.json({
      success: true,
      payload: result.rows.map((user) => ({
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        type: user.type,
      })),
    });
  } catch (error) {
    console.error("Load users failed:", error);

    return res.status(500).json({
      success: false,
      message: "Load users failed.",
    });
  }
});
