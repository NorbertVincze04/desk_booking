import { Component, Input, TemplateRef } from '@angular/core';

export interface ErrorConfig {
  message: string;
  type?: 'error' | 'warning' | 'info' | 'success';
  dismissible?: boolean;
  duration?: number;
}

@Component({
  selector: 'app-error-notification',
  templateUrl: './error-notification.component.html',
  styleUrl: './error-notification.component.css',
})
export class ErrorNotificationComponent {
  @Input() config?: ErrorConfig;
  @Input() visible: boolean = true;
  @Input() custom: TemplateRef<any> | null = null;

  dismiss() {
    this.visible = false;
  }
}
