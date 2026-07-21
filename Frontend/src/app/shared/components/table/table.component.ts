import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookingService } from '../../../core/services/booking.service';
import { Booking } from '../../../core/models/booking';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrl: './table.component.css',
})
export class TableComponent implements OnInit, OnDestroy {
  bookings: Booking[] = [];
  private destroy$ = new Subject<void>();

  constructor(private bookingService: BookingService) {}

  ngOnInit() {
    combineLatest([
      this.bookingService.bookings$,
      this.bookingService.selectedDate$,
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([allBookings, selectedDate]) => {
        this.bookings = selectedDate
          ? allBookings.filter((b) => this.sameDay(b.date, selectedDate))
          : [];
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private sameDay(a: Date | undefined, b: Date | null): boolean {
    if (!a || !b) return false;
    return a.toDateString() === b.toDateString();
  }
}
