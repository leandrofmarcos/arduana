import { Injectable, signal, computed } from '@angular/core';

const STORAGE_KEY = 'pwa-install-dismissed-until';
const DISMISS_DAYS = 7; // não mostrar de novo por 7 dias após "agora não"

export type InstallState = 'unavailable' | 'available' | 'installing' | 'installed' | 'dismissed';

@Injectable({ providedIn: 'root' })
export class InstallPromptService {
  private _deferredEvent: any = null;
  private _state = signal<InstallState>(this._initialState());

  readonly state = this._state.asReadonly();
  readonly canInstall = computed(() => this._state() === 'available');
  readonly isInstalled = computed(() => this._state() === 'installed');

  constructor() {
    if (typeof window === 'undefined') return;

    // Chrome/Edge/Android: captura o evento antes de ele ser disparado
    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this._deferredEvent = e;
      if (this._state() !== 'dismissed') {
        this._state.set('available');
      }
    });

    // Detecta se já foi instalado (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this._state.set('installed');
    }

    // Notifica quando o usuário instala pelo banner do browser
    window.addEventListener('appinstalled', () => {
      this._deferredEvent = null;
      this._state.set('installed');
      localStorage.removeItem(STORAGE_KEY);
    });
  }

  /** Abre o prompt nativo de instalação (Chrome/Edge/Android) */
  async install(): Promise<void> {
    if (!this._deferredEvent) return;
    this._state.set('installing');
    try {
      this._deferredEvent.prompt();
      const choice = await this._deferredEvent.userChoice;
      if (choice?.outcome === 'accepted') {
        this._state.set('installed');
      } else {
        // Recusou no prompt nativo: volta para 'available' para poder tentar de novo
        this._state.set('available');
      }
    } catch {
      this._state.set('available');
    }
    this._deferredEvent = null;
  }

  /** O usuário clicou "Agora não": oculta por DISMISS_DAYS dias */
  dismiss(): void {
    const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, String(until));
    this._state.set('dismissed');
  }

  /** Reseta o dismiss (útil para testes) */
  resetDismiss(): void {
    localStorage.removeItem(STORAGE_KEY);
    if (this._deferredEvent) {
      this._state.set('available');
    }
  }

  private _initialState(): InstallState {
    if (typeof window === 'undefined') return 'unavailable';
    if (window.matchMedia('(display-mode: standalone)').matches) return 'installed';
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw && Date.now() < Number(raw)) return 'dismissed';
    return 'unavailable'; // 'available' será setado quando beforeinstallprompt disparar
  }
}
