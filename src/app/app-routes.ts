import { Routes } from '@angular/router';
import { BookingComponent } from './features/booking/booking.component';
import { InformationComponent } from './features/information/information.component';
import { NotFoundComponent } from './features/not-found/not-found.component';
import { SignInComponent } from './core/auth/sign-in/sign-in.component';
import { ResetPassComponent } from './core/auth/reset-pass/reset-pass.component';
import { RegisterComponent } from './core/auth/register/register.component';
import { TempPassComponent } from './core/auth/temp-pass/temp-pass.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: SignInComponent,
    data: { showHeader: false },
  },
  {
    path: 'reset-pass',
    component: ResetPassComponent,
    data: { showHeader: false },
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: { showHeader: false },
  },
  {
    path: 'temp-pass',
    component: TempPassComponent,
    data: { showHeader: false },
  },
  {
    path: 'booking',
    component: BookingComponent,
    canActivate: [AuthGuard],
    data: { showHeader: true },
  },
  {
    path: 'info',
    component: InformationComponent,
    canActivate: [AuthGuard],
    data: { showHeader: true },
  },
  {
    path: '**',
    component: NotFoundComponent,
    data: { showHeader: false },
  },
];
