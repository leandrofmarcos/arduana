import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number; // em ms, 0 = permanente
  dismissible?: boolean;
}

/**
 * Serviço centralizado para notificações/toasts
 * Permite que componentes exibam mensagens de forma padronizada
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private toasts$ = new BehaviorSubject<ToastMessage[]>([]);
  private nextId = 0;

  getToasts(): Observable<ToastMessage[]> {
    return this.toasts$.asObservable();
  }

  /**
   * Mostrar notificação de sucesso
   */
  success(message: string, title?: string, duration = 5000): void {
    this.show('success', message, title, duration);
  }

  /**
   * Mostrar notificação de erro
   */
  error(message: string, title = 'Erro', duration = 0): void {
    this.show('error', message, title, duration, true);
  }

  /**
   * Mostrar notificação de aviso
   */
  warning(message: string, title?: string, duration = 5000): void {
    this.show('warning', message, title, duration);
  }

  /**
   * Mostrar notificação de informação
   */
  info(message: string, title?: string, duration = 5000): void {
    this.show('info', message, title, duration);
  }

  /**
   * Mostrar notificação customizada
   */
  show(
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    title?: string,
    duration = 5000,
    dismissible = true
  ): string {
    const id = `toast-${this.nextId++}`;

    const toast: ToastMessage = {
      id,
      type,
      title,
      message,
      duration,
      dismissible
    };

    const toasts = this.toasts$.value;
    this.toasts$.next([...toasts, toast]);

    // Auto-remover após duração
    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }

    return id;
  }

  /**
   * Remover notificação específica
   */
  remove(id: string): void {
    const toasts = this.toasts$.value.filter(t => t.id !== id);
    this.toasts$.next(toasts);
  }

  /**
   * Limpar todas as notificações
   */
  clear(): void {
    this.toasts$.next([]);
  }
}
