import { Injectable } from '@angular/core';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts: Toast[] = [];
  private nextId = 1;
  private recentMessages = new Map<string, number>();
  private readonly dedupeWindowMs = 1200;

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration = 4000) {
    const normalizedMessage = (message || '').trim();
    if (!normalizedMessage) {
      return;
    }

    const dedupeKey = `${type}:${normalizedMessage}`;
    const now = Date.now();
    const lastShownAt = this.recentMessages.get(dedupeKey) ?? 0;
    if (now - lastShownAt < this.dedupeWindowMs) {
      return;
    }
    this.recentMessages.set(dedupeKey, now);

    const toast: Toast = { id: this.nextId++, message, type };
    this.toasts.push(toast);
    
    setTimeout(() => {
      this.remove(toast.id);
    }, duration);
  }

  success(message: string) {
    this.show(message, 'success');
  }

  error(message: string) {
    this.show(message, 'error');
  }

  warning(message: string) {
    this.show(message, 'warning');
  }

  info(message: string) {
    this.show(message, 'info');
  }

  remove(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}
