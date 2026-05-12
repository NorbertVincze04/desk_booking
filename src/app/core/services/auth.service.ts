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

  login(
    email: string,
    password: string,
  ): Observable<{ isTempPassword: boolean }> {
    return of(this.loadUsers()).pipe(
      map((users) => {
        const user = users.find((u) => u.email === email);
        if (!user) {
          throw new Error('Email or password is incorrect.');
        }

        let isTempPassword = false;
        if (user.tempPassword && this.decrypt(user.tempPassword) === password) {
          isTempPassword = true;
        } else if (this.decrypt(user.password) !== password) {
          throw new Error('Email or password is incorrect.');
        }

        return { user, isTempPassword };
      }),
      tap(({ user, isTempPassword }) => {
        if (isTempPassword) {
          user.tempPassword = undefined;
          const users = this.loadUsers();
          const userIndex = users.findIndex((u) => u.email === email);
          if (userIndex !== -1) {
            users[userIndex] = user;
            localStorage.setItem(
              environment.USERS_STORAGE,
              JSON.stringify(users),
            );
          }
        }

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
      map(({ isTempPassword }) => ({ isTempPassword })),
    );
  }

  logout(): void {
    this.currentUserSubject.next(null);
    localStorage.removeItem(environment.CURRENT_USER_STORAGE);
  }

  resetPassword(newPassword: string): Observable<boolean> {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser) {
      throw new Error('No user logged in.');
    }

    return of(this.loadUsers()).pipe(
      tap((users) => {
        const userIndex = users.findIndex((u) => u.email === currentUser.email);
        if (userIndex !== -1) {
          users[userIndex].password = this.encrypt(newPassword);
          localStorage.setItem(
            environment.USERS_STORAGE,
            JSON.stringify(users),
          );
        }
      }),
      map(() => true),
    );
  }

  generateTempPassword(email: string, secretKey: string): Observable<string> {
    return of(this.loadUsers()).pipe(
      map((users) => {
        const user = users.find((u) => u.email === email);
        if (!user) {
          throw new Error('Email or secret key is incorrect.');
        }
        if (user.secretKey !== secretKey) {
          throw new Error('Email or secret key is incorrect.');
        }

        const tempPassword = this.generateTempPasswordString();
        user.tempPassword = this.encrypt(tempPassword);
        const securityPassword = this.generateTempPasswordString();
        user.password = this.encrypt(securityPassword);
        localStorage.setItem(environment.USERS_STORAGE, JSON.stringify(users));
        return tempPassword;
      }),
    );
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

  private generateTempPasswordString(): string {
    const charset =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
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
