import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DesktopNotificationService {

  readonly isSupported = typeof window !== 'undefined' && 'Notification' in window;

  get permission(): NotificationPermission {
    return this.isSupported ? Notification.permission : 'denied';
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) return 'denied';
    return Notification.requestPermission();
  }

  notify(title: string, options?: NotificationOptions): void {
    if (!this.isSupported || Notification.permission !== 'granted') return;
    const n = new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options
    });
    n.onclick = () => {
      window.focus();
      n.close();
    };
  }
}
