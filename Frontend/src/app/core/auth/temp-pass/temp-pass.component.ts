import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ActionConfig } from '../../../shared/components/action-button/action-button.component';

@Component({
  selector: 'app-temp-pass',
  templateUrl: './temp-pass.component.html',
  styleUrl: './temp-pass.component.css',
})
export class TempPassComponent {
  tempPassForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    secretKey: new FormControl('', [Validators.required]),
  });

  generatedPassword = '';
  errorMessage = '';
  secretKeyVisible = false;
  tempPasswordLoading = false;

  generateButtonConfig: ActionConfig = {
    label: 'Generate Temporary Password',
    loadingLabel: 'Generating...',
    variant: 'primary',
    disabled: false,
  };

  copyButtonConfig: ActionConfig = {
    label: 'Copy',
    variant: 'secondary',
    disabled: false,
  };

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onGenerateTempPassword() {
    if (this.tempPasswordLoading) {
      return;
    }

    if (!this.tempPassForm.valid) {
      return;
    }

    this.tempPasswordLoading = true;

    const email = this.tempPassForm.get('email')?.value || '';
    const secretKey = this.tempPassForm.get('secretKey')?.value || '';

    this.authService.generateTempPassword(email, secretKey).subscribe({
      next: (tempPassword) => {
        this.tempPasswordLoading = false;
        this.generatedPassword = tempPassword;
        this.errorMessage = '';
      },
      error: (error) => {
        this.tempPasswordLoading = false;
        this.errorMessage = error.message;
        this.generatedPassword = '';
      },
    });
  }

  onBackToSignIn() {
    this.router.navigate(['/login']);
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.generatedPassword).then(() => {});
  }

  togglePasswordVisibility() {
    this.secretKeyVisible = !this.secretKeyVisible;
  }

  get generateActionConfig(): ActionConfig {
    return {
      ...this.generateButtonConfig,
      disabled: this.tempPassForm.invalid || this.tempPasswordLoading,
    };
  }
}
