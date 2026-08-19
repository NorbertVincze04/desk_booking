import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  map,
  tap,
  type MonoTypeOperatorFunction,
} from 'rxjs';
import { catchError, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { UserRecord } from '../models/user-record';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserRecord | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private authUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem(environment.CURRENT_USER_STORAGE);

    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  get userRole() {
    return this.currentUserSubject.value?.type;
  }

  private throwApiError<T>(): MonoTypeOperatorFunction<T> {
    return catchError((error: unknown) =>
      throwError(() => new Error('Server Error: Please try again later.')),
    );
  }

  getAllUsers(): Observable<UserRecord[]> {
    return this.http.get<any>(`${this.authUrl}/users`).pipe(
      map((response) => {
        if (!response.success) {
          return [];
        }

        return response.payload;
      }),
    );
  }

  register(userData: {
    fullName: string;
    email: string;
    password: string;
    secretKey: string;
  }): Observable<boolean> {
    return this.http.post<any>(`${this.authUrl}/register`, userData).pipe(
      map((response) => !!response.success),
      this.throwApiError(),
    );
  }

  login(
    email: string,
    password: string,
  ): Observable<{ isTempPassword: boolean }> {
    return this.http
      .post<any>(`${this.authUrl}/login`, {
        email,
        password,
      })
      .pipe(
        tap((response) => {
          if (response.success) {
            const userWithToken: UserRecord = {
              fullName: response.payload.fullName,
              email: response.payload.email,
              type: response.payload.type,
              token: response.payload.token,
              password: '',
              secretKey: '',
            };

            this.currentUserSubject.next(userWithToken);

            localStorage.setItem(
              environment.CURRENT_USER_STORAGE,
              JSON.stringify(userWithToken),
            );
          }
        }),
        map((response) => ({
          isTempPassword: !!response.payload?.isTempPassword,
        })),
        this.throwApiError(),
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

    return this.http
      .post<any>(`${this.authUrl}/reset-password`, {
        email: currentUser.email,
        newPassword,
      })
      .pipe(
        map((response) => !!response.success),
        this.throwApiError(),
      );
  }

  generateTempPassword(email: string, secretKey: string): Observable<string> {
    return this.http
      .post<any>(`${this.authUrl}/temp-password`, {
        email,
        secretKey,
      })
      .pipe(
        map((response) => response.payload.tempPassword),
        this.throwApiError(),
      );
  }

  isTokenValid(user: UserRecord | null): boolean {
    return user ? !!user.token : false; // '!!' to convert to boolean
  }
}
