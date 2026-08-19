import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ActionConfig } from '../../../shared/components/action-button/action-button.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  signUpForm = new FormGroup(
    {
      fullName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(10),
        Validators.pattern(
          /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};":\\|,.<>/?]).*$/,
        ),
      ]),
      confirmPassword: new FormControl('', [Validators.required]),
      secretKey: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(10),
        Validators.pattern(
          /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};":\\|,.<>/?]).*$/,
        ),
      ]),
    },
    { validators: this.passwordMatchValidator },
  );

  submitted = false;
  registrationError = '';
  registrationLoading = false;

  passwordVisible = false;
  confirmPasswordVisible = false;
  secretKeyVisible = false;

  registerButtonConfig: ActionConfig = {
    label: 'Register',
    loadingLabel: 'Registering...',
    variant: 'primary',
    disabled: false,
  };

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  passwordMatchValidator(
    group: AbstractControl,
  ): { [key: string]: any } | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');
    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      return { passwordMismatch: true };
    }
    return null;
  }

  get fullName() {
    return this.signUpForm.get('fullName');
  }

  get email() {
    return this.signUpForm.get('email');
  }

  get password() {
    return this.signUpForm.get('password');
  }

  get confirmPassword() {
    return this.signUpForm.get('confirmPassword');
  }

  get secretKey() {
    return this.signUpForm.get('secretKey');
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }

  toggleSecretKeyVisibility() {
    this.secretKeyVisible = !this.secretKeyVisible;
  }

  onRegister() {
    if (this.registrationLoading) {
      return;
    }

    this.submitted = true;
    this.registrationError = '';

    if (!this.signUpForm.valid) {
      return;
    }

    this.registrationLoading = true;

    this.authService
      .register({
        fullName: this.fullName?.value || '',
        email: this.email?.value || '',
        password: this.password?.value || '',
        secretKey: this.secretKey?.value || '',
      })
      .subscribe({
        next: () => {
          this.registrationLoading = false;
          this.router.navigate(['/login']);
        },
        error: (error) => {
          this.registrationLoading = false;
          this.registrationError = error.message;
        },
      });
  }

  get registerActionConfig(): ActionConfig {
    return {
      ...this.registerButtonConfig,
      disabled: this.signUpForm.invalid || this.registrationLoading,
    };
  }
}
