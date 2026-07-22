import { BookingRepository } from "../repositories/BookingRepository.ts";
import type { Booking, BookingRequest } from "../types/booking.types.ts";

// implements CRUD

export class BookingService {
  static async getAllBookings(): Promise<Booking[]> {
    return BookingRepository.getAllBookings();
  }

  static async createBooking(
    userName: string,
    bookingDate: string,
    bookingDesk: string,
  ): Promise<Booking> {
    return BookingRepository.createBooking(userName, bookingDate, bookingDesk);
  }

  static async updateBooking(
    id: number,
    data: BookingRequest,
  ): Promise<Booking | null> {
    return BookingRepository.updateBooking(id, data);
  }

  static async deleteBooking(id: number): Promise<number | null> {
    return BookingRepository.deleteBooking(id);
  }
}
