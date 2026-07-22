import { Component, signal } from '@angular/core';
import { Booking } from '../../core/models/booking';
import { BookingService } from '../../core/services/booking.service';
import { AuthService } from '../../core/services/auth.service';
import { ActionConfig } from '../../shared/components/action-button/action-button.component';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent {
  bookings = signal<Booking[]>([]);
  editingBooking = signal<Booking | null>(null);
  creating = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  saveLoading = signal<boolean>(false);
  deletingBookingKey = signal<string | null>(null);

  officeGroups = ['A', 'B', 'C', 'D'];
  deskNumbers = [1, 2, 3, 4];

  selectedGroup = signal<string>('A');
  selectedNumber = signal<number>(1);

  users = [];
  allUsers: string[] = [];
  userSearch: string = '';

  todayString = new Date().toISOString().split('T')[0];

  createButtonConfig: ActionConfig = {
    label: 'Create Booking',
    variant: 'primary',
    disabled: false,
  };

  editButtonConfig: ActionConfig = {
    label: 'Edit',
    variant: 'primary',
    disabled: false,
  };

  deleteButtonConfig: ActionConfig = {
    label: 'Delete',
    loadingLabel: 'Deleting...',
    variant: 'secondary',
    disabled: false,
  };

  saveButtonConfig: ActionConfig = {
    label: 'Save',
    loadingLabel: 'Saving...',
    variant: 'primary',
    disabled: false,
  };

  cancelButtonConfig: ActionConfig = {
    label: 'Cancel',
    variant: 'secondary',
    disabled: false,
  };

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.bookingService.bookings$.subscribe((b) => {
      const sorted = [...b].sort((a, b) => a.date.getTime() - b.date.getTime());
      this.bookings.set(sorted);
    });

    this.bookingService.loadBookings();

    this.authService.getAllUsers().subscribe((users) => {
      this.allUsers = users.map((u) => u.fullName);
    });
  }

  startCreate() {
    if (this.saveLoading()) {
      return;
    }

    this.creating.set(true);
    this.selectedGroup.set('A');
    this.selectedNumber.set(1);

    this.editingBooking.set({
      id: '',
      user: '',
      deskId: 'A1',
      date: new Date(),
    });
    this.userSearch = '';
    this.errorMessage.set(null);
  }

  startEdit(booking: Booking) {
    if (this.saveLoading()) {
      return;
    }

    this.creating.set(false);
    this.editingBooking.set({ ...booking });

    const group = booking.deskId.charAt(0) || 'A';
    const number = Number(booking.deskId.slice(1)) || 1;
    this.selectedGroup.set(group);
    this.selectedNumber.set(number);
    this.userSearch = booking.user || '';
    this.errorMessage.set(null);
  }

  cancelEdit() {
    if (this.saveLoading()) {
      return;
    }

    this.editingBooking.set(null);
    this.errorMessage.set(null);
  }

  saveBooking() {
    if (this.saveLoading()) {
      return;
    }

    const b = this.editingBooking();
    if (!b) return;

    const day = b.date.getDay();
    if (day === 0 || day === 6) {
      this.errorMessage.set(
        'Bookings cannot be created for Saturday or Sunday.',
      );
      return;
    }

    this.saveLoading.set(true);

    if (this.creating()) {
      if (this.isCollision(b)) {
        this.saveLoading.set(false);
        this.errorMessage.set(
          `Desk ${b.deskId} is already booked on ${b.date.toDateString()}`,
        );
        return;
      }

      this.bookingService.addBooking(b).subscribe({
        next: () => {
          const sorted = [...this.bookings()].sort(
            (a, b) => a.date.getTime() - b.date.getTime(),
          );
          this.bookings.set(sorted);
          this.editingBooking.set(null);
          this.errorMessage.set(null);
          this.saveLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('Failed to create booking. Please try again.');
          this.saveLoading.set(false);
        },
      });
    } else {
      if (this.isCollision(b, b.id)) {
        this.saveLoading.set(false);
        this.errorMessage.set(
          `Desk ${b.deskId} is already booked on ${b.date.toDateString()}`,
        );
        return;
      }

      this.bookingService.updateBooking(b).subscribe({
        next: () => {
          const sorted = [...this.bookings()].sort(
            (a, b) => a.date.getTime() - b.date.getTime(),
          );
          this.bookings.set(sorted);
          this.editingBooking.set(null);
          this.errorMessage.set(null);
          this.saveLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('Failed to update booking. Please try again.');
          this.saveLoading.set(false);
        },
      });
    }
  }

  deleteBooking(booking: Booking) {
    if (this.deletingBookingKey()) {
      return;
    }

    const bookingKey = this.getBookingKey(booking);
    this.deletingBookingKey.set(bookingKey);

    this.bookingService.removeBooking(booking.user, booking.date).subscribe({
      next: () => {
        const sorted = [...this.bookings()].sort(
          (a, b) => a.date.getTime() - b.date.getTime(),
        );
        this.bookings.set(sorted);
        this.deletingBookingKey.set(null);
      },
      error: () => {
        this.errorMessage.set('Failed to delete booking. Please try again.');
        this.deletingBookingKey.set(null);
      },
    });
  }

  updateDate(event: string) {
    const booking = this.editingBooking();
    if (booking) {
      booking.date = new Date(event);
      this.editingBooking.set({ ...booking });
      const day = booking.date.getDay();
      if (day === 0 || day === 6) {
        this.errorMessage.set(
          'Bookings cannot be created for Saturday or Sunday.',
        );
      } else {
        this.errorMessage.set(null);
      }
    }
  }

  updateGroup(group: string) {
    this.selectedGroup.set(group);
    this.updateDeskId();
  }

  updateNumber(num: number) {
    this.selectedNumber.set(num);
    this.updateDeskId();
  }

  updateDeskId() {
    const booking = this.editingBooking();
    if (booking) {
      booking.deskId = `${this.selectedGroup()}${this.selectedNumber()}`;
      this.editingBooking.set({ ...booking });
    }
  }

  private isCollision(booking: Booking, excludeId?: string) {
    return this.bookings().some(
      (b) =>
        b.deskId === booking.deskId &&
        b.date.toDateString() === booking.date.toDateString() &&
        b.id !== excludeId,
    );
  }

  getCreateActionConfig(): ActionConfig {
    return {
      ...this.createButtonConfig,
      disabled: this.saveLoading() || !!this.deletingBookingKey(),
    };
  }

  getEditActionConfig(): ActionConfig {
    return {
      ...this.editButtonConfig,
      disabled: this.saveLoading() || !!this.deletingBookingKey(),
    };
  }

  getDeleteActionConfig(booking: Booking): ActionConfig {
    const loading = this.deletingBookingKey() === this.getBookingKey(booking);
    return {
      ...this.deleteButtonConfig,
      disabled: this.saveLoading() || !!this.deletingBookingKey(),
      loadingLabel: loading
        ? 'Deleting...'
        : this.deleteButtonConfig.loadingLabel,
    };
  }

  getSaveActionConfig(): ActionConfig {
    const booking = this.editingBooking();
    return {
      ...this.saveButtonConfig,
      disabled: this.saveLoading() || !booking,
    };
  }

  getCancelActionConfig(): ActionConfig {
    return {
      ...this.cancelButtonConfig,
      disabled: this.saveLoading(),
    };
  }

  getBookingKey(booking: Booking): string {
    return `${booking.user}-${booking.deskId}-${booking.date.toDateString()}`;
  }
}
