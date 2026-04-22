import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toastService.toasts" 
           class="toast toast-{{toast.type}}"
           (click)="toastService.remove(toast.id)">
        <span class="toast-icon">
          @switch (toast.type) {
            @case ('success') { ✓ }
            @case ('error') { ✕ }
            @case ('warning') { ⚠ }
            @default { ℹ }
          }
        </span>
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" (click)="toastService.remove(toast.id)">×</button>
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
      pointer-events: none;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 18px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,.15);
      min-width: 320px;
      max-width: 500px;
      pointer-events: all;
      cursor: pointer;
      animation: slideIn 0.3s ease;
      border-left: 4px solid;
    }
    @keyframes slideIn {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .toast-success { border-left-color: #22c55e; }
    .toast-error { border-left-color: #ef4444; }
    .toast-warning { border-left-color: #f59e0b; }
    .toast-info { border-left-color: #3b82f6; }
    .toast-icon {
      font-size: 20px;
      font-weight: bold;
      flex-shrink: 0;
    }
    .toast-success .toast-icon { color: #22c55e; }
    .toast-error .toast-icon { color: #ef4444; }
    .toast-warning .toast-icon { color: #f59e0b; }
    .toast-info .toast-icon { color: #3b82f6; }
    .toast-message {
      flex: 1;
      font-size: 14px;
      color: #1f2937;
      line-height: 1.5;
    }
    .toast-close {
      background: none;
      border: none;
      font-size: 24px;
      color: #9ca3af;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      flex-shrink: 0;
    }
    .toast-close:hover {
      color: #6b7280;
    }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
