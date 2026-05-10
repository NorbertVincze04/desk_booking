import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onGenerateTempPassword() {
    if (!this.tempPassForm.valid) {
      return;
    }

    const email = this.tempPassForm.get('email')?.value || '';
    const secretKey = this.tempPassForm.get('secretKey')?.value || '';

    this.authService.generateTempPassword(email, secretKey).subscribe({
      next: (tempPassword) => {
        this.generatedPassword = tempPassword;
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.generatedPassword = '';
      },
    });
  }

  onBackToSignIn() {
    this.router.navigate(['/login']);
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.generatedPassword).then(() => {
      // Could add a toast notification here
    });
  }
}
