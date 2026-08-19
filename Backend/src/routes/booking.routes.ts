import { Router } from "express";
import { BookingController } from "../controllers/BookingController.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";

export const bookingRouter = Router();

bookingRouter.post("/", authMiddleware, (req, res, next) =>
  BookingController.handleBookingCommand(req, res).catch(next),
);
