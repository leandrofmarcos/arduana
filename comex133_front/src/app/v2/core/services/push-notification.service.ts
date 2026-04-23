import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface SendPushRequest {
  targetType: 'all' | 'user' | 'role';
  targetId?: string;
  title: string;
  message: string;
}

export interface SubscriptionUserDto {
  userId: string;
  userEmail: string;
}

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

  get messages$() {
    return this.swPush.messages;
  }

  /**
   * Tenta se inscrever automaticamente.
   * - Se permissão já concedida: registra subscription silenciosamente.
   * - Se permissão não solicitada (default): retorna false — o chamador deve exibir um prompt.
   * - Se permissão negada ou SW desabilitado: retorna false, sem ação.
   */
  async tryAutoSubscribe(): Promise<boolean> {
    if (!this.isSupported || !this.swPush.isEnabled) return false;
    if (Notification.permission !== 'granted') return false;
    try {
      await this.requestAndSubscribe();
      return true;
    } catch {
      return false;
    }
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

  async sendNotification(request: SendPushRequest): Promise<{ sent: number; errors: number }> {
    return firstValueFrom(
      this.http.post<{ sent: number; errors: number }>(
        `${environment.apiUrl}/push/send`,
        request
      )
    );
  }

  /** @deprecated Use sendNotification() com targetType:'all' */
  async sendTestNotification(): Promise<{ sent: number; errors: number }> {
    return firstValueFrom(
      this.http.post<{ sent: number; errors: number }>(
        `${environment.apiUrl}/push/send-test`,
        {}
      )
    );
  }

  async getSubscriptions(): Promise<SubscriptionUserDto[]> {
    return firstValueFrom(
      this.http.get<SubscriptionUserDto[]>(`${environment.apiUrl}/push/subscriptions`)
    );
  }

  ngOnDestroy(): void {
    this.clickSub?.unsubscribe();
  }
}

