import { Router } from "express";
import { BookingController } from "../controllers/BookingController.ts";

export const bookingRouter = Router();

bookingRouter.post("/", (req, res) =>
  BookingController.handleBookingCommand(req, res),
);
