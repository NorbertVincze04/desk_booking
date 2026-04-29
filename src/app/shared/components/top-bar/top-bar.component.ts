import { Component, OnInit, OnDestroy } from '@angular/core';
import { BookingService } from '../../../core/services/booking.service';
import { Subscription } from 'rxjs';
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
    variant: 'danger',
    disabled: false,
  };

  errorConfig: ErrorConfig = {
    message: '',
    type: 'error',
    dismissible: true,
    duration: 3000,
  };

  private subscription = new Subscription();

  constructor(public bookingService: BookingService) {}

  ngOnInit() {
    this.bookingService.loadBookings();

    this.subscription.add(
      this.bookingService.selectedDesk$.subscribe((desk) => {
        this.currentDesk = desk;
      }),
    );

    this.subscription.add(
      this.bookingService.selectedDate$.subscribe((date) => {
        this.currentDate = date;
        this.updateBookedDesk();
      }),
    );

    this.subscription.add(
      this.bookingService.bookings$.subscribe(() => {
        this.updateBookedDesk();
      }),
    );

    this.subscription.add(
      this.bookingService.user$.subscribe((user) => {
        this.currentUser = user;
        this.updateBookedDesk();
      }),
    );

    this.subscription.add(
      this.bookingService.notifications$.subscribe((notification) => {
        if (notification.type === 'error') {
          this.showError(notification.message);
        }
      }),
    );

    this.subscription.add(
      this.bookingService.validation$.subscribe((validation) => {
        this.dateValid = validation.valid;
      }),
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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

  // get buttonLabel(): string {
  //   return this.bookedDesk ? 'Withdraw booking' : 'Book Now';
  // }

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
