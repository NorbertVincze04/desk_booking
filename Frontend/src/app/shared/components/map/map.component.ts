import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookingService } from '../../../core/services/booking.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrl: './map.component.css',
})
export class MapComponent implements OnInit, OnDestroy {
  officeGroups = ['A', 'B', 'C', 'D'];
  deskNumbers = [1, 2, 3, 4];

  selectedDate: Date | null = null;
  selectedDesk: string | null = null;
  bookings: any[] = [];
  currentUser: string = '';
  isDateValidated: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(private bookingService: BookingService) {}

  ngOnInit() {
    this.bookingService.selectedDate$
      .pipe(takeUntil(this.destroy$))
      .subscribe((date) => {
        this.selectedDate = date;
      });

    this.bookingService.selectedDesk$
      .pipe(takeUntil(this.destroy$))
      .subscribe((desk) => {
        this.selectedDesk = desk;
      });

    this.bookingService.bookings$
      .pipe(takeUntil(this.destroy$))
      .subscribe((bookings) => {
        this.bookings = bookings;
      });

    this.bookingService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
      });

    this.bookingService.validation$
      .pipe(takeUntil(this.destroy$))
      .subscribe((validation) => {
        this.isDateValidated = validation.valid;
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

  getStatus(groupId: string, deskNum: number): string {
    const id = groupId + deskNum;

    if (!this.selectedDate) {
      return 'booked';
    }

    if (!this.isDateValidated) {
      return 'booked';
    }

    const bookedDesk = this.bookings.find(
      (booking) =>
        booking.deskId === id && this.sameDay(booking.date, this.selectedDate),
    );

    if (bookedDesk) {
      return bookedDesk.user === this.currentUser ? 'mine' : 'booked';
    }

    if (this.selectedDesk === id) {
      return 'selected';
    }

    return 'available';
  }

  toggleDesk(groupId: string, deskNum: number) {
    if (!this.selectedDate || !this.isDateValidated) {
      return;
    }

    const id = groupId + deskNum;
    const status = this.getStatus(groupId, deskNum);

    if (status === 'available') {
      this.bookingService.selectDesk(id);
    } else if (status === 'selected') {
      this.bookingService.selectDesk(null);
    }
  }
}
