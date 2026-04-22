import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  danger: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly defaultState: ConfirmDialogState = {
    open: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    danger: true
  };

  private resolver: ((confirmed: boolean) => void) | null = null;
  readonly state$ = new BehaviorSubject<ConfirmDialogState>(this.defaultState);

  confirm(config: {
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
  }): Promise<boolean> {
    this.state$.next({
      open: true,
      title: config.title ?? 'Confirmar acao',
      message: config.message,
      confirmText: config.confirmText ?? 'Confirmar',
      cancelText: config.cancelText ?? 'Cancelar',
      danger: config.danger ?? true
    });

    return new Promise((resolve) => {
      this.resolver = resolve;
    });
  }

  close(confirmed: boolean): void {
    this.state$.next(this.defaultState);
    if (this.resolver) {
      this.resolver(confirmed);
      this.resolver = null;
    }
  }
}
