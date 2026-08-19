import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { SharedModule } from './shared/shared.module';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { DatePickerModule } from 'primeng/datepicker';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routes } from './app-routes';
import { AppComponent } from './app.component';

import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { BookingComponent } from './features/booking/booking.component';
import { InformationComponent } from './features/information/information.component';
import { SignInComponent } from './core/auth/sign-in/sign-in.component';
import { RegisterComponent } from './core/auth/register/register.component';
import { TempPassComponent } from './core/auth/temp-pass/temp-pass.component';
import { ResetPassComponent } from './core/auth/reset-pass/reset-pass.component';
import { AdminDashboardComponent } from './features/admin-dashboard/admin-dashboard.component';
import { AuthTokenInterceptor } from './core/interceptors/auth-token.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    BookingComponent,
    InformationComponent,
    SignInComponent,
    RegisterComponent,
    TempPassComponent,
    ResetPassComponent,
    AdminDashboardComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    SharedModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    DatePickerModule,
  ],
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: '.my-app-dark',
        },
      },
      translation: {
        dayNamesMin: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      },
    }),
    provideHttpClient(withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthTokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
