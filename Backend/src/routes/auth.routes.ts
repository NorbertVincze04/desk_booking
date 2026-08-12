import { Router } from "express";
import { AuthController } from "../controllers/AuthController.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";
import { adminMiddleware } from "../middleware/admin.middleware.ts";
import { authRateLimiter } from "../middleware/rateLimit.middleware.ts";

export const authRouter = Router();

authRouter.post("/register", authRateLimiter, (req, res) =>
  AuthController.register(req, res),
);

authRouter.post("/login", authRateLimiter, (req, res) =>
  AuthController.login(req, res),
);

authRouter.post("/reset-password", authRateLimiter, (req, res) =>
  AuthController.resetPassword(req, res),
);

authRouter.post("/temp-password", authRateLimiter, (req, res) =>
  AuthController.generateTempPassword(req, res),
);

// admin-only route to get all users
authRouter.get(
  "/users",
  authRateLimiter,
  authMiddleware,
  adminMiddleware,
  (req, res) => AuthController.getUsers(req, res),
);
