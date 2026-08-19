import { Router } from "express";
import { HealthController } from "../controllers/HealthController.ts";

export const healthRouter = Router();

healthRouter.get("/test", (req, res, next) =>
  HealthController.testConnection(req, res).catch(next),
);
