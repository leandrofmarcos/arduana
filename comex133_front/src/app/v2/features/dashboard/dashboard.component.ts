import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClienteV2Service } from '../cadastros/clientes/services/cliente-v2.service';
import { ImportadorService } from '../cadastros/importadores/services/importador.service';
import { DespachanteV2Service } from '../cadastros/despachantes/services/despachante-v2.service';
import { PortoOrigemService } from '../cadastros/portos-origem/services/porto-origem.service';
import { PortoDestinoService } from '../cadastros/portos-destino/services/porto-destino.service';
import { NcmService } from '../cadastros/ncm/services/ncm.service';
import { DespesaCadastroService } from '../cadastros/despesas-cadastro/services/despesa-cadastro.service';

interface StatusCount {
  nome: string;
  count: number;
  cor: string;
}

@Component({
  selector: 'app-dashboard-v2',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-page">
      <div class="page-header">
        <h1 class="page-title">📊 Dashboard</h1>
        <p class="page-subtitle">Visão geral do sistema (dados via API)</p>
      </div>

      <div class="kpi-grid">
        <div class="kpi-card" routerLink="/clientes">
          <div class="kpi-value">{{ kpi.clientes }}</div>
          <div class="kpi-label">Clientes Ativos</div>
        </div>
        <div class="kpi-card" routerLink="/importadores">
          <div class="kpi-value">{{ kpi.importadores }}</div>
          <div class="kpi-label">Importadores Ativos</div>
        </div>
        <div class="kpi-card" routerLink="/despachantes">
          <div class="kpi-value">{{ kpi.despachantes }}</div>
          <div class="kpi-label">Despachantes Ativos</div>
        </div>
        <div class="kpi-card" routerLink="/portos-origem">
          <div class="kpi-value">{{ kpi.portosOrigem }}</div>
          <div class="kpi-label">Portos de Origem</div>
        </div>
        <div class="kpi-card" routerLink="/portos-destino">
          <div class="kpi-value">{{ kpi.portosDestino }}</div>
          <div class="kpi-label">Portos de Destino</div>
        </div>
        <div class="kpi-card" routerLink="/ncm">
          <div class="kpi-value">{{ kpi.ncms }}</div>
          <div class="kpi-label">NCMs Ativos</div>
        </div>
        <div class="kpi-card" routerLink="/despesas-cadastro">
          <div class="kpi-value">{{ kpi.despesas }}</div>
          <div class="kpi-label">Despesas Catálogo</div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-header">Distribuição de Cadastros</div>
        <div class="panel-body">
          <div class="status-bar-row" *ngFor="let s of statusCounts">
            <span class="status-bar-label">{{ s.nome }}</span>
            <div class="status-bar-track">
              <div class="status-bar-fill" [style.width.%]="(s.count / maxStatusCount) * 100" [style.background]="s.cor"></div>
            </div>
            <span class="status-bar-count">{{ s.count }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page { max-width: 1100px; }
    .page-header { margin-bottom: 24px; }
    .page-title { margin: 0 0 4px; font-size: 24px; font-weight: 700; }
    .page-subtitle { margin: 0; color: var(--color-muted); font-size: 14px; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; margin-bottom: 20px; }
    .kpi-card { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 10px; padding: 14px; text-decoration: none; color: inherit; }
    .kpi-value { font-size: 28px; font-weight: 800; }
    .kpi-label { font-size: 12px; color: var(--color-muted); }
    .panel { background: var(--color-surface); border: 1px solid var(--color-border); border-radius: 12px; overflow: hidden; }
    .panel-header { padding: 12px 16px; background: var(--color-bg); border-bottom: 1px solid var(--color-border); font-weight: 700; }
    .panel-body { padding: 12px; }
    .status-bar-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .status-bar-label { min-width: 140px; font-size: 12px; }
    .status-bar-track { flex: 1; height: 8px; background: var(--color-border); border-radius: 4px; overflow: hidden; }
    .status-bar-fill { height: 100%; }
    .status-bar-count { min-width: 24px; text-align: right; font-size: 12px; font-weight: 700; }
    @media (max-width: 768px) {
      .kpi-grid { grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
    }
    @media (max-width: 480px) {
      .page-title { font-size: 18px; }
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .kpi-value { font-size: 22px; }
      .status-bar-row { flex-wrap: wrap; gap: 4px; }
      .status-bar-label { min-width: unset; width: 100%; font-weight: 600; }
      .status-bar-count { margin-left: auto; }
    }
  `]
})
export class DashboardV2Component implements OnInit {
  kpi = {
    clientes: 0,
    importadores: 0,
    despachantes: 0,
    portosOrigem: 0,
    portosDestino: 0,
    ncms: 0,
    despesas: 0
  };

  statusCounts: StatusCount[] = [];
  maxStatusCount = 1;

  constructor(
    private clienteSvc: ClienteV2Service,
    private importadorSvc: ImportadorService,
    private despachanteSvc: DespachanteV2Service,
    private portoOrigemSvc: PortoOrigemService,
    private portoDestinoSvc: PortoDestinoService,
    private ncmSvc: NcmService,
    private despesaSvc: DespesaCadastroService
  ) {}

  ngOnInit(): void {
    this.refresh();
    setTimeout(() => this.refresh(), 250);
  }

  private refresh(): void {
    this.kpi.clientes = this.clienteSvc.getAtivos().length;
    this.kpi.importadores = this.importadorSvc.getAtivos().length;
    this.kpi.despachantes = this.despachanteSvc.getAtivos().length;
    this.kpi.portosOrigem = this.portoOrigemSvc.getAtivos().length;
    this.kpi.portosDestino = this.portoDestinoSvc.getAtivos().length;
    this.kpi.ncms = this.ncmSvc.getAtivos().length;
    this.kpi.despesas = this.despesaSvc.getAtivos().length;

    this.statusCounts = [
      { nome: 'Clientes', count: this.kpi.clientes, cor: '#3b82f6' },
      { nome: 'Importadores', count: this.kpi.importadores, cor: '#8b5cf6' },
      { nome: 'Despachantes', count: this.kpi.despachantes, cor: '#22c55e' },
      { nome: 'Portos Origem', count: this.kpi.portosOrigem, cor: '#06b6d4' },
      { nome: 'Portos Destino', count: this.kpi.portosDestino, cor: '#f59e0b' },
      { nome: 'NCMs', count: this.kpi.ncms, cor: '#ef4444' },
      { nome: 'Despesas Catálogo', count: this.kpi.despesas, cor: '#14b8a6' }
    ];

    this.maxStatusCount = Math.max(1, ...this.statusCounts.map(s => s.count));
  }
}
