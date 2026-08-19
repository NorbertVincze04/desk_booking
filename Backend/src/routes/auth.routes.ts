import { Router } from "express";
import { AuthController } from "../controllers/AuthController.ts";
import {
  adminMiddleware,
  authMiddleware,
} from "../middleware/auth.middleware.ts";

export const authRouter = Router();

authRouter.post("/register", (req, res, next) =>
  AuthController.register(req, res).catch(next),
);

authRouter.post("/login", (req, res, next) =>
  AuthController.login(req, res).catch(next),
);

authRouter.post("/reset-password", (req, res, next) =>
  AuthController.resetPassword(req, res).catch(next),
);

authRouter.post("/temp-password", (req, res, next) =>
  AuthController.generateTempPassword(req, res).catch(next),
);

authRouter.get("/users", authMiddleware, adminMiddleware, (req, res, next) =>
  AuthController.getUsers(req, res).catch(next),
);
