import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/envrionment';
import { UserRecord } from '../models/user-record';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserRecord | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    const storedUser = localStorage.getItem(environment.CURRENT_USER_STORAGE);
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  register(userData: {
    fullName: string;
    email: string;
    password: string;
    secretKey: string;
  }): Observable<boolean> {
    return of(this.loadUsers()).pipe(
      map((users) => {
        const existingUser = users.find(
          (user) => user.email === userData.email,
        );
        if (existingUser) {
          throw new Error('An account with that email already exists.');
        }
        return users;
      }),
      tap((users) => {
        const newUser: UserRecord = {
          fullName: userData.fullName,
          email: userData.email,
          password: this.encrypt(userData.password),
          secretKey: userData.secretKey,
          type: 'user',
        };
        users.push(newUser);
        localStorage.setItem(environment.USERS_STORAGE, JSON.stringify(users));
      }),
      map(() => true),
    );
  }

  login(email: string, password: string): Observable<boolean> {
    return of(this.loadUsers()).pipe(
      map((users) => {
        const user = users.find((u) => u.email === email);
        if (!user || this.decrypt(user.password) !== password) {
          throw new Error('Email or password is incorrect.');
        }
        return user;
      }),
      tap((user) => {
        const token = this.generateToken();
        const userWithToken: UserRecord = {
          ...user,
          token,
        };
        this.currentUserSubject.next(userWithToken);
        localStorage.setItem(
          environment.CURRENT_USER_STORAGE,
          JSON.stringify(userWithToken),
        );
      }),
      map(() => true),
    );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem(environment.CURRENT_USER_STORAGE);
  }

  isTokenValid(user: UserRecord | null): boolean {
    return user ? !!user.token : false;
  }

  private generateToken(): string {
    const charset =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let token = '';
    for (let i = 0; i < 30; i++) {
      token += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return token;
  }

  private loadUsers(): UserRecord[] {
    const stored = localStorage.getItem(environment.USERS_STORAGE);
    return stored ? JSON.parse(stored) : [];
  }

  private encrypt(value: string): string {
    const reversed = value.split('').reverse().join('');
    return btoa(reversed);
  }

  private decrypt(value: string): string {
    try {
      const decoded = atob(value);
      return decoded.split('').reverse().join('');
    } catch {
      return '';
    }
  }
}
