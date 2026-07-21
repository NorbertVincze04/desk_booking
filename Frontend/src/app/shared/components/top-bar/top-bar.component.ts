import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookingService } from '../../../core/services/booking.service';
import { Subject, takeUntil } from 'rxjs';
import { ActionConfig } from '../action-button/action-button.component';
import { ErrorConfig } from '../error-notification/error-notification.component';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.css',
})
export class TopBarComponent implements OnInit, OnDestroy {
  errorMessage: string | null = null;
  isLoading = false;
  currentDesk: string | null = null;
  currentDate: Date | null = null;
  bookedDesk: string | null = null;
  currentUser: string = '';
  dateValid: boolean = true;

  bookingButtonConfig: ActionConfig = {
    label: 'Book Now',
    loadingLabel: 'Processing...',
    variant: 'primary',
    disabled: false,
  };

  withdrawButtonConfig: ActionConfig = {
    label: 'Withdraw booking',
    loadingLabel: 'Processing...',
    variant: 'secondary',
    disabled: false,
  };

  errorConfig: ErrorConfig = {
    message: '',
    type: 'error',
    dismissible: true,
    duration: 3000,
  };

  private destroy$ = new Subject<void>();

  constructor(public bookingService: BookingService) {}

  ngOnInit() {
    this.bookingService.loadBookings();

    this.bookingService.selectedDesk$
      .pipe(takeUntil(this.destroy$))
      .subscribe((desk) => {
        this.currentDesk = desk;
      });

    this.bookingService.selectedDate$
      .pipe(takeUntil(this.destroy$))
      .subscribe((date) => {
        this.currentDate = date;
        this.updateBookedDesk();
      });

    this.bookingService.bookings$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateBookedDesk();
      });

    this.bookingService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        this.currentUser = user;
        this.updateBookedDesk();
      });

    this.bookingService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notification) => {
        if (notification.type === 'error') {
          this.showError(notification.message);
        }
      });

    this.bookingService.validation$
      .pipe(takeUntil(this.destroy$))
      .subscribe((validation) => {
        this.dateValid = validation.valid;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateBookedDesk() {
    if (!this.currentDate) {
      this.bookedDesk = null;
      return;
    }

    const booking = this.bookingService.getBookingFor(
      this.currentUser,
      this.currentDate,
    );
    this.bookedDesk = booking ? booking.deskId : null;
  }

  get isButtonDisabled(): boolean {
    if (this.isLoading) return true;
    if (!this.dateValid) return true;
    if (this.bookedDesk) return false;
    return !this.currentDate || !this.currentDesk;
  }

  getButtonConfig(): ActionConfig {
    const baseConfig = this.bookedDesk
      ? this.withdrawButtonConfig
      : this.bookingButtonConfig;
    return {
      ...baseConfig,
      disabled: this.isButtonDisabled,
    };
  }

  private showError(message: string) {
    this.errorMessage = message;
    this.errorConfig.message = message;
    setTimeout(() => {
      this.errorMessage = null;
    }, 3000);
  }

  buttonAction() {
    this.isLoading = true;

    if (this.bookedDesk && this.currentDate) {
      this.bookingService
        .removeBooking(this.currentUser, this.currentDate)
        .subscribe({
          next: (success) => {
            this.isLoading = false;
            if (!success) {
              this.showError('Failed to withdraw booking');
            }
          },
          error: () => {
            this.isLoading = false;
            this.showError('Failed to withdraw booking');
          },
        });
    } else if (this.currentDesk && this.currentDate) {
      this.bookingService
        .addBooking({
          id: '',
          user: this.currentUser,
          deskId: this.currentDesk,
          date: this.currentDate,
        })
        .subscribe({
          next: (success) => {
            this.isLoading = false;
            if (!success) {
              this.showError('Failed to book desk');
            }
          },
          error: () => {
            this.isLoading = false;
            this.showError('Failed to book desk');
          },
        });
    }
  }
}
