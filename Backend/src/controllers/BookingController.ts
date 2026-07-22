import type { Request, Response } from "express";
import { BookingService } from "../services/BookingService.ts";
import {
  validateBookingCommand,
  type BookingCommandRequest,
} from "../validators/booking.validator.ts";

export class BookingController {
  static async handleBookingCommand(
    req: Request<{}, {}, BookingCommandRequest>,
    res: Response,
  ): Promise<Response> {
    try {
      const { valid, errors } = validateBookingCommand(req.body);
      if (!valid) {
        return res.status(400).json({
          success: false,
          message: "Validation error",
          errors,
        });
      }

      const { operation, data } = req.body;

      switch (operation) {
        case "READ": {
          const bookings = await BookingService.getAllBookings();
          return res.json({
            success: true,
            payload: bookings,
          });
        }

        case "CREATE": {
          if (!data?.user_name || !data?.booking_date || !data?.booking_desk) {
            return res.status(400).json({
              success: false,
              message: "Missing required booking data",
            });
          }

          const booking = await BookingService.createBooking(
            data.user_name,
            data.booking_date,
            data.booking_desk,
          );

          return res.json({
            success: true,
            payload: booking,
          });
        }

        case "UPDATE": {
          if (!data?.id) {
            return res.status(400).json({
              success: false,
              message: "Missing booking id",
            });
          }

          const booking = await BookingService.updateBooking(data.id, data);

          if (!booking) {
            return res.status(404).json({
              success: false,
              message: "Booking not found",
            });
          }

          return res.json({
            success: true,
            payload: booking,
          });
        }

        case "DELETE": {
          if (!data?.id) {
            return res.status(400).json({
              success: false,
              message: "Missing booking id",
            });
          }

          const bookingId = await BookingService.deleteBooking(data.id);

          if (!bookingId) {
            return res.status(404).json({
              success: false,
              message: "Booking not found",
            });
          }

          return res.json({
            success: true,
            payload: {
              id: bookingId,
            },
          });
        }

        default: {
          return res.status(400).json({
            success: false,
            message: "Invalid operation",
          });
        }
      }
    } catch (error: any) {
      console.error("Booking operation failed:", error);

      if (error.code === "23505") {
        return res.status(409).json({
          success: false,
          message: "This desk is already booked for this date",
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
