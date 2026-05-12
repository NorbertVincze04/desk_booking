import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-pass',
  templateUrl: './reset-pass.component.html',
  styleUrl: './reset-pass.component.css',
})
export class ResetPassComponent implements OnInit {
  passwordMatchValidator: ValidatorFn = (
    control: AbstractControl,
  ): ValidationErrors | null => {
    const newPassword = control.get('newPassword')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  };

  resetPassForm = new FormGroup(
    {
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(10),
        Validators.pattern(
          /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};":\\|,.<>/?]).*$/,
        ),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    { validators: this.passwordMatchValidator },
  );

  errorMessage = '';
  newPasswordVisible = false;
  confirmPasswordVisible = false;
  submitted = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe((user) => {
      if (!user) {
        this.router.navigate(['/login']);
      }
    });
  }

  onResetPassword() {
    this.submitted = true;
    this.errorMessage = '';
    if (!this.resetPassForm.valid) {
      return;
    }

    const newPassword = this.resetPassForm.get('newPassword')?.value || '';

    this.authService.resetPassword(newPassword).subscribe({
      next: () => {
        this.router.navigate(['/booking']);
      },
      error: (error) => {
        this.errorMessage = error.message;
      },
    });
  }

  onCancel() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  toggleNewPasswordVisibility() {
    this.newPasswordVisible = !this.newPasswordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  get newPassword() {
    return this.resetPassForm.get('newPassword');
  }

  get confirmPassword() {
    return this.resetPassForm.get('confirmPassword');
  }
}
