import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../core/models/booking';
import { Subscription, combineLatest } from 'rxjs';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent implements OnInit, OnDestroy {
  bookings: Booking[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private bookingService: BookingService) {}

  ngOnInit() {
    this.subscription = combineLatest([
      this.bookingService.bookings$,
      this.bookingService.selectedDate$,
    ]).subscribe(([allBookings, selectedDate]) => {
      this.bookings = selectedDate
        ? allBookings.filter((b) => this.sameDay(b.date, selectedDate))
        : [];
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private sameDay(a: Date | undefined, b: Date | null): boolean {
    if (!a || !b) return false;
    return a.toDateString() === b.toDateString();
  }
}
