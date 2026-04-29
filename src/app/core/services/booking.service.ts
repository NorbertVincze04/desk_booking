import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  Subject,
  ReplaySubject,
  AsyncSubject,
  tap,
  map,
  catchError,
} from 'rxjs';
import { of } from 'rxjs';
import { Booking } from '../models/booking';
import { Notification } from '../models/notification';
import { ValidationStatus } from '../models/validation-status';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private selectedDeskSubject = new BehaviorSubject<string | null>(null);
  selectedDesk$ = this.selectedDeskSubject.asObservable();

  private selectedDateSubject = new BehaviorSubject<Date | null>(null);
  selectedDate$ = this.selectedDateSubject.asObservable();

  private bookingsSubject = new BehaviorSubject<Booking[]>([]);
  bookings$ = this.bookingsSubject.asObservable();

  private userSubject = new BehaviorSubject<string>('Jhon Doe');
  user$ = this.userSubject.asObservable();

  private notificationSubject = new Subject<Notification>();
  notifications$ = this.notificationSubject.asObservable();

  private notificationHistorySubject = new ReplaySubject<Notification>(5);
  notificationHistory$ = this.notificationHistorySubject.asObservable();

  private bookingOperationSubject = new AsyncSubject<{
    success: boolean;
    message: string;
  }>();
  bookingOperation$ = this.bookingOperationSubject.asObservable();

  private validationSubject = new BehaviorSubject<ValidationStatus>({
    valid: true,
    message: null,
  });
  validation$ = this.validationSubject.asObservable();

  get bookings(): Booking[] {
    return this.bookingsSubject.value;
  }

  get selectedDesk(): string | null {
    return this.selectedDeskSubject.value;
  }

  get user(): string {
    return this.userSubject.value;
  }

  get selectedDate(): Date | null {
    return this.selectedDateSubject.value;
  }

  private apiUrl = 'https://your-backend-api.com/api';

  constructor(private http: HttpClient) {}

  loadBookings() {
    this.execute({ table_name: 'BOOKINGS_TABLE', operation: 'READ' })
      .pipe(
        map((response: any) => {
          if (response.success) {
            return response.payload.map((b: any) => ({
              id: b.id,
              user: b.user_name,
              deskId: b.booking_desk,
              date: new Date(b.booking_date),
            }));
          }
          return [];
        }),
        catchError((error) => {
          const notification: Notification = {
            type: 'error',
            message: 'Failed to load bookings',
          };
          this.notificationSubject.next(notification);
          this.notificationHistorySubject.next(notification);
          return of([]);
        }),
      )
      .subscribe((bookings) => {
        this.bookingsSubject.next(bookings);
      });
  }

  execute(command: any): Observable<any> {
    return this.http.post(this.apiUrl, command);
  }

  selectDesk(deskId: string | null) {
    this.selectedDeskSubject.next(deskId);
  }

  selectDate(date: Date | null) {
    this.selectedDateSubject.next(date);
  }

  setUser(name: string) {
    this.userSubject.next(name);
  }

  setValidation(validation: ValidationStatus) {
    this.validationSubject.next(validation);
  }

  addBooking(booking: Booking): Observable<boolean> {
    const command = {
      table_name: 'BOOKINGS_TABLE',
      operation: 'CREATE',
      data: {
        user_name: booking.user,
        booking_date: booking.date.toLocaleDateString(),
        booking_desk: booking.deskId,
      },
    };

    return this.execute(command).pipe(
      tap((response: any) => {
        if (response.success) {
          const newBooking = {
            id: response.payload.id,
            user: booking.user,
            deskId: booking.deskId,
            date: booking.date,
          };
          this.bookingsSubject.next([...this.bookings, newBooking]);

          if (this.selectedDeskSubject.value === booking.deskId) {
            this.selectDesk(null);
          }

          this.notificationSubject.next({
            type: 'success',
            message: `Desk ${booking.deskId} booked successfully`,
          });
        } else {
          this.notificationSubject.next({
            type: 'error',
            message: 'Failed to book desk',
          });
        }
      }),
      catchError((error) => {
        this.notificationSubject.next({
          type: 'error',
          message: 'Failed to book desk',
        });
        return of(false);
      }),
      map((response: any) => response.success),
    );
  }

  removeBooking(user: string, date: Date): Observable<boolean> {
    const bookingToRemove = this.bookings.find(
      (b) => b.user === user && b.date.toDateString() === date.toDateString(),
    );

    if (!bookingToRemove) {
      this.notificationSubject.next({
        type: 'warning',
        message: 'No booking found to remove',
      });
      return of(false);
    }

    const command = {
      table_name: 'BOOKINGS_TABLE',
      operation: 'DELETE',
      data: { id: bookingToRemove.id },
    };

    return this.execute(command).pipe(
      tap((response: any) => {
        if (response.success) {
          this.bookingsSubject.next(
            this.bookings.filter((b) => b.id !== bookingToRemove.id),
          );

          if (this.selectedDeskSubject.value === bookingToRemove.deskId) {
            this.selectDesk(null);
          }

          this.notificationSubject.next({
            type: 'success',
            message: `Booking for desk ${bookingToRemove.deskId} withdrawn`,
          });
        } else {
          this.notificationSubject.next({
            type: 'error',
            message: 'Failed to withdraw booking',
          });
        }
      }),
      catchError((error) => {
        this.notificationSubject.next({
          type: 'error',
          message: 'Failed to withdraw booking',
        });
        return of(false);
      }),
      map((response: any) => response.success),
    );
  }

  createBookingWithAsyncFeedback(booking: Booking): Observable<{
    success: boolean;
    message: string;
  }> {
    const command = {
      table_name: 'BOOKINGS_TABLE',
      operation: 'CREATE',
      data: {
        user_name: booking.user,
        booking_date: booking.date.toLocaleDateString(),
        booking_desk: booking.deskId,
      },
    };

    return this.execute(command).pipe(
      tap((response: any) => {
        if (response.success) {
          const newBooking = {
            id: response.payload.id,
            user: booking.user,
            deskId: booking.deskId,
            date: booking.date,
          };
          this.bookingsSubject.next([...this.bookings, newBooking]);
          const notification: Notification = {
            type: 'success',
            message: `Desk ${booking.deskId} booked successfully`,
          };
          this.notificationSubject.next(notification);
          this.notificationHistorySubject.next(notification);

          this.bookingOperationSubject.next({
            success: true,
            message: `Desk ${booking.deskId} booked successfully`,
          });
        } else {
          const notification: Notification = {
            type: 'error',
            message: 'Failed to book desk',
          };
          this.notificationSubject.next(notification);
          this.notificationHistorySubject.next(notification);

          this.bookingOperationSubject.next({
            success: false,
            message: 'Failed to book desk',
          });
        }
      }),
      catchError((error) => {
        const notification: Notification = {
          type: 'error',
          message: 'Booking operation failed',
        };
        this.notificationSubject.next(notification);
        this.notificationHistorySubject.next(notification);

        this.bookingOperationSubject.next({
          success: false,
          message: 'Booking operation failed',
        });
        return of(null);
      }),
      tap(() => {
        this.bookingOperationSubject.complete();
      }),
      map((response: any) => ({
        success: response?.success || false,
        message: response?.message || 'Operation status unknown',
      })),
    );
  }

  getBookingFor(user: string, date: Date): Booking | undefined {
    return this.bookings.find(
      (b) => b.user === user && b.date.toDateString() === date.toDateString(),
    );
  }
}
