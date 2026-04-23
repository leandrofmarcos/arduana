import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationPanelService } from './notification-panel.service';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Botão do sino -->
    <div class="bell-wrapper">
      <button class="bell-btn" (click)="togglePanel()" title="Notificações" aria-label="Abrir painel de notificações">
        🔔
        <span class="badge" *ngIf="panel.unreadCount() > 0">{{ panel.unreadCount() }}</span>
      </button>

      <!-- Painel dropdown -->
      <div class="notif-panel" *ngIf="open()">
        <div class="panel-header">
          <span class="panel-title">Notificações</span>
          <div class="panel-actions">
            <button class="action-link" (click)="panel.markAllRead()" *ngIf="panel.unreadCount() > 0">
              Marcar tudo como lido
            </button>
            <button class="action-link danger" (click)="panel.clear()" *ngIf="panel.notifications().length > 0">
              Limpar
            </button>
          </div>
        </div>

        <div class="panel-body">
          <div *ngIf="panel.notifications().length === 0" class="empty-state">
            Nenhuma notificação
          </div>

          <div
            *ngFor="let n of panel.notifications()"
            class="notif-item"
            [class.unread]="!n.read"
            (click)="panel.markRead(n.id)"
          >
            <div class="notif-dot" *ngIf="!n.read"></div>
            <div class="notif-content">
              <div class="notif-title">{{ n.title }}</div>
              <div class="notif-body" *ngIf="n.body">{{ n.body }}</div>
              <div class="notif-time">{{ n.receivedAt | date:'dd/MM HH:mm' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bell-wrapper {
      position: relative;
    }
    .bell-btn {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 20px;
      padding: 4px 8px;
      border-radius: 6px;
      position: relative;
      line-height: 1;
      transition: background .15s;
    }
    .bell-btn:hover { background: var(--color-secondary, rgba(255,255,255,.1)); }
    .badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #ef4444;
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      min-width: 16px;
      height: 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 3px;
      line-height: 1;
    }
    .notif-panel {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 320px;
      background: var(--color-surface, #fff);
      border: 1px solid var(--color-border, #e5e7eb);
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,.15);
      z-index: 2000;
      overflow: hidden;
    }
    .panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--color-border, #e5e7eb);
      background: var(--color-bg, #f8fafc);
    }
    .panel-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text, #1f2937);
    }
    .panel-actions {
      display: flex;
      gap: 8px;
    }
    .action-link {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 12px;
      color: var(--color-primary, #3b82f6);
      padding: 0;
    }
    .action-link:hover { text-decoration: underline; }
    .action-link.danger { color: #ef4444; }
    .panel-body {
      max-height: 360px;
      overflow-y: auto;
    }
    .empty-state {
      padding: 32px 16px;
      text-align: center;
      color: var(--color-muted, #9ca3af);
      font-size: 14px;
    }
    .notif-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px 16px;
      border-bottom: 1px solid var(--color-border, #e5e7eb);
      cursor: pointer;
      transition: background .1s;
    }
    .notif-item:last-child { border-bottom: none; }
    .notif-item:hover { background: var(--color-bg, #f8fafc); }
    .notif-item.unread { background: #eff6ff; }
    .notif-item.unread:hover { background: #dbeafe; }
    .notif-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-primary, #3b82f6);
      flex-shrink: 0;
      margin-top: 4px;
    }
    .notif-content { flex: 1; min-width: 0; }
    .notif-title {
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text, #1f2937);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .notif-body {
      font-size: 13px;
      color: var(--color-muted, #6b7280);
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .notif-time {
      font-size: 11px;
      color: var(--color-muted, #9ca3af);
      margin-top: 4px;
    }
  `]
})
export class NotificationPanelComponent {
  panel = inject(NotificationPanelService);
  open  = signal(false);

  togglePanel(): void {
    this.open.update(v => !v);
  }
}
