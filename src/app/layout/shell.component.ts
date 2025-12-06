import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../core/auth/auth.service';
import { Router } from '@angular/router';
import { PlanilhasService } from '../features/planilhas/planilhas.service';

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
          <div class="menu-group">
            <div class="menu-title">Processos</div>
            <a routerLink="/processos" routerLinkActive="active"><span class="icon">📁</span><span>Listagem</span></a>
          </div>
          <div class="menu-group">
            <div class="menu-title">Cadastros</div>
            <a routerLink="/aliquotas" routerLinkActive="active"><span class="icon">🧮</span><span>Alíquotas</span></a>
            <a routerLink="/portos" routerLinkActive="active"><span class="icon">🛳️</span><span>Portos</span></a>
          <a routerLink="/clientes" routerLinkActive="active"><span class="icon">👥</span><span>Clientes</span></a>
          <a routerLink="/despachantes" routerLinkActive="active"><span class="icon">🧭</span><span>Despachantes</span></a>
          </div>
          <div class="menu-group">
            <div class="menu-title">Nova Versão</div>
            <a routerLink="/nova" routerLinkActive="active"><span class="icon">🧭</span><span>Versão Completa</span></a>
            <a routerLink="/nova/processo/novo" routerLinkActive="active"><span class="icon">🧩</span><span>Processos</span></a>
            <a routerLink="/nova/processo/packlist" routerLinkActive="active"><span class="icon">📦</span><span>Packlist</span></a>
            <a routerLink="/nova/processo/custo" routerLinkActive="active"><span class="icon">🧮</span><span>Planilha de Custo</span></a>
            <a routerLink="/nova/processo/venda" routerLinkActive="active"><span class="icon">💼</span><span>Planilha de Venda</span></a>
            <a routerLink="/nova/processo/aduana" routerLinkActive="active"><span class="icon">🛃</span><span>Aduana</span></a>
            <a routerLink="/nova/processo/aduana/atualizar" routerLinkActive="active"><span class="icon">📝</span><span>Atualização Aduana</span></a>
            <a routerLink="/nova/processo/numerario" routerLinkActive="active"><span class="icon">💵</span><span>Numerário</span></a>
            <a routerLink="/nova/processo/numerario/historico" routerLinkActive="active"><span class="icon">🗂️</span><span>Histórico Numerário</span></a>
            <a routerLink="/nova/processo/fechamento" routerLinkActive="active"><span class="icon">✅</span><span>Fechamento</span></a>
            <a routerLink="/nova/processo/historico" routerLinkActive="active"><span class="icon">🕑</span><span>Histórico do Processo</span></a>
          </div>
        </nav>
      </aside>
      <main class="content-wrapper">
        <section class="content-header">
          <h1>{{headerTitle}} <small>{{headerSubtitle}}</small></h1>
          <ol class="breadcrumb"><li>Home</li><li class="active">{{headerTitle}}</li></ol>
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
    `.wrapper{display:grid;grid-template-columns:260px 1fr;grid-template-rows:56px 1fr 40px;height:100vh;background:var(--color-bg)}`,
    `.main-header{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;background:var(--color-header-bg);color:#fff;padding:0 16px}`,
    `.brand-area{display:flex;align-items:center;gap:12px}`,
    `.sidebar-toggle{background:var(--color-secondary);color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer}`,
    `.brand{font-weight:800}`,
    `.nav-actions{display:flex;align-items:center;gap:10px}`,
    `.logout{background:var(--color-danger);color:#fff;border:none;border-radius:6px;padding:6px 10px;cursor:pointer}`,
    `.main-sidebar{grid-row:2/span 1;background:var(--color-sidebar-bg);color:var(--color-sidebar-text);display:flex;flex-direction:column;border-right:1px solid var(--color-sidebar-bg)}`,
    `.user-panel{display:flex;gap:10px;align-items:center;padding:16px;border-bottom:1px solid var(--color-sidebar-bg)}`,
    `.avatar{width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:var(--color-header-bg)}`,
    `.menu{display:flex;flex-direction:column;padding:8px}`,
    `.menu-group{display:flex;flex-direction:column;margin-bottom:10px}`,
    `.menu-title{font-size:11px;color:var(--color-muted);text-transform:uppercase;letter-spacing:.8px;margin:6px 12px}`,
    `.menu a{display:flex;align-items:center;gap:8px;color:var(--color-sidebar-text);text-decoration:none;padding:10px 12px;border-radius:8px}`,
    `.menu a.active, .menu a:hover{background:var(--color-header-bg)}`,
    `.menu .create{margin-top:8px;display:flex;align-items:center;gap:8px;color:#fff;background:var(--gradient-primary);border:none;border-radius:8px;padding:10px 12px;cursor:pointer;text-decoration:none}`,
    `.content-wrapper{background:var(--color-bg);overflow:auto}`,
    `.content-header{background:var(--color-surface);border-bottom:1px solid var(--color-border);padding:12px 16px}`,
    `.content-header h1{margin:0;font-size:18px;color:var(--color-text)}`,
    `.content-header small{color:var(--color-muted);font-weight:400}`,
    `.breadcrumb{list-style:none;margin:6px 0 0 0;padding:0;display:flex;gap:6px;color:var(--color-muted)}`,
    `.breadcrumb li::after{content:'/';margin:0 6px;color:#9ca3af}`,
    `.breadcrumb li:last-child::after{content:''}`,
    `.content{padding:24px}`,
    `.main-footer{grid-column:1/-1;background:var(--color-surface);border-top:1px solid var(--color-border);color:var(--color-muted);display:flex;align-items:center;justify-content:space-between;padding:0 16px}`,
    `.sidebar-collapsed{grid-template-columns:72px 1fr}`,
    `.sidebar-collapsed .menu a span:last-child{display:none}`,
    `.sidebar-collapsed .menu .create span:last-child{display:none}`
  ]
})
export class ShellComponent {
  collapsed = false;
  year = new Date().getFullYear();
  headerTitle = 'Planilhas';
  headerSubtitle = 'Gestão de Custos';
  constructor(public auth: AuthService, private router: Router, private planilhas: PlanilhasService){
    this.updateHeader(this.router.url);
    this.router.events.subscribe(() => this.updateHeader(this.router.url));
  }
  toggleSidebar(){ this.collapsed = !this.collapsed; }
  logout(){ this.auth.logout(); location.href = '/login'; }
  // criação de processos acontece pela listagem
  private updateHeader(url: string){
    if(url.includes('/importacao')){ this.headerTitle = 'Editor'; this.headerSubtitle = 'Planilha de Importação'; }
    else { this.headerTitle = 'Planilhas'; this.headerSubtitle = 'Listagem e Ações'; }
  }
}