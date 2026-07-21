import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BookingService } from '../../../core/services/booking.service';
import { ErrorConfig } from '../error-notification/error-notification.component';
import { ValidationStatus } from '../../../core/models/validation-status';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css',
})
export class CalendarComponent implements OnInit {
  selectedDate: Date | null = new Date();
  minDate: Date = new Date();
  limitDate: Date = this.calculateLimitDays(new Date(), 3);
  disabledDays: number[] = [0, 6];

  private validationSubject = new BehaviorSubject<ValidationStatus>({
    valid: true,
    message: null,
  });
  public validation$ = this.validationSubject.asObservable();

  get warningMessage(): string | null {
    return this.validationSubject.value.message;
  }

  get validationError(): ErrorConfig {
    return {
      message: this.warningMessage || 'Some Validation Error',
      type: 'warning',
      dismissible: false,
    };
  }

  ngOnInit(): void {
    this.initialValidation(this.selectedDate);
  }

  constructor(private bookingService: BookingService) {}

  initialValidation(selectedDate: Date | null) {
    if (selectedDate === null) {
      const validation = { valid: true, message: 'Please select a date' };
      this.validationSubject.next(validation);
    }
    const validation = this.validationSubject.value;
    this.bookingService.selectDate(selectedDate);
    this.bookingService.setValidation(validation);
  }

  onDateChange(selectedDate: any) {
    const dateValue = selectedDate as Date | null;
    this.selectedDate = dateValue;
    this.validateBookingDate(dateValue);

    const validation = this.validationSubject.value;
    this.bookingService.selectDate(dateValue);
    this.bookingService.setValidation(validation);
  }

  calculateLimitDays(startDate: Date, daysToAdd: number): Date {
    let resultDate = new Date(startDate);
    let addedDays = 0;

    while (addedDays < daysToAdd) {
      resultDate.setDate(resultDate.getDate() + 1);
      const dayOfWeek = resultDate.getDay();

      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        addedDays++;
      }
    }

    return resultDate;
  }

  validateBookingDate(date: Date | null) {
    if (!date) {
      return;
    }

    if (date > this.limitDate) {
      const validation = {
        valid: false,
        message: 'You can only make a reservation for the next 3 days.',
      };
      this.validationSubject.next(validation);
      this.bookingService.setValidation(validation);
    } else {
      const validation = { valid: true, message: null };
      this.validationSubject.next(validation);
      this.bookingService.setValidation(validation);
    }
  }
}
