import { Router } from "express";
import { BookingController } from "../controllers/BookingController.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";

export const bookingRouter = Router();

// Authenticated route to handle booking commands

bookingRouter.post("/", authMiddleware, (req, res) =>
  BookingController.handleBookingCommand(req, res),
);
