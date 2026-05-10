import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

  passwordVisible = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSignIn() {
    if (!this.signInForm.valid) {
      return;
    }

    const emailValue = this.signInForm.get('email')?.value || '';
    const passwordValue = this.signInForm.get('password')?.value || '';

    this.authService.login(emailValue, passwordValue).subscribe({
      next: (result) => {
        this.loginError = '';
        if (result.isTempPassword) {
          this.router.navigate(['/reset-pass']);
        } else {
          this.router.navigate(['/booking']);
        }
      },
      error: (error) => {
        this.loginError = error.message;
      },
    });
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
