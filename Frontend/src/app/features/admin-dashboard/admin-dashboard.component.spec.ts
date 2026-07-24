/// <reference types="jasmine" />

import { BehaviorSubject, of, throwError } from 'rxjs';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { Booking } from '../../core/models/booking';

describe('AdminDashboardComponent', () => {
  const makeBooking = (overrides: Partial<Booking> = {}): Booking => ({
    id: '1',
    user: 'Alice',
    deskId: 'A1',
    date: new Date('2026-07-28'), // Monday
    ...overrides,
  });

  let bookingsSubject: BehaviorSubject<Booking[]>;
  let bookingServiceStub: any;
  let authServiceStub: any;
  let component: AdminDashboardComponent;

  beforeEach(() => {
    bookingsSubject = new BehaviorSubject<Booking[]>([]);

    bookingServiceStub = {
      bookings$: bookingsSubject.asObservable(),
      loadBookings: jasmine.createSpy('loadBookings'),
      addBooking: jasmine.createSpy('addBooking').and.returnValue(of({})),
      updateBooking: jasmine.createSpy('updateBooking').and.returnValue(of({})),
      removeBooking: jasmine.createSpy('removeBooking').and.returnValue(of({})),
    };

    authServiceStub = {
      getAllUsers: jasmine
        .createSpy('getAllUsers')
        .and.returnValue(of([{ fullName: 'Alice' }, { fullName: 'Bob' }])),
    };

    component = new AdminDashboardComponent(
      bookingServiceStub,
      authServiceStub,
    );
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('loads bookings on init', () => {
      component.ngOnInit();
      expect(bookingServiceStub.loadBookings).toHaveBeenCalled();
    });

    it('populates allUsers from authService', () => {
      component.ngOnInit();
      expect(component.allUsers).toEqual(['Alice', 'Bob']);
    });

    it('sorts bookings from bookings$ by date ascending', () => {
      const b1 = makeBooking({ id: '1', date: new Date('2026-07-30') });
      const b2 = makeBooking({ id: '2', date: new Date('2026-07-28') });
      component.ngOnInit();
      bookingsSubject.next([b1, b2]);
      expect(component.bookings()[0].id).toBe('2');
      expect(component.bookings()[1].id).toBe('1');
    });
  });

  describe('startCreate', () => {
    beforeEach(() => component.ngOnInit());

    it('sets creating to true', () => {
      component.startCreate();
      expect(component.creating()).toBeTrue();
    });

    it('sets editingBooking with default values', () => {
      component.startCreate();
      const booking = component.editingBooking();
      expect(booking).not.toBeNull();
      expect(booking?.deskId).toBe('A1');
      expect(booking?.user).toBe('');
    });

    it('resets selectedGroup to A and selectedNumber to 1', () => {
      component.selectedGroup.set('C');
      component.selectedNumber.set(3);
      component.startCreate();
      expect(component.selectedGroup()).toBe('A');
      expect(component.selectedNumber()).toBe(1);
    });

    it('clears errorMessage', () => {
      component.errorMessage.set('some error');
      component.startCreate();
      expect(component.errorMessage()).toBeNull();
    });

    it('does nothing when saveLoading is true', () => {
      component.saveLoading.set(true);
      component.startCreate();
      expect(component.creating()).toBeFalse();
    });
  });

  describe('startEdit', () => {
    beforeEach(() => component.ngOnInit());

    it('sets editingBooking to a copy of the given booking', () => {
      const booking = makeBooking({ deskId: 'B3' });
      component.startEdit(booking);
      expect(component.editingBooking()).toEqual(booking);
      expect(component.editingBooking()).not.toBe(booking); // copy, not same ref
    });

    it('sets creating to false', () => {
      component.creating.set(true);
      component.startEdit(makeBooking());
      expect(component.creating()).toBeFalse();
    });

    it('extracts group and number from deskId', () => {
      component.startEdit(makeBooking({ deskId: 'C4' }));
      expect(component.selectedGroup()).toBe('C');
      expect(component.selectedNumber()).toBe(4);
    });

    it('sets userSearch to the booking user', () => {
      component.startEdit(makeBooking({ user: 'Bob' }));
      expect(component.userSearch).toBe('Bob');
    });

    it('clears errorMessage', () => {
      component.errorMessage.set('old error');
      component.startEdit(makeBooking());
      expect(component.errorMessage()).toBeNull();
    });

    it('does nothing when saveLoading is true', () => {
      component.saveLoading.set(true);
      component.startEdit(makeBooking({ user: 'Bob' }));
      expect(component.editingBooking()).toBeNull();
    });
  });

  describe('cancelEdit', () => {
    beforeEach(() => component.ngOnInit());

    it('clears editingBooking', () => {
      component.editingBooking.set(makeBooking());
      component.cancelEdit();
      expect(component.editingBooking()).toBeNull();
    });

    it('clears errorMessage', () => {
      component.errorMessage.set('err');
      component.cancelEdit();
      expect(component.errorMessage()).toBeNull();
    });

    it('does nothing when saveLoading is true', () => {
      component.saveLoading.set(true);
      const booking = makeBooking();
      component.editingBooking.set(booking);
      component.cancelEdit();
      expect(component.editingBooking()).toEqual(booking);
    });
  });

  describe('saveBooking', () => {
    beforeEach(() => component.ngOnInit());

    it('does nothing when editingBooking is null', () => {
      component.saveBooking();
      expect(bookingServiceStub.addBooking).not.toHaveBeenCalled();
    });

    it('sets error when date is a Saturday', () => {
      component.creating.set(true);
      component.editingBooking.set(
        makeBooking({ date: new Date('2026-07-25') }),
      ); // Saturday
      component.saveBooking();
      expect(component.errorMessage()).toContain('Saturday or Sunday');
      expect(bookingServiceStub.addBooking).not.toHaveBeenCalled();
    });

    it('sets error when date is a Sunday', () => {
      component.creating.set(true);
      component.editingBooking.set(
        makeBooking({ date: new Date('2026-07-26') }),
      ); // Sunday
      component.saveBooking();
      expect(component.errorMessage()).toContain('Saturday or Sunday');
    });

    it('calls addBooking when creating with no collision', () => {
      component.creating.set(true);
      component.editingBooking.set(makeBooking());
      component.saveBooking();
      expect(bookingServiceStub.addBooking).toHaveBeenCalled();
    });

    it('sets collision error when creating and desk/date is taken', () => {
      const existing = makeBooking({ id: 'existing' });
      bookingsSubject.next([existing]);
      component.creating.set(true);
      component.editingBooking.set(
        makeBooking({ id: '', deskId: 'A1', date: new Date('2026-07-28') }),
      );
      component.saveBooking();
      expect(component.errorMessage()).toContain('already booked');
      expect(bookingServiceStub.addBooking).not.toHaveBeenCalled();
    });

    it('calls updateBooking when not creating', () => {
      const booking = makeBooking({ id: 'edit-id' });
      component.creating.set(false);
      component.editingBooking.set(booking);
      component.saveBooking();
      expect(bookingServiceStub.updateBooking).toHaveBeenCalledWith(booking);
    });

    it('sets error when updateBooking fails', () => {
      bookingServiceStub.updateBooking.and.returnValue(
        throwError(() => new Error('err')),
      );
      const booking = makeBooking({ id: 'edit-id' });
      component.creating.set(false);
      component.editingBooking.set(booking);
      component.saveBooking();
      expect(component.errorMessage()).toContain('Failed to update booking');
    });

    it('sets error when addBooking fails', () => {
      bookingServiceStub.addBooking.and.returnValue(
        throwError(() => new Error('err')),
      );
      component.creating.set(true);
      component.editingBooking.set(makeBooking({ id: '' }));
      component.saveBooking();
      expect(component.errorMessage()).toContain('Failed to create booking');
    });

    it('clears editingBooking on successful save', () => {
      component.creating.set(true);
      component.editingBooking.set(makeBooking({ id: '' }));
      component.saveBooking();
      expect(component.editingBooking()).toBeNull();
    });

    it('does nothing when saveLoading is already true', () => {
      component.saveLoading.set(true);
      component.editingBooking.set(makeBooking());
      component.saveBooking();
      expect(bookingServiceStub.addBooking).not.toHaveBeenCalled();
    });
  });

  describe('deleteBooking', () => {
    beforeEach(() => component.ngOnInit());

    it('calls removeBooking with user and date', () => {
      const booking = makeBooking();
      component.deleteBooking(booking);
      expect(bookingServiceStub.removeBooking).toHaveBeenCalledWith(
        booking.user,
        booking.date,
      );
    });

    it('sets deletingBookingKey during delete', () => {
      bookingServiceStub.removeBooking.and.callFake(() => {
        expect(component.deletingBookingKey()).toBe(
          component.getBookingKey(makeBooking()),
        );
        return of({});
      });
      component.deleteBooking(makeBooking());
    });

    it('clears deletingBookingKey after successful delete', () => {
      component.deleteBooking(makeBooking());
      expect(component.deletingBookingKey()).toBeNull();
    });

    it('sets errorMessage on delete failure', () => {
      bookingServiceStub.removeBooking.and.returnValue(
        throwError(() => new Error('err')),
      );
      component.deleteBooking(makeBooking());
      expect(component.errorMessage()).toContain('Failed to delete booking');
    });

    it('does nothing when a delete is already in progress', () => {
      component.deletingBookingKey.set('some-key');
      component.deleteBooking(makeBooking());
      expect(bookingServiceStub.removeBooking).not.toHaveBeenCalled();
    });
  });
});
