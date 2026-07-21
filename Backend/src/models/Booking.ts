import type { Booking } from "../types/booking.types.ts";

export class BookingModel implements Booking {
  id: number;
  user_name: string;
  booking_date: string;
  booking_desk: string;

  constructor(data: Booking) {
    this.id = data.id;
    this.user_name = data.user_name;
    this.booking_date = data.booking_date;
    this.booking_desk = data.booking_desk;
  }
}
