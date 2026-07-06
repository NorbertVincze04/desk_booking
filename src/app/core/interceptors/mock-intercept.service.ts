import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { MockBooking } from '../models/mock-booking';
import { environment } from '../../../environments/envrionment';

@Injectable({
  providedIn: 'root',
})
export class MockInterceptService implements HttpInterceptor {
  private mockBookings: MockBooking[] = [
    // {
    //   id: '1',
    //   user_name: 'User Example',
    //   booking_date: '04/08/2026',
    //   booking_desk: 'A1',
    // },
    // {
    //   id: '2',
    //   user_name: 'Another User',
    //   booking_date: '04/08/2026',
    //   booking_desk: 'B2',
    // },
  ];

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const { body, method } = req;

    if (method === 'POST' && body?.table_name === 'BOOKINGS_TABLE') {
      return this.handleBookingsTable(body);
    }

    return next.handle(req);
  }

  private saveToStorage() {
    localStorage.setItem(
      environment.BOOKING_STORAGE,
      JSON.stringify(this.mockBookings),
    );
  }

  private handleBookingsTable(body: any): Observable<HttpEvent<any>> {
    let responsePayload: any;

    switch (body.operation) {
      case 'READ':
        const mockBookings = localStorage.getItem(environment.BOOKING_STORAGE);
        this.mockBookings = mockBookings ? JSON.parse(mockBookings) : [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        this.mockBookings = this.mockBookings.filter((b) => {
          const bookingDate = new Date(b.booking_date);
          bookingDate.setHours(0, 0, 0, 0);
          return bookingDate >= today;
        });

        this.saveToStorage();

        responsePayload = {
          success: true,
          payload: this.mockBookings,
        };
        break;

      case 'CREATE':
        const bookingDate = new Date(body.data.booking_date);
        bookingDate.setHours(0, 0, 0, 0);

        const todayCreate = new Date();
        todayCreate.setHours(0, 0, 0, 0);

        if (bookingDate < todayCreate) {
          responsePayload = {
            success: false,
            message: 'Cannot create bookings in the past',
          };
          break;
        }

        const newBooking: MockBooking = {
          id: Date.now().toString(),
          user_name: body.data.user_name,
          booking_date: body.data.booking_date,
          booking_desk: body.data.booking_desk,
        };

        this.mockBookings.push(newBooking);
        this.saveToStorage();

        responsePayload = {
          success: true,
          payload: newBooking,
        };
        break;

      case 'DELETE':
        const index = this.mockBookings.findIndex((b) => b.id === body.data.id);
        if (index !== -1) {
          this.mockBookings.splice(index, 1);
          this.saveToStorage();
          responsePayload = {
            success: true,
            payload: { deleted: true },
          };
        } else {
          responsePayload = {
            success: false,
            message: 'Booking not found',
          };
        }
        break;

      case 'UPDATE':
        const updateIndex = this.mockBookings.findIndex(
          (b) => b.id === body.data.id,
        );

        if (updateIndex !== -1) {
          this.mockBookings[updateIndex] = {
            id: body.data.id,
            user_name: body.data.user_name,
            booking_date: body.data.booking_date,
            booking_desk: body.data.booking_desk,
          };

          this.saveToStorage();

          responsePayload = {
            success: true,
            payload: this.mockBookings[updateIndex],
          };
        } else {
          responsePayload = {
            success: false,
            message: 'Booking not found',
          };
        }
        break;

      default:
        responsePayload = { success: false, message: 'Unknown Operation' };
    }

    return of(new HttpResponse({ status: 200, body: responsePayload })).pipe(
      delay(1000),
    );
  }
}
