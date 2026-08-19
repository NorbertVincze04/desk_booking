export interface Booking {
  id: number;
  user_name: string;
  booking_date: string;
  booking_desk: string;
}

// allows partial updates by using optional properties

export interface BookingRequest {
  id?: number;
  user_name?: string;
  booking_date?: string;
  booking_desk?: string;
}
