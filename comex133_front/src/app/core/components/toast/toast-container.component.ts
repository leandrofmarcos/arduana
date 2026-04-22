import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, ToastMessage } from '../../services/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/**
 * Componente container para exibir toasts/notificações
 * Deve ser incluído uma única vez na aplicação (ex: app.component)
 */
@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toasts"
        [class]="'toast toast-' + toast.type"
        role="alert"
        [attr.aria-live]="toast.type === 'error' ? 'assertive' : 'polite'"
      >
        <div class="toast-content">
          <div class="toast-header" *ngIf="toast.title">
            <span class="toast-icon">
              {{ getIcon(toast.type) }}
            </span>
            <span class="toast-title">{{ toast.title }}</span>
            <button
              *ngIf="toast.dismissible"
              class="toast-close"
              (click)="notificationService.remove(toast.id)"
              aria-label="Fechar notificação"
            >
              ✕
            </button>
          </div>
          <div class="toast-message" [class.no-title]="!toast.title">
            <span *ngIf="!toast.title" class="toast-icon">
              {{ getIcon(toast.type) }}
            </span>
            {{ toast.message }}
            <button
              *ngIf="!toast.title && toast.dismissible"
              class="toast-close"
              (click)="notificationService.remove(toast.id)"
              aria-label="Fechar notificação"
            >
              ✕
            </button>
          </div>
        </div>
        <div
          *ngIf="toast.duration && toast.duration > 0"
          class="toast-progress"
          [style.animation-duration]="toast.duration + 'ms'"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
      pointer-events: none;
    }

    .toast {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      pointer-events: auto;
      overflow: hidden;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(420px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .toast-content {
      padding: 16px;
    }

    .toast-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 8px;
      font-weight: 600;
    }

    .toast-message {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 14px;
      line-height: 1.4;
    }

    .toast-message.no-title {
      font-weight: 500;
    }

    .toast-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .toast-close {
      background: none;
      border: none;
      color: #999;
      font-size: 16px;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
      margin-left: auto;
      flex-shrink: 0;
    }

    .toast-close:hover {
      color: #333;
    }

    .toast-progress {
      height: 3px;
      background: currentColor;
      animation: progress linear forwards;
    }

    @keyframes progress {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }

    /* Variações por tipo */
    .toast-success {
      border-left: 4px solid #10b981;
      color: #10b981;
    }

    .toast-success .toast-close {
      color: #10b981;
    }

    .toast-error {
      border-left: 4px solid #ef4444;
      color: #ef4444;
    }

    .toast-error .toast-close {
      color: #ef4444;
    }

    .toast-warning {
      border-left: 4px solid #f59e0b;
      color: #f59e0b;
    }

    .toast-warning .toast-close {
      color: #f59e0b;
    }

    .toast-info {
      border-left: 4px solid #3b82f6;
      color: #3b82f6;
    }

    .toast-info .toast-close {
      color: #3b82f6;
    }

    @media (max-width: 480px) {
      .toast-container {
        left: 12px;
        right: 12px;
        max-width: none;
      }
    }
  `]
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private destroy$ = new Subject<void>();

  constructor(public notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService
      .getToasts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(toasts => {
        this.toasts = toasts;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  }
}
