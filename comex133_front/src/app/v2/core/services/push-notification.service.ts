import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom, Subscription } from 'rxjs';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushNotificationService implements OnDestroy {

  private clickSub: Subscription | null = null;

  readonly isSupported = 'serviceWorker' in navigator && 'PushManager' in window;

  constructor(
    private readonly swPush: SwPush,
    private readonly http: HttpClient
  ) {
    this.clickSub = this.swPush.notificationClicks.subscribe(({ notification }) => {
      const url = (notification as any).data?.url as string | undefined;
      if (url) {
        window.open(url, '_self');
      }
    });
  }

  get isEnabled(): boolean {
    return this.swPush.isEnabled;
  }

  get permissionState(): NotificationPermission {
    if (!this.isSupported) return 'denied';
    return Notification.permission;
  }

  async requestAndSubscribe(): Promise<void> {
    if (!this.isSupported) {
      throw new Error('Push notifications não são suportadas neste browser.');
    }
    if (!environment.vapidPublicKey) {
      throw new Error('VAPID public key não configurada.');
    }

    const subscription = await this.swPush.requestSubscription({
      serverPublicKey: environment.vapidPublicKey
    });

    await firstValueFrom(
      this.http.post(`${environment.apiUrl}/push/subscribe`, subscription)
    );
  }

  async sendTestNotification(): Promise<{ sent: number }> {
    return firstValueFrom(
      this.http.post<{ sent: number }>(
        `${environment.apiUrl}/push/send-test`,
        {}
      )
    );
  }

  ngOnDestroy(): void {
    this.clickSub?.unsubscribe();
  }
}
