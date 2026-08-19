import { Component, OnInit } from '@angular/core';
import { BookingService } from '../../core/services/booking.service';
import { Booking } from '../../core/models/booking';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrl: './booking.component.css',
})
export class BookingComponent implements OnInit {
  bookings$!: Observable<Booking[]>;
  selectedDesk$!: Observable<string | null>;
  selectedDate$!: Observable<Date | null>;
  user$!: Observable<string>;
  notifications$!: Observable<any>;
  validation$!: Observable<any>;

  availableDesks: string[] = [
    'Desk-01',
    'Desk-02',
    'Desk-03',
    'Desk-04',
    'Desk-05',
    'Desk-06',
    'Desk-07',
    'Desk-08',
    'Desk-09',
    'Desk-10',
  ];

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.bookings$ = this.bookingService.bookings$;
    this.selectedDesk$ = this.bookingService.selectedDesk$;
    this.selectedDate$ = this.bookingService.selectedDate$;
    this.user$ = this.bookingService.user$;
    this.notifications$ = this.bookingService.notifications$;
    this.validation$ = this.bookingService.validation$;

    this.bookingService.loadBookings();
  }

  onSelectDesk(desk: string): void {
    const currentSelection = this.bookingService.selectedDesk;
    this.bookingService.selectDesk(currentSelection === desk ? null : desk);
  }

  onSelectDate(date: Date | null): void {
    this.bookingService.selectDate(date);
  }

  onBookDesk(): void {
    const selectedDesk = this.bookingService.selectedDesk;
    const selectedDate = this.bookingService.selectedDate;
    const user = this.bookingService.user;

    if (!selectedDesk || !selectedDate) {
      this.bookingService.setValidation({
        valid: false,
        message: 'Please select a desk and date',
      });
      return;
    }

    const booking: Booking = {
      id: '',
      user,
      deskId: selectedDesk,
      date: selectedDate,
    };

    this.bookingService.addBooking(booking).subscribe();
  }

  onWithdrawBooking(booking: Booking): void {
    this.bookingService.removeBooking(booking.user, booking.date).subscribe();
  }

  isBookingAvailable(desk: string, date: Date | null): boolean {
    if (!date) return true;

    return !this.bookingService.bookings.some(
      (b) => b.deskId === desk && b.date.toDateString() === date.toDateString(),
    );
  }

  isDeskSelected(desk: string): boolean {
    return this.bookingService.selectedDesk === desk;
  }
}
