import { Component, OnInit, OnDestroy, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../features/auth/auth.providers';
import { filter, Subscription } from 'rxjs';


@Component({
  selector: 'app-shell-v2',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="wrapper" [class.sidebar-collapsed]="collapsed()" [class.sidebar-open]="isMobile() && drawerOpen()">
      <div class="sidebar-overlay" (click)="closeMobileDrawer()"></div>
      <header class="main-header">
        <div class="brand-area">
          <button class="sidebar-toggle" (click)="toggleSidebar()">☰</button>
          <span class="brand">Aduana <span class="brand-v2">V2</span></span>
        </div>
        <div class="nav-actions">
          <a routerLink="/profile" class="profile-link hide-mobile" title="Meu Perfil">{{ auth.currentUser?.username }}</a>
          <button class="logout" (click)="logout()">Sair</button>
        </div>
      </header>

      <aside class="main-sidebar">
        <div class="user-panel">
          <div class="avatar">👤</div>
          <div class="info">
            <div class="name">{{ auth.currentUser?.username }}</div>
            <span class="role-label">{{ auth.currentUser?.role }}</span>
          </div>
        </div>

        <nav class="menu">
          <!-- Principal -->
          <div class="menu-group">
            <div class="menu-title">Principal</div>
            <a routerLink="/dashboard" routerLinkActive="active">
              <span class="icon">📊</span><span>Dashboard</span>
            </a>
          </div>

          <!-- Operação -->
          <div class="menu-group">
            <div class="menu-title">Operação</div>
            <a routerLink="/solicitacoes" routerLinkActive="active">
              <span class="icon">📋</span><span>Solicitações</span>
            </a>
            <a routerLink="/custos" routerLinkActive="active">
              <span class="icon">🧾</span><span>Custos (Despachante)</span>
            </a>
            <a routerLink="/orcamentos-venda" routerLinkActive="active">
              <span class="icon">💼</span><span>Orçamentos de Venda</span>
            </a>
            <a routerLink="/embarques" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
              <span class="icon">🚢</span><span>Embarques</span>
            </a>
            <a routerLink="/embarques" [queryParams]="{acompanhamento:'1'}" routerLinkActive="active">
              <span class="icon">🗂️</span><span>Embarques Acompanhamento</span>
            </a>
          </div>

          <!-- Logística -->
          <div class="menu-group">
            <div class="menu-title">Logística</div>
            <a routerLink="/controle-navios" routerLinkActive="active">
              <span class="icon">⚓</span><span>Controle de Navios</span>
            </a>
          </div>

          <!-- Cadastros -->
          <div class="menu-group">
            <div class="menu-title">Cadastros</div>
            <a routerLink="/portos-origem" routerLinkActive="active">
              <span class="icon">🌐</span><span>Portos Origem</span>
            </a>
            <a routerLink="/portos-destino" routerLinkActive="active">
              <span class="icon">🏢</span><span>Portos Destino</span>
            </a>
            <a routerLink="/clientes" routerLinkActive="active">
              <span class="icon">👥</span><span>Clientes</span>
            </a>
            <a routerLink="/importadores" routerLinkActive="active">
              <span class="icon">📦</span><span>Importadores</span>
            </a>
            <a routerLink="/exportadores" routerLinkActive="active">
              <span class="icon">🚀</span><span>Exportadores</span>
            </a>
            <a routerLink="/agentes-carga" routerLinkActive="active">
              <span class="icon">🤝</span><span>Agentes de Carga</span>
            </a>
            <a routerLink="/fabricantes" routerLinkActive="active">
              <span class="icon">🏭</span><span>Fabricantes</span>
            </a>
            <a routerLink="/ncm" routerLinkActive="active">
              <span class="icon">🔖</span><span>NCM</span>
            </a>
            <a routerLink="/lista-preco-lcl" routerLinkActive="active">
              <span class="icon">💲</span><span>Lista Preço LCL</span>
            </a>
            <a routerLink="/despachantes" routerLinkActive="active">
              <span class="icon">🧭</span><span>Despachantes</span>
            </a>
            <a routerLink="/navios" routerLinkActive="active">
              <span class="icon">🚢</span><span>Navios</span>
            </a>
            <a routerLink="/despesas-cadastro" routerLinkActive="active">
              <span class="icon">💰</span><span>Despesas — Catálogo</span>
            </a>
            <a routerLink="/modelos-despesa" routerLinkActive="active">
              <span class="icon">📋</span><span>Modelos de Despesas</span>
            </a>
          </div>

          <!-- Administração -->
          <div class="menu-group">
            <div class="menu-title">Administração</div>
            <a *ngIf="auth.hasRole('admin')" routerLink="/admin/roles" routerLinkActive="active">
              <span class="icon">🛡️</span><span>Roles</span>
            </a>
            <a *ngIf="auth.hasRole('admin')" routerLink="/admin/usuarios" routerLinkActive="active">
              <span class="icon">👤</span><span>Usuários</span>
            </a>
            <a routerLink="/documentos" routerLinkActive="active">
              <span class="icon">📁</span><span>Documentos</span>
            </a>
          </div>

        </nav>
      </aside>

      <main class="content-wrapper">
        <section class="content">
          <router-outlet></router-outlet>
        </section>
      </main>

      <footer class="main-footer">
        <span>© {{ year }} • Aduana V2</span>
        <span>v2.0.0</span>
      </footer>
    </div>
  `,
  styles: [`
    .wrapper {
      display: grid;
      grid-template-columns: 260px 1fr;
      grid-template-rows: 56px 1fr 40px;
      height: 100vh;
      background: var(--color-bg);
    }
    .main-header {
      grid-column: 1 / -1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--color-header-bg);
      color: #fff;
      padding: 0 16px;
    }
    .brand-area { display: flex; align-items: center; gap: 12px; }
    .sidebar-toggle {
      background: var(--color-secondary);
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 6px 10px;
      cursor: pointer;
    }
    .brand { font-weight: 800; font-size: 16px; }
    .brand-v2 {
      background: var(--color-primary, #3b82f6);
      color: #fff;
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 4px;
      vertical-align: middle;
    }
    .nav-actions { display: flex; align-items: center; gap: 10px; }
    .profile-link {
      color: #fff;
      text-decoration: none;
      padding: 6px 10px;
      border-radius: 6px;
      transition: .2s;
    }
    .profile-link:hover { background: var(--color-secondary); }
    .logout {
      background: var(--color-danger);
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 6px 10px;
      cursor: pointer;
    }
    .main-sidebar {
      grid-row: 2 / span 1;
      background: var(--color-sidebar-bg);
      color: var(--color-sidebar-text);
      display: flex;
      flex-direction: column;
      overflow-y: auto;
      border-right: 1px solid rgba(0,0,0,.1);
    }
    .user-panel {
      display: flex;
      gap: 10px;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid rgba(255,255,255,.08);
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-header-bg);
    }
    .name { font-size: 14px; font-weight: 600; }
    .role-label { color: var(--color-muted); font-size: 12px; }
    .menu { display: flex; flex-direction: column; padding: 8px; }
    .menu-group { display: flex; flex-direction: column; margin-bottom: 10px; }
    .menu-title {
      font-size: 11px;
      color: var(--color-muted);
      text-transform: uppercase;
      letter-spacing: .8px;
      margin: 6px 12px;
    }
    .menu a {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--color-sidebar-text);
      text-decoration: none;
      padding: 8px 12px;
      border-radius: 8px;
      transition: .15s;
      font-size: 14px;
    }
    .menu a:hover, .menu a.active { background: var(--color-header-bg); }
    .icon { font-size: 16px; min-width: 20px; text-align: center; }
    .content-wrapper { background: var(--color-bg); overflow: auto; }
    .content { padding: 24px; }
    .main-footer {
      grid-column: 1 / -1;
      background: var(--color-surface);
      border-top: 1px solid var(--color-border);
      color: var(--color-muted);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      font-size: 12px;
    }
    .sidebar-collapsed { grid-template-columns: 64px 1fr; }
    .sidebar-collapsed .menu a span:last-child { display: none; }
    .sidebar-collapsed .menu-title { display: none; }
    .sidebar-collapsed .user-panel .info { display: none; }

    /* ===== OVERLAY (mobile) ===== */
    .sidebar-overlay {
      display: none;
    }

    /* ===== RESPONSIVE: TABLET E MOBILE (≤768px) ===== */
    @media (max-width: 768px) {
      .wrapper {
        grid-template-columns: 1fr;
        grid-template-rows: 56px 1fr 40px;
      }
      .main-sidebar {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        height: 100dvh;
        width: 280px;
        z-index: 1000;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
        grid-row: unset;
        border-right: none;
      }
      .wrapper.sidebar-open .main-sidebar {
        transform: translateX(0);
        box-shadow: 4px 0 20px rgba(0,0,0,0.3);
      }
      .sidebar-overlay {
        display: none;
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        z-index: 999;
      }
      .wrapper.sidebar-open .sidebar-overlay {
        display: block;
      }
      /* Colapso não deve reduzir o grid em mobile */
      .sidebar-collapsed { grid-template-columns: 1fr; }
      .content { padding: 16px; }
      .main-footer { grid-column: 1; }
    }

    /* ===== RESPONSIVE: MOBILE PEQUENO (≤480px) ===== */
    @media (max-width: 480px) {
      .content { padding: 12px; }
      .brand { font-size: 14px; }
      .main-footer { font-size: 11px; padding: 0 12px; }
    }
  `]
})
export class ShellV2Component implements OnInit, OnDestroy {
  collapsed = signal(false);
  isMobile = signal(false);
  drawerOpen = signal(false);
  readonly year = new Date().getFullYear();

  private routerSub?: Subscription;

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.checkMobile();
    // Fecha o drawer ao navegar em mobile
    this.routerSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        if (this.isMobile()) this.drawerOpen.set(false);
      });
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkMobile();
    if (!this.isMobile()) this.drawerOpen.set(false);
  }

  private checkMobile(): void {
    this.isMobile.set(window.innerWidth <= 768);
  }

  toggleSidebar(): void {
    if (this.isMobile()) {
      this.drawerOpen.update(v => !v);
    } else {
      this.collapsed.update(v => !v);
    }
  }

  closeMobileDrawer(): void {
    this.drawerOpen.set(false);
  }

  logout(): void {
    this.auth.logout().subscribe(() => {
      this.router.navigate(['/login']);
    });
  }
}
