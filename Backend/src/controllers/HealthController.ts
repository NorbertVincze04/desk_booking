import type { Request, Response } from "express";
import { pool } from "../config/db.ts";

export class HealthController {
  static async testConnection(req: Request, res: Response): Promise<Response> {
    try {
      const result = await pool.query("SELECT NOW()");

      return res.json({
        success: true,
        message: "Backend is connected to Database",
        dbTime: result.rows[0].now,
      });
    } catch (error) {
      console.error("Database connection failed:", error);

      return res.status(500).json({
        success: false,
        message: "Database connection failed",
      });
    }
  }
}
