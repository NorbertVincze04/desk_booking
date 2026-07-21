export interface Booking {
  id: number;
  user_name: string;
  booking_date: string;
  booking_desk: string;
}

export interface BookingRequest {
  id?: number;
  user_name?: string;
  booking_date?: string;
  booking_desk?: string;
}

export interface BookingResponse {
  success: boolean;
  message?: string;
  payload?: any;
}
