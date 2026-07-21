import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";

dotenv.config();

export const PORT = Number(process.env.PORT || 3000);
export const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:4200";
export const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
export const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ||
  "1d") as SignOptions["expiresIn"];
