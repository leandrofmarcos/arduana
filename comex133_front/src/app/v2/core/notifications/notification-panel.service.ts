import { Injectable, OnDestroy, inject } from '@angular/core';
import { signal, computed } from '@angular/core';
import { PushNotificationService } from '../services/push-notification.service';
import { Subscription } from 'rxjs';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  receivedAt: Date;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationPanelService implements OnDestroy {

  private push = inject(PushNotificationService);
  private msgSub: Subscription | null = null;

  private readonly _notifications = signal<AppNotification[]>([]);

  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount   = computed(() => this._notifications().filter(n => !n.read).length);

  constructor() {
    this.msgSub = this.push.messages$.subscribe((msg: any) => {
      const payload = msg?.notification ?? msg;
      this.add(
        payload?.title ?? 'Notificação',
        payload?.body  ?? ''
      );
    });
  }

  add(title: string, body: string): void {
    const notification: AppNotification = {
      id: crypto.randomUUID(),
      title,
      body,
      receivedAt: new Date(),
      read: false
    };
    this._notifications.update(list => [notification, ...list]);
  }

  markRead(id: string): void {
    this._notifications.update(list =>
      list.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  markAllRead(): void {
    this._notifications.update(list => list.map(n => ({ ...n, read: true })));
  }

  clear(): void {
    this._notifications.set([]);
  }

  ngOnDestroy(): void {
    this.msgSub?.unsubscribe();
  }
}
