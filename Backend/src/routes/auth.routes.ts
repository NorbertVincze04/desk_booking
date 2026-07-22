import { Router } from "express";
import { AuthController } from "../controllers/AuthController.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";
import { adminMiddleware } from "../middleware/admin.middleware.ts";

export const authRouter = Router();

authRouter.post("/register", (req, res) => AuthController.register(req, res));

authRouter.post("/login", (req, res) => AuthController.login(req, res));

authRouter.post("/reset-password", (req, res) =>
  AuthController.resetPassword(req, res),
);

authRouter.post("/temp-password", (req, res) =>
  AuthController.generateTempPassword(req, res),
);

// Admin-only route to get all users
authRouter.get("/users", authMiddleware, adminMiddleware, (req, res) =>
  AuthController.getUsers(req, res),
);
