import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PushNotificationService, SubscriptionUserDto } from '../../../core/services/push-notification.service';
import { DesktopNotificationService } from '../../../core/services/desktop-notification.service';
import { RoleService } from '../roles/services/role.service';
import { Role } from '../roles/models/role.models';

type Status = 'idle' | 'loading' | 'success' | 'error';
interface LogEntry { time: string; message: string; type: 'ok' | 'err' | 'info'; }

@Component({
  selector: 'app-push-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h1>Notificacoes -- Administracao</h1>
      <p class="subtitle">Configure e envie push notifications.</p>
    </div>

    <!-- STATUS -->
    <div class="card">
      <div class="card-title">Status do Ambiente</div>
      <div class="status-grid">
        <div class="status-row">
          <span class="status-label">Permissao push:</span>
          <span class="badge" [class]="permBadge()">{{ permLabel() }}</span>
        </div>
        <div class="status-row">
          <span class="status-label">Service Worker:</span>
          <span class="badge" [class]="push.isEnabled ? 'badge-ok' : 'badge-warn'">
            {{ push.isEnabled ? 'Ativo' : 'Inativo (dev/nao suportado)' }}
          </span>
        </div>
        <div class="status-row">
          <span class="status-label">Push API:</span>
          <span class="badge" [class]="push.isSupported ? 'badge-ok' : 'badge-error'">
            {{ push.isSupported ? 'Suportado' : 'Nao suportado' }}
          </span>
        </div>
        <div class="status-row">
          <span class="status-label">Notificacoes desktop:</span>
          <span class="badge" [class]="desktopPermBadge()">{{ desktopPermLabel() }}</span>
        </div>
      </div>
      <button class="btn btn-outline mt-12" (click)="activatePush()"
        [disabled]="!push.isSupported || subStatus() === 'loading'">
        <span *ngIf="subStatus() === 'loading'">Ativando...</span>
        <span *ngIf="subStatus() !== 'loading'">Ativar Push Notifications (PWA)</span>
      </button>
    </div>

    <!-- ENVIO AVANCADO -->
    <div class="card">
      <div class="card-title">Enviar Push Notification</div>

      <div class="form-group">
        <label>Titulo</label>
        <input type="text" [(ngModel)]="form.title" placeholder="Comex 133" class="input" />
      </div>
      <div class="form-group">
        <label>Mensagem</label>
        <input type="text" [(ngModel)]="form.message" placeholder="Dados atualizados!" class="input" />
      </div>

      <div class="form-group">
        <label>Destinatario</label>
        <div class="radio-group">
          <label class="radio-label"><input type="radio" [(ngModel)]="form.targetType" value="all" /> Todos</label>
          <label class="radio-label"><input type="radio" [(ngModel)]="form.targetType" value="user" /> Por Usuario</label>
          <label class="radio-label"><input type="radio" [(ngModel)]="form.targetType" value="role" /> Por Role</label>
        </div>
      </div>

      <div class="form-group" *ngIf="form.targetType === 'user'">
        <label>Selecionar Usuario</label>
        <select [(ngModel)]="form.targetId" class="input">
          <option value="">-- selecione --</option>
          <option *ngFor="let u of subscribers()" [value]="u.userId">{{ u.userEmail }}</option>
        </select>
        <span class="hint" *ngIf="subscribers().length === 0">Nenhum usuario com subscription ativa.</span>
      </div>

      <div class="form-group" *ngIf="form.targetType === 'role'">
        <label>Selecionar Role</label>
        <select [(ngModel)]="form.targetId" class="input">
          <option value="">-- selecione --</option>
          <option *ngFor="let r of roles" [value]="r.nome">{{ r.nome }}</option>
        </select>
      </div>

      <button class="btn btn-primary" (click)="sendPush()" [disabled]="sendStatus() === 'loading'">
        <span *ngIf="sendStatus() === 'loading'">Enviando...</span>
        <span *ngIf="sendStatus() !== 'loading'">Enviar Notificacao</span>
      </button>
    </div>

    <!-- DESKTOP -->
    <div class="card">
      <div class="card-title">Notificacoes Desktop (sem PWA)</div>
      <p class="card-desc">Usa a Notifications API diretamente. Funciona em qualquer aba aberta, inclusive em ng serve sem HTTPS.</p>
      <div class="status-row mb-12">
        <span class="status-label">Permissao desktop:</span>
        <span class="badge" [class]="desktopPermBadge()">{{ desktopPermLabel() }}</span>
      </div>
      <div class="btn-row">
        <button class="btn btn-outline" (click)="activateDesktop()"
          [disabled]="desktop.permission === 'granted' || desktopActivating()">
          <span *ngIf="desktopActivating()">Solicitando...</span>
          <span *ngIf="!desktopActivating()">Ativar Notificacoes Desktop</span>
        </button>
        <button class="btn btn-secondary" (click)="sendDesktop()"
          [disabled]="desktop.permission !== 'granted'">
          Disparar Notificacao Local de Teste
        </button>
      </div>
    </div>

    <!-- LOG -->
    <div class="card" *ngIf="log().length > 0">
      <div class="card-title">Log</div>
      <div class="log-list">
        <div *ngFor="let e of log()" class="log-entry"
          [class.ok]="e.type === 'ok'"
          [class.err]="e.type === 'err'"
          [class.info]="e.type === 'info'">
          <span class="log-time">{{ e.time }}</span> {{ e.message }}
        </div>
      </div>
    </div>

    <div class="info-box">
      <strong>iOS Safari:</strong> Requer iOS 16.4+ e app instalada via Adicionar a Tela de Inicio.
      <br><strong>Firefox:</strong> Suporta push mas nao instala como PWA.
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 24px; }
    .page-header h1 { font-size: 22px; font-weight: 700; color: var(--color-text,#1f2937); margin: 0 0 6px; }
    .subtitle { color: #6b7280; margin: 0; font-size: 14px; }
    .card { background: var(--color-surface,#fff); border: 1px solid var(--color-border,#e5e7eb); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
    .card-title { font-size: 16px; font-weight: 600; color: var(--color-text,#1f2937); margin-bottom: 14px; }
    .card-desc { color: #6b7280; font-size: 14px; margin: -8px 0 14px; }
    .status-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }
    .status-row { display: flex; align-items: center; gap: 8px; }
    .status-label { font-size: 14px; color: #374151; min-width: 180px; }
    .badge { font-size: 12px; padding: 2px 8px; border-radius: 12px; font-weight: 500; }
    .badge-ok    { background: #d1fae5; color: #065f46; }
    .badge-warn  { background: #fef3c7; color: #92400e; }
    .badge-error { background: #fee2e2; color: #991b1b; }
    .badge-info  { background: #e0e7ff; color: #3730a3; }
    .form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; }
    .form-group label { font-size: 13px; font-weight: 500; color: #374151; }
    .input { padding: 8px 12px; border: 1px solid var(--color-border,#e5e7eb); border-radius: 8px; font-size: 14px; outline: none; }
    .input:focus { border-color: var(--color-primary,#3b82f6); }
    .radio-group { display: flex; gap: 16px; flex-wrap: wrap; }
    .radio-label { display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer; }
    .hint { font-size: 12px; color: #9ca3af; }
    .btn { padding: 9px 18px; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer; transition: opacity .15s; }
    .btn:disabled { opacity: .5; cursor: not-allowed; }
    .btn-primary   { background: var(--color-primary,#3b82f6); color: #fff; }
    .btn-secondary { background: #6b7280; color: #fff; }
    .btn-outline   { background: transparent; border: 1px solid var(--color-primary,#3b82f6); color: var(--color-primary,#3b82f6); }
    .btn-row { display: flex; gap: 10px; flex-wrap: wrap; }
    .mt-12 { margin-top: 12px; }
    .mb-12 { margin-bottom: 12px; }
    .log-list { display: flex; flex-direction: column; gap: 4px; max-height: 200px; overflow-y: auto; }
    .log-entry { font-size: 13px; padding: 4px 8px; border-radius: 4px; }
    .log-entry.ok   { background: #d1fae5; color: #065f46; }
    .log-entry.err  { background: #fee2e2; color: #991b1b; }
    .log-entry.info { background: #e0e7ff; color: #3730a3; }
    .log-time { opacity: .6; margin-right: 6px; }
    .info-box { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 12px 16px; font-size: 13px; color: #0c4a6e; }
  `]
})
export class PushTestComponent implements OnInit {
  push    = inject(PushNotificationService);
  desktop = inject(DesktopNotificationService);
  roleSvc = inject(RoleService);

  subStatus         = signal<Status>('idle');
  sendStatus        = signal<Status>('idle');
  desktopActivating = signal(false);
  log               = signal<LogEntry[]>([]);
  subscribers       = signal<SubscriptionUserDto[]>([]);
  roles: Role[]     = [];

  form = {
    title:      'Comex 133',
    message:    'Dados atualizados!',
    targetType: 'all' as 'all' | 'user' | 'role',
    targetId:   ''
  };

  ngOnInit(): void {
    this.roles = this.roleSvc.getAll();
    this.loadSubscribers();
  }

  async loadSubscribers(): Promise<void> {
    try {
      const list = await this.push.getSubscriptions();
      this.subscribers.set(list);
    } catch { /* silencioso */ }
  }

  async activatePush(): Promise<void> {
    this.subStatus.set('loading');
    try {
      await this.push.requestAndSubscribe();
      this.subStatus.set('success');
      this.addLog('ok', 'Push ativado com sucesso.');
      await this.loadSubscribers();
    } catch (e: any) {
      this.subStatus.set('error');
      this.addLog('err', e?.message ?? 'Erro ao ativar push.');
    }
  }

  async sendPush(): Promise<void> {
    if (!this.form.title.trim() || !this.form.message.trim()) {
      this.addLog('err', 'Preencha titulo e mensagem.');
      return;
    }
    this.sendStatus.set('loading');
    try {
      const res = await this.push.sendNotification({
        targetType: this.form.targetType,
        targetId:   this.form.targetId || undefined,
        title:      this.form.title,
        message:    this.form.message
      });
      this.sendStatus.set('success');
      this.addLog('ok', `Enviado: ${res.sent} | Erros: ${res.errors}`);
    } catch (e: any) {
      this.sendStatus.set('error');
      this.addLog('err', e?.message ?? 'Erro ao enviar.');
    }
  }

  async activateDesktop(): Promise<void> {
    this.desktopActivating.set(true);
    const perm = await this.desktop.requestPermission();
    this.desktopActivating.set(false);
    if (perm === 'granted') {
      this.addLog('ok', 'Permissao desktop concedida.');
    } else {
      this.addLog('err', `Permissao desktop: ${perm}.`);
    }
  }

  sendDesktop(): void {
    this.desktop.notify(this.form.title, { body: this.form.message });
    this.addLog('info', 'Notificacao desktop disparada localmente.');
  }

  permBadge(): string {
    const p = this.push.permissionState;
    return p === 'granted' ? 'badge-ok' : p === 'denied' ? 'badge-error' : 'badge-warn';
  }
  permLabel(): string {
    const p = this.push.permissionState;
    return p === 'granted' ? 'Concedida' : p === 'denied' ? 'Negada' : 'Nao solicitada';
  }
  desktopPermBadge(): string {
    const p = this.desktop.permission;
    return p === 'granted' ? 'badge-ok' : p === 'denied' ? 'badge-error' : 'badge-warn';
  }
  desktopPermLabel(): string {
    const p = this.desktop.permission;
    return p === 'granted' ? 'Concedida' : p === 'denied' ? 'Negada' : 'Nao solicitada';
  }

  private addLog(type: LogEntry['type'], message: string): void {
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.log.update(l => [{ time, message, type }, ...l].slice(0, 50));
  }
}
