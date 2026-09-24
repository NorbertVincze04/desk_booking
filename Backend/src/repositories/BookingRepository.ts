import { runQuery } from "../config/db.ts";
import type { Booking, BookingRequest } from "../types/booking.types.ts";

export class BookingRepository {
  static async getAllBookings(): Promise<Booking[]> {
    const result = await runQuery<Booking>(
      `
      SELECT id, user_name, booking_date, booking_desk
      FROM "ico-env".bookings
      ORDER BY booking_date ASC, booking_desk ASC
      `,
    );

    return result;
  }

  static async createBooking(
    userName: string,
    bookingDate: string,
    bookingDesk: string,
  ): Promise<Booking> {
    const result = await runQuery<Booking>(
      `
      INSERT INTO "ico-env".bookings 
        (user_name, booking_date, booking_desk)
      VALUES 
        ($1, $2, $3)
      RETURNING id, user_name, booking_date, booking_desk
      `,
      [userName, bookingDate, bookingDesk],
    );

    return result[0];
  }

  // allow partial updates by using COALESCE to keep existing values if new ones are not provided
  static async updateBooking(
    id: number,
    data: BookingRequest,
  ): Promise<Booking | null> {
    const result = await runQuery<Booking>(
      `
      UPDATE "ico-env".bookings
      SET 
        user_name = COALESCE($1, user_name),
        booking_date = COALESCE($2, booking_date),
        booking_desk = COALESCE($3, booking_desk)
      WHERE id = $4
      RETURNING id, user_name, booking_date, booking_desk
      `,
      [
        data.user_name ?? null,
        data.booking_date ?? null,
        data.booking_desk ?? null,
        id,
      ],
    );

    return result[0] || null;
  }

  static async deleteBooking(id: number): Promise<number | null> {
    const result = await runQuery<Booking>(
      `
      DELETE FROM "ico-env".bookings
      WHERE id = $1
      RETURNING id
      `,
      [id],
    );

    return result[0]?.id || null;
  }

  static async deletePastBookings(): Promise<number> {
    const result = await runQuery<{ id: number }>(
      `
      DELETE FROM "ico-env".bookings
      WHERE booking_date < CURRENT_DATE
      RETURNING id
      `,
    );

    return result.length;
  }
}
