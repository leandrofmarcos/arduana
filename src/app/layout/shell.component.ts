import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="wrapper" [class.sidebar-collapsed]="collapsed">
      <header class="main-header">
        <div class="brand-area">
          <button class="sidebar-toggle" (click)="toggleSidebar()">☰</button>
          <span class="brand">Importação</span>
        </div>
        <div class="nav-actions">
          <span class="user-name">{{auth.currentUser?.username}}</span>
          <button class="logout" (click)="logout()">Sair</button>
        </div>
      </header>
      <aside class="main-sidebar">
        <div class="user-panel">
          <div class="avatar">👤</div>
          <div class="info">
            <div class="name">{{auth.currentUser?.username}}</div>
            <div class="role">Usuário</div>
          </div>
        </div>
        <nav class="menu">
          <a routerLink="/importacao" routerLinkActive="active"><span class="icon">📊</span><span>Planilha</span></a>
        </nav>
      </aside>
      <main class="content-wrapper">
        <section class="content-header">
          <h1>Planilha <small>Gestão de Custos</small></h1>
          <ol class="breadcrumb"><li>Home</li><li class="active">Planilha</li></ol>
        </section>
        <section class="content">
          <router-outlet></router-outlet>
        </section>
      </main>
      <footer class="main-footer">
        <span>© {{year}} • Importação</span>
        <span>v0.1.0</span>
      </footer>
    </div>
  `,
  styles: [
    `.wrapper{display:grid;grid-template-columns:260px 1fr;grid-template-rows:56px 1fr 40px;height:100vh;background:#edf2f7}`,
    `.main-header{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;background:#1f2937;color:#fff;padding:0 16px}`,
    `.brand-area{display:flex;align-items:center;gap:12px}`,
    `.sidebar-toggle{background:#374151;color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer}`,
    `.brand{font-weight:800}`,
    `.nav-actions{display:flex;align-items:center;gap:10px}`,
    `.logout{background:#ef4444;color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer}`,
    `.main-sidebar{grid-row:2/span 1;background:#111827;color:#e5e7eb;display:flex;flex-direction:column;border-right:1px solid #0f172a}`,
    `.user-panel{display:flex;gap:10px;align-items:center;padding:16px;border-bottom:1px solid #0f172a}`,
    `.avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#1f2937}`,
    `.menu{display:flex;flex-direction:column;padding:8px}`,
    `.menu a{display:flex;align-items:center;gap:8px;color:#e5e7eb;text-decoration:none;padding:10px 12px;border-radius:8px}`,
    `.menu a.active, .menu a:hover{background:#1f2937}`,
    `.content-wrapper{background:#f3f4f6;overflow:auto}`,
    `.content-header{background:#fff;border-bottom:1px solid #e5e7eb;padding:12px 16px}`,
    `.content-header h1{margin:0;font-size:18px;color:#111827}`,
    `.content-header small{color:#6b7280;font-weight:400}`,
    `.breadcrumb{list-style:none;margin:6px 0 0 0;padding:0;display:flex;gap:6px;color:#6b7280}`,
    `.breadcrumb li::after{content:'/';margin:0 6px;color:#9ca3af}`,
    `.breadcrumb li:last-child::after{content:''}`,
    `.content{padding:12px}`,
    `.main-footer{grid-column:1/-1;background:#fff;border-top:1px solid #e5e7eb;color:#6b7280;display:flex;align-items:center;justify-content:space-between;padding:0 16px}`,
    `.sidebar-collapsed{grid-template-columns:72px 1fr}`,
    `.sidebar-collapsed .menu a span:last-child{display:none}`
  ]
})
export class ShellComponent {
  collapsed = false;
  year = new Date().getFullYear();
  constructor(public auth: AuthService){}
  toggleSidebar(){ this.collapsed = !this.collapsed; }
  logout(){ this.auth.logout(); location.href = '/login'; }
}