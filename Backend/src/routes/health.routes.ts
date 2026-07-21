import { Router, type Request, type Response } from "express";
import { pool } from "../db.ts";

export const healthRouter = Router();

healthRouter.get("/test", async (req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "Backend is connected to PostgreSQL",
      dbTime: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});
