import type { NextFunction, Request, Response } from "express";

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
