import { Router } from "express";
import { AuthController } from "../controllers/AuthController.ts";

export const authRouter = Router();

authRouter.post("/register", (req, res) => AuthController.register(req, res));

authRouter.post("/login", (req, res) => AuthController.login(req, res));

authRouter.post("/reset-password", (req, res) =>
  AuthController.resetPassword(req, res),
);

authRouter.post("/temp-password", (req, res) =>
  AuthController.generateTempPassword(req, res),
);

authRouter.get("/users", (req, res) => AuthController.getUsers(req, res));
