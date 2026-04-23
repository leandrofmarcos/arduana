import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InstallPromptService } from '../services/install-prompt.service';
import { PushNotificationService } from '../services/push-notification.service';

@Component({
  selector: 'app-install-banner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- ── Banner principal de instalação PWA ─────────────────────────── -->
    <div class="install-banner" *ngIf="installSvc.canInstall() && !pushStep()" role="banner" aria-live="polite">
      <div class="banner-inner">
        <img src="icons/icon-192x192.png" alt="Comex 133" class="banner-icon" />
        <div class="banner-text">
          <strong class="banner-title">Instalar Comex 133</strong>
          <span class="banner-desc">Acesse mais rápido, receba notificações e use offline.</span>
        </div>
        <div class="banner-actions">
          <button class="btn-install" (click)="install()">
            <span *ngIf="installing()">Instalando…</span>
            <span *ngIf="!installing()">Instalar</span>
          </button>
          <button class="btn-dismiss" (click)="installSvc.dismiss()" aria-label="Agora não">
            Agora não
          </button>
        </div>
      </div>
    </div>

    <!-- ── Passo 2: pedir permissão de notificações após instalação ────── -->
    <div class="install-banner push-step" *ngIf="pushStep()" role="banner" aria-live="polite">
      <div class="banner-inner">
        <span class="push-icon">🔔</span>
        <div class="banner-text">
          <strong class="banner-title">Ativar notificações</strong>
          <span class="banner-desc">Receba alertas de embarques e atualizações em tempo real.</span>
        </div>
        <div class="banner-actions">
          <button class="btn-install" (click)="enablePush()">
            <span *ngIf="pushLoading()">Ativando…</span>
            <span *ngIf="!pushLoading()">Ativar</span>
          </button>
          <button class="btn-dismiss" (click)="dismissPush()">Depois</button>
        </div>
      </div>
    </div>

    <!-- ── Dica para iOS (sem suporte a beforeinstallprompt) ───────────── -->
    <div class="install-ios-hint" *ngIf="showIosHint()" role="complementary">
      <div class="ios-inner">
        <img src="icons/icon-72x72.png" alt="Comex 133" class="ios-icon" />
        <p class="ios-text">
          Para instalar: toque em <strong>Compartilhar</strong> <span class="ios-share">⬆</span>
          e depois em <strong>Adicionar à Tela Início</strong>.
        </p>
        <button class="ios-close" (click)="dismissIos()" aria-label="Fechar dica">✕</button>
      </div>
    </div>
  `,
  styles: [`
    /* ── Banner base ─────────────────────────────────────────────────── */
    .install-banner {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      z-index: 9000;
      padding: 12px 16px;
      background: var(--color-header-bg, #1f2937);
      border-top: 3px solid #667eea;
      box-shadow: 0 -4px 24px rgba(0,0,0,0.35);
      animation: slideUp 0.35s cubic-bezier(0.34,1.56,0.64,1);
    }
    .install-banner.push-step {
      border-top-color: #10b981;
    }
    @keyframes slideUp {
      from { transform: translateY(100%); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }
    .banner-inner {
      display: flex;
      align-items: center;
      gap: 14px;
      max-width: 700px;
      margin: 0 auto;
    }
    .banner-icon {
      width: 48px; height: 48px;
      border-radius: 10px;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }
    .push-icon {
      font-size: 36px;
      flex-shrink: 0;
    }
    .banner-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    .banner-title {
      font-size: 14px;
      font-weight: 700;
      color: #fff;
      white-space: nowrap;
    }
    .banner-desc {
      font-size: 12px;
      color: #9ca3af;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .banner-actions {
      display: flex;
      gap: 8px;
      flex-shrink: 0;
      align-items: center;
    }
    .btn-install {
      padding: 8px 18px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: opacity 0.15s;
      white-space: nowrap;
    }
    .btn-install:hover { opacity: 0.88; }
    .push-step .btn-install {
      background: linear-gradient(135deg, #10b981, #059669);
    }
    .btn-dismiss {
      padding: 8px 12px;
      background: transparent;
      color: #9ca3af;
      border: 1px solid #374151;
      border-radius: 8px;
      font-size: 12px;
      cursor: pointer;
      transition: color 0.15s;
      white-space: nowrap;
    }
    .btn-dismiss:hover { color: #e5e7eb; }

    /* ── iOS hint ─────────────────────────────────────────────────────── */
    .install-ios-hint {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      z-index: 9000;
      padding: 14px 16px;
      background: #1f2937;
      border-top: 3px solid #667eea;
      box-shadow: 0 -4px 24px rgba(0,0,0,0.3);
      animation: slideUp 0.35s ease;
    }
    .ios-inner {
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: 600px;
      margin: 0 auto;
    }
    .ios-icon { width: 40px; height: 40px; border-radius: 8px; flex-shrink: 0; }
    .ios-text  { flex: 1; font-size: 13px; color: #e5e7eb; margin: 0; line-height: 1.5; }
    .ios-share { font-size: 16px; }
    .ios-close {
      background: none; border: none; color: #9ca3af;
      font-size: 18px; cursor: pointer; padding: 4px 8px;
      flex-shrink: 0;
    }

    /* ── Mobile: stack verticamente ──────────────────────────────────── */
    @media (max-width: 480px) {
      .banner-inner  { flex-wrap: wrap; }
      .banner-text   { min-width: calc(100% - 70px); }
      .banner-desc   { white-space: normal; }
      .banner-actions{ width: 100%; justify-content: flex-end; }
    }
  `]
})
export class InstallBannerComponent {
  installSvc = inject(InstallPromptService);
  pushSvc    = inject(PushNotificationService);

  installing   = signal(false);
  pushStep     = signal(false);
  pushLoading  = signal(false);
  showIosHint  = signal(this._shouldShowIosHint());

  async install(): Promise<void> {
    this.installing.set(true);
    await this.installSvc.install();
    this.installing.set(false);
    // Se instalou (estado mudou para 'installed'), oferecer push
    if (this.installSvc.isInstalled() && this.pushSvc.isSupported) {
      this.pushStep.set(true);
    }
  }

  async enablePush(): Promise<void> {
    if (this.pushLoading()) return;
    this.pushLoading.set(true);
    try {
      await this.pushSvc.requestAndSubscribe();
    } catch { /* silencioso */ }
    this.pushLoading.set(false);
    this.pushStep.set(false);
  }

  dismissPush(): void {
    this.pushStep.set(false);
  }

  dismissIos(): void {
    this.showIosHint.set(false);
    sessionStorage.setItem('ios-hint-dismissed', '1');
  }

  private _shouldShowIosHint(): boolean {
    if (typeof window === 'undefined') return false;
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const dismissed = sessionStorage.getItem('ios-hint-dismissed') === '1';
    return isIos && !isStandalone && !dismissed;
  }
}
