import { Router } from "express";
import { BookingController } from "../controllers/BookingController.ts";
import { authMiddleware } from "../middleware/auth.middleware.ts";
import { bookingRateLimiter } from "../middleware/rateLimit.middleware.ts";

export const bookingRouter = Router();

<<<<<<< HEAD
bookingRouter.post("/", authMiddleware, (req, res, next) =>
  BookingController.handleBookingCommand(req, res).catch(next),
=======
// Authenticated route to handle booking commands

bookingRouter.post("/", bookingRateLimiter, authMiddleware, (req, res) =>
  BookingController.handleBookingCommand(req, res),
>>>>>>> f3fb716ba32bb359a2f79b2df8129ac1fc64d985
);
