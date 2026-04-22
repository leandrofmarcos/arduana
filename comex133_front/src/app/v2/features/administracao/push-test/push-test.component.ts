import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PushNotificationService } from '../../../core/services/push-notification.service';

type TestStatus = 'idle' | 'loading' | 'success' | 'error';

@Component({
  selector: 'app-push-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h1>🔔 Teste de Push Notification</h1>
      <p class="subtitle">Valide o fluxo completo de notificações push no browser.</p>
    </div>

    <div class="test-card">

      <!-- Status da permissão -->
      <div class="status-row">
        <span class="status-label">Status da permissão:</span>
        <span class="status-badge" [class]="permissionClass()">
          {{ permissionLabel() }}
        </span>
      </div>

      <!-- Service Worker -->
      <div class="status-row">
        <span class="status-label">Service Worker:</span>
        <span class="status-badge" [class]="push.isEnabled ? 'badge-ok' : 'badge-warn'">
          {{ push.isEnabled ? 'Ativo' : 'Inativo (dev mode ou não suportado)' }}
        </span>
      </div>

      <!-- Suporte a Push -->
      <div class="status-row">
        <span class="status-label">Push API no browser:</span>
        <span class="status-badge" [class]="push.isSupported ? 'badge-ok' : 'badge-error'">
          {{ push.isSupported ? 'Suportado' : 'Não suportado' }}
        </span>
      </div>

      <hr class="divider">

      <!-- Ações -->
      <div class="actions">
        <button
          class="btn btn-primary"
          (click)="activatePush()"
          [disabled]="!push.isSupported || subscribeStatus() === 'loading'"
        >
          <span *ngIf="subscribeStatus() === 'loading'">⏳ Ativando...</span>
          <span *ngIf="subscribeStatus() !== 'loading'">🔔 Ativar Notificações</span>
        </button>

        <button
          class="btn btn-secondary"
          (click)="sendTest()"
          [disabled]="sendStatus() === 'loading'"
        >
          <span *ngIf="sendStatus() === 'loading'">⏳ Enviando...</span>
          <span *ngIf="sendStatus() !== 'loading'">🚀 Enviar Notificação de Teste</span>
        </button>
      </div>

      <!-- Log de resultados -->
      <div class="log-area" *ngIf="log().length > 0">
        <div class="log-title">Log</div>
        <div
          *ngFor="let entry of log()"
          class="log-entry"
          [class.log-ok]="entry.type === 'ok'"
          [class.log-err]="entry.type === 'err'"
          [class.log-info]="entry.type === 'info'"
        >
          <span class="log-time">{{ entry.time }}</span>
          {{ entry.message }}
        </div>
      </div>

      <!-- Instrução iOS -->
      <div class="info-box">
        <strong>ℹ️ iOS Safari:</strong> Requer iOS 16.4+ e a app deve estar instalada via "Adicionar à Tela de Início".
        <br>
        <strong>ℹ️ Firefox:</strong> Suporta push mas não instala como PWA.
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      margin-bottom: 24px;
    }
    .page-header h1 {
      font-size: 22px;
      font-weight: 700;
      color: var(--color-text, #1f2937);
      margin: 0 0 6px;
    }
    .subtitle {
      color: #6b7280;
      font-size: 14px;
      margin: 0;
    }

    .test-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 28px;
      max-width: 620px;
    }

    .status-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .status-label {
      font-size: 13px;
      color: #374151;
      min-width: 180px;
      font-weight: 500;
    }
    .status-badge {
      font-size: 12px;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 999px;
    }
    .badge-ok    { background: #d1fae5; color: #065f46; }
    .badge-warn  { background: #fef3c7; color: #92400e; }
    .badge-error { background: #fee2e2; color: #991b1b; }
    .badge-default { background: #e5e7eb; color: #374151; }

    .divider {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 20px 0;
    }

    .actions {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 20px;
    }
    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: opacity 0.2s;
    }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary  { background: #1d4ed8; color: #fff; }
    .btn-primary:hover:not(:disabled) { background: #1e40af; }
    .btn-secondary { background: #f3f4f6; color: #1f2937; border: 1px solid #d1d5db; }
    .btn-secondary:hover:not(:disabled) { background: #e5e7eb; }

    .log-area {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 14px;
      margin-bottom: 20px;
    }
    .log-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #9ca3af;
      margin-bottom: 8px;
    }
    .log-entry {
      font-size: 13px;
      padding: 4px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .log-entry:last-child { border-bottom: none; }
    .log-time  { color: #9ca3af; margin-right: 8px; font-size: 11px; }
    .log-ok    { color: #065f46; }
    .log-err   { color: #991b1b; }
    .log-info  { color: #1d4ed8; }

    .info-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 12px 16px;
      font-size: 13px;
      color: #1e40af;
      line-height: 1.6;
    }

    @media (max-width: 480px) {
      .test-card { padding: 16px; }
      .status-row { flex-direction: column; align-items: flex-start; gap: 4px; }
      .status-label { min-width: unset; }
      .actions { flex-direction: column; }
      .btn { width: 100%; }
    }
  `]
})
export class PushTestComponent {
  readonly push = inject(PushNotificationService);

  readonly subscribeStatus = signal<TestStatus>('idle');
  readonly sendStatus      = signal<TestStatus>('idle');
  readonly log             = signal<Array<{ time: string; message: string; type: 'ok' | 'err' | 'info' }>>([]);

  permissionClass(): string {
    const p = this.push.permissionState;
    if (p === 'granted') return 'badge-ok';
    if (p === 'denied')  return 'badge-error';
    return 'badge-default';
  }

  permissionLabel(): string {
    const p = this.push.permissionState;
    if (p === 'granted') return '✅ Concedida';
    if (p === 'denied')  return '❌ Negada';
    return '⏳ Não solicitada';
  }

  async activatePush(): Promise<void> {
    if (!this.push.isSupported) {
      this.addLog('err', 'Push API não suportada neste browser.');
      return;
    }
    this.subscribeStatus.set('loading');
    try {
      await this.push.requestAndSubscribe();
      this.subscribeStatus.set('success');
      this.addLog('ok', 'Subscription criada e enviada para a API com sucesso.');
    } catch (err: any) {
      this.subscribeStatus.set('error');
      this.addLog('err', `Erro ao ativar: ${err?.message ?? 'desconhecido'}`);
    }
  }

  async sendTest(): Promise<void> {
    this.sendStatus.set('loading');
    try {
      const result = await this.push.sendTestNotification();
      this.sendStatus.set('success');
      this.addLog('ok', `Notificação enviada! (${result.sent} browser(s) notificado(s), ${result.errors} erro(s))`);
    } catch (err: any) {
      this.sendStatus.set('error');
      this.addLog('err', `Erro ao enviar: ${err?.message ?? 'desconhecido'}`);
    }
  }

  private addLog(type: 'ok' | 'err' | 'info', message: string): void {
    const now = new Date().toLocaleTimeString('pt-BR');
    this.log.update(entries => [{ time: now, message, type }, ...entries]);
  }
}
