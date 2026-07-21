import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.utils.ts";
import type { UserPayload } from "../types/user.types.ts";

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void | Response {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Missing or invalid authorization header",
      });
    }

    const token = authHeader.substring(7);
    const user = verifyToken(token);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
}

export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void | Response {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (req.user.type !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
}

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  console.error("Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
}
