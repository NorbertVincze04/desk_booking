import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ActionConfig } from '../../../shared/components/action-button/action-button.component';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.css',
})
export class SignInComponent {
  signInForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  loginError = '';
  signInLoading = false;

  passwordVisible = false;

  signInButtonConfig: ActionConfig = {
    label: 'Sign In',
    loadingLabel: 'Signing in...',
    variant: 'primary',
    disabled: false,
  };

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSignIn() {
    if (this.signInLoading) {
      return;
    }

    if (!this.signInForm.valid) {
      return;
    }

    this.signInLoading = true;

    const emailValue = this.signInForm.get('email')?.value || '';
    const passwordValue = this.signInForm.get('password')?.value || '';

    this.authService.login(emailValue, passwordValue).subscribe({
      next: (result) => {
        this.signInLoading = false;
        this.loginError = '';
        if (result.isTempPassword) {
          this.router.navigate(['/reset-pass']);
        } else {
          this.router.navigate(['/booking']);
        }
      },
      error: (error) => {
        this.signInLoading = false;
        this.loginError = error.message;
      },
    });
  }

  get signInActionConfig(): ActionConfig {
    return {
      ...this.signInButtonConfig,
      disabled: this.signInForm.invalid || this.signInLoading,
    };
  }

  onForgotPassword() {
    this.router.navigate(['/temp-pass']);
  }

  onRegister() {
    this.router.navigate(['/register']);
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
}
