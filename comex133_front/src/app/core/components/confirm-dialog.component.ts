import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConfirmDialogService, ConfirmDialogState } from '../services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .confirm-overlay {
      position: fixed;
      inset: 0;
      z-index: 1600;
      background: rgba(15, 23, 42, .45);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .confirm-card {
      width: min(440px, 100%);
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 22px 44px rgba(15, 23, 42, .28);
      padding: 18px;
    }
    .confirm-card h3 {
      margin: 0 0 8px;
      color: #0f172a;
      font-size: 17px;
    }
    .confirm-card p {
      margin: 0;
      color: #334155;
      font-size: 14px;
      line-height: 1.45;
      white-space: pre-line;
    }
    .confirm-actions {
      margin-top: 16px;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    .btn {
      border: none;
      border-radius: 8px;
      cursor: pointer;
      padding: 8px 14px;
      font-weight: 700;
      font-size: 13px;
    }
    .btn-cancel {
      background: #e2e8f0;
      color: #0f172a;
    }
    .btn-confirm {
      background: #1d4ed8;
      color: #fff;
    }
    .btn-danger {
      background: #b91c1c;
      color: #fff;
    }
  `],
  template: `
    <div class="confirm-overlay" *ngIf="state.open" (click)="close(false)">
      <div class="confirm-card" (click)="$event.stopPropagation()">
        <h3>{{ state.title }}</h3>
        <p>{{ state.message }}</p>
        <div class="confirm-actions">
          <button class="btn btn-cancel" type="button" (click)="close(false)">
            {{ state.cancelText }}
          </button>
          <button
            class="btn"
            type="button"
            [ngClass]="state.danger ? 'btn-danger' : 'btn-confirm'"
            (click)="close(true)">
            {{ state.confirmText }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmDialogComponent implements OnInit, OnDestroy {
  state: ConfirmDialogState = {
    open: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    danger: true
  };

  private readonly subs = new Subscription();

  constructor(private confirmDialog: ConfirmDialogService) {}

  ngOnInit(): void {
    this.subs.add(this.confirmDialog.state$.subscribe((state) => this.state = state));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  close(confirmed: boolean): void {
    this.confirmDialog.close(confirmed);
  }
}
