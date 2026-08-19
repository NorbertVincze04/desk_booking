import { Router } from "express";
import { AuthController } from "../controllers/AuthController.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";
import { adminMiddleware } from "../middleware/admin.middleware.ts";
import { authRateLimiter } from "../middleware/rateLimit.middleware.ts";

export const authRouter = Router();

<<<<<<< HEAD
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
=======
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
>>>>>>> f3fb716ba32bb359a2f79b2df8129ac1fc64d985
);
