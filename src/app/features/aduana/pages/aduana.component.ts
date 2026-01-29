import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { readJSON, keys } from '../../orcamento/data/storage.helper';

interface ProcessoAduana {
  id: string;
  codigo: string;
  cliente: string;
  despachante: string;
  porto: string;
  canal?: string;
  status: 'pendente' | 'em-andamento' | 'concluido';
  dataInicio: string;
  dataEmbarque?: string;
  dataChegada?: string;
  dataDesembaraco?: string;
  diasDecorridos: number;
  totalVolumes: number;
  pesoTotal: number;
  cbmTotal: number;
  valorCIF?: number;
  impostoTotal?: number;
  despesasTotal?: number;
  desembolsoTotal?: number;
  pendencias: string[];
}

@Component({
  standalone: true,
  selector: 'app-aduana-nova',
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard-aduana">
      <!-- Header -->
      <div class="header-section">
        <div class="header-content">
          <h1>🛃 Dashboard Aduana</h1>
          <p class="subtitle">Controle analítico e acompanhamento detalhado do desembaraço aduaneiro</p>
        </div>
      </div>

      <!-- KPIs Principais -->
      <div class="kpis-grid">
        <div class="kpi-card total">
          <div class="kpi-icon">📦</div>
          <div class="kpi-content">
            <div class="kpi-value">{{ totalProcessos }}</div>
            <div class="kpi-label">Total de Processos</div>
          </div>
        </div>
        <div class="kpi-card pending">
          <div class="kpi-icon">⏳</div>
          <div class="kpi-content">
            <div class="kpi-value">{{ processosPendentes }}</div>
            <div class="kpi-label">Aguardando Desembaraço</div>
          </div>
        </div>
        <div class="kpi-card progress">
          <div class="kpi-icon">🚢</div>
          <div class="kpi-content">
            <div class="kpi-value">{{ processosEmAndamento }}</div>
            <div class="kpi-label">Em Andamento</div>
          </div>
        </div>
        <div class="kpi-card done">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <div class="kpi-value">{{ processosConcluidos }}</div>
            <div class="kpi-label">Concluídos</div>
          </div>
        </div>
      </div>

      <!-- Estatísticas por Canal -->
      <div class="content-section">
        <div class="section-header">
          <h2>🎯 Distribuição por Canal Aduaneiro</h2>
        </div>
        <div class="canais-grid">
          <div class="canal-card verde">
            <div class="canal-icon">🟢</div>
            <div class="canal-info">
              <div class="canal-value">{{ canaisCount.verde }}</div>
              <div class="canal-label">Canal Verde</div>
              <div class="canal-desc">Liberação automática</div>
            </div>
          </div>
          <div class="canal-card amarelo">
            <div class="canal-icon">🟡</div>
            <div class="canal-info">
              <div class="canal-value">{{ canaisCount.amarelo }}</div>
              <div class="canal-label">Canal Amarelo</div>
              <div class="canal-desc">Conferência documental</div>
            </div>
          </div>
          <div class="canal-card vermelho">
            <div class="canal-icon">🔴</div>
            <div class="canal-info">
              <div class="canal-value">{{ canaisCount.vermelho }}</div>
              <div class="canal-label">Canal Vermelho</div>
              <div class="canal-desc">Inspeção física + documental</div>
            </div>
          </div>
          <div class="canal-card cinza">
            <div class="canal-icon">⚫</div>
            <div class="canal-info">
              <div class="canal-value">{{ canaisCount.cinza }}</div>
              <div class="canal-label">Canal Cinza</div>
              <div class="canal-desc">Exame valoração aduaneira</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros e Grid Principal -->
      <div class="content-section">
        <div class="section-header">
          <h2>📋 Processos em Controle</h2>
          <div class="filters">
            <select [(ngModel)]="filtroStatus" (change)="aplicarFiltros()" class="filter-select">
              <option value="">Todos os Status</option>
              <option value="pendente">Pendentes</option>
              <option value="em-andamento">Em Andamento</option>
              <option value="concluido">Concluídos</option>
            </select>
            <select [(ngModel)]="filtroCanal" (change)="aplicarFiltros()" class="filter-select">
              <option value="">Todos os Canais</option>
              <option value="Verde">Verde</option>
              <option value="Amarelo">Amarelo</option>
              <option value="Vermelho">Vermelho</option>
              <option value="Cinza">Cinza</option>
            </select>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="table-aduana">
            <thead>
              <tr>
                <th>Processo</th>
                <th>Cliente</th>
                <th>Porto</th>
                <th>Canal</th>
                <th>Status</th>
                <th>Embarque</th>
                <th>ETA</th>
                <th>Dias</th>
                <th>Volumes</th>
                <th>CBM</th>
                <th>Desembolso</th>
                <th>Pendências</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="processosFiltrados.length === 0">
                <td colspan="12" class="empty-state">Nenhum processo encontrado</td>
              </tr>
              <tr *ngFor="let proc of processosFiltrados" class="processo-row" (click)="abrirProcesso(proc)">
                <td class="codigo"><strong>{{ proc.codigo }}</strong></td>
                <td>{{ proc.cliente }}</td>
                <td>{{ proc.porto }}</td>
                <td>
                  <span class="canal-badge" [ngClass]="'canal-' + proc.canal" *ngIf="proc.canal">{{ proc.canal }}</span>
                  <span class="badge-muted" *ngIf="!proc.canal">Aguardando</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="'status-' + proc.status">{{ formatStatus(proc.status) }}</span>
                </td>
                <td>{{ proc.dataEmbarque ? (proc.dataEmbarque | date:'dd/MM/yy') : '-' }}</td>
                <td>{{ proc.dataChegada ? (proc.dataChegada | date:'dd/MM/yy') : '-' }}</td>
                <td>
                  <span class="dias-badge" [ngClass]="getDiasClass(proc.diasDecorridos)">{{ proc.diasDecorridos }}d</span>
                </td>
                <td class="numeric">{{ proc.totalVolumes }}</td>
                <td class="numeric">{{ proc.cbmTotal | number:'1.2-2' }}</td>
                <td class="numeric">{{ proc.desembolsoTotal ? (proc.desembolsoTotal | currency:'BRL':'symbol':'1.0-0') : '-' }}</td>
                <td>
                  <span class="pendencias-badge" *ngIf="proc.pendencias.length > 0">{{ proc.pendencias.length }}</span>
                  <span *ngIf="proc.pendencias.length === 0">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Alertas e Pendências Críticas -->
      <div class="content-section" *ngIf="pendenciasCriticas.length > 0">
        <div class="section-header alert">
          <h2>⚠️ Pendências Críticas</h2>
          <span class="badge-alert">{{ pendenciasCriticas.length }} item(ns)</span>
        </div>
        <div class="pendencias-list">
          <div *ngFor="let pend of pendenciasCriticas" class="pendencia-card">
            <div class="pendencia-header">
              <strong>{{ pend.codigo }}</strong>
              <span class="cliente-name">{{ pend.cliente }}</span>
            </div>
            <ul class="pendencia-items">
              <li *ngFor="let item of pend.pendencias">{{ item }}</li>
            </ul>
            <button class="btn-action" (click)="abrirProcesso(pend)">Resolver →</button>
          </div>
        </div>
      </div>

      <!-- Análise por Porto -->
      <div class="content-section">
        <div class="section-header">
          <h2>🛳️ Análise por Porto de Entrada</h2>
        </div>
        <div class="portos-grid">
          <div *ngFor="let porto of portosAnalise" class="porto-card">
            <div class="porto-header">
              <div class="porto-name">{{ porto.nome }}</div>
              <div class="porto-count">{{ porto.quantidade }} processos</div>
            </div>
            <div class="porto-stats">
              <div class="stat-item">
                <span class="stat-label">Tempo Médio</span>
                <span class="stat-value">{{ porto.tempoMedio }}d</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Em Andamento</span>
                <span class="stat-value">{{ porto.emAndamento }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumo Financeiro -->
      <div class="content-section">
        <div class="section-header">
          <h2>💰 Resumo Financeiro Aduaneiro</h2>
        </div>
        <div class="financial-summary">
          <div class="fin-card">
            <div class="fin-label">Valor CIF Total</div>
            <div class="fin-value">{{ valorCIFTotal | currency:'BRL' }}</div>
          </div>
          <div class="fin-card">
            <div class="fin-label">Impostos Totais</div>
            <div class="fin-value">{{ impostosTotal | currency:'BRL' }}</div>
          </div>
          <div class="fin-card">
            <div class="fin-label">Despesas Aduaneiras</div>
            <div class="fin-value">{{ despesasTotal | currency:'BRL' }}</div>
          </div>
          <div class="fin-card highlight">
            <div class="fin-label">Desembolso Total</div>
            <div class="fin-value">{{ desembolsoTotal | currency:'BRL' }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-aduana {
      padding: 24px;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }

    .header-section {
      background: white;
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .header-section h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #1a1a1a;
    }

    .subtitle {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .kpi-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      border-left: 4px solid;
    }

    .kpi-card.total { border-left-color: #667eea; }
    .kpi-card.pending { border-left-color: #f59e0b; }
    .kpi-card.progress { border-left-color: #3b82f6; }
    .kpi-card.done { border-left-color: #10b981; }

    .kpi-icon {
      font-size: 32px;
    }

    .kpi-value {
      font-size: 28px;
      font-weight: 700;
      color: #1a1a1a;
    }

    .kpi-label {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 4px;
    }

    .content-section {
      background: white;
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 2px solid #f0f0f0;
    }

    .section-header h2 {
      margin: 0;
      font-size: 18px;
      font-weight: 700;
      color: #1a1a1a;
    }

    .section-header.alert {
      border-bottom-color: #ff6b6b;
    }

    .section-header.alert h2 {
      color: #ff6b6b;
    }

    .badge-alert {
      background: #ff6b6b;
      color: white;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
    }

    .canais-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .canal-card {
      padding: 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 16px;
      border: 2px solid;
    }

    .canal-card.verde {
      background: #d1fae5;
      border-color: #10b981;
    }

    .canal-card.amarelo {
      background: #fef3c7;
      border-color: #f59e0b;
    }

    .canal-card.vermelho {
      background: #fee2e2;
      border-color: #ef4444;
    }

    .canal-card.cinza {
      background: #f3f4f6;
      border-color: #6b7280;
    }

    .canal-icon {
      font-size: 36px;
    }

    .canal-value {
      font-size: 32px;
      font-weight: 700;
    }

    .canal-label {
      font-size: 14px;
      font-weight: 600;
      margin-top: 4px;
    }

    .canal-desc {
      font-size: 11px;
      color: #666;
      margin-top: 2px;
    }

    .filters {
      display: flex;
      gap: 12px;
    }

    .filter-select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      background: white;
      cursor: pointer;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .table-aduana {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }

    .table-aduana thead {
      background: #f9fafb;
    }

    .table-aduana th {
      padding: 12px 10px;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 2px solid #e5e7eb;
      white-space: nowrap;
    }

    .table-aduana td {
      padding: 12px 10px;
      border-bottom: 1px solid #f3f4f6;
    }

    .processo-row {
      cursor: pointer;
      transition: background 0.2s;
    }

    .processo-row:hover {
      background: #f0f4ff;
    }

    .codigo {
      font-weight: 600;
      color: #667eea;
    }

    .numeric {
      text-align: right;
      font-variant-numeric: tabular-nums;
    }

    .empty-state {
      text-align: center;
      color: #999;
      padding: 32px !important;
    }

    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge.status-concluido {
      background: #d4edda;
      color: #155724;
    }

    .badge.status-em-andamento {
      background: #cfe2ff;
      color: #084298;
    }

    .badge.status-pendente {
      background: #f8d7da;
      color: #721c24;
    }

    .badge-muted {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      background: #f3f4f6;
      color: #6b7280;
    }

    .canal-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .canal-badge.canal-Verde {
      background: #d1fae5;
      color: #065f46;
    }

    .canal-badge.canal-Amarelo {
      background: #fef3c7;
      color: #92400e;
    }

    .canal-badge.canal-Vermelho {
      background: #fee2e2;
      color: #991b1b;
    }

    .canal-badge.canal-Cinza {
      background: #f3f4f6;
      color: #374151;
    }

    .dias-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
    }

    .dias-badge.normal {
      background: #d1fae5;
      color: #065f46;
    }

    .dias-badge.atencao {
      background: #fef3c7;
      color: #92400e;
    }

    .dias-badge.critico {
      background: #fee2e2;
      color: #991b1b;
    }

    .pendencias-badge {
      display: inline-block;
      background: #ff6b6b;
      color: white;
      padding: 4px 8px;
      border-radius: 50%;
      font-size: 11px;
      font-weight: 600;
      min-width: 20px;
      text-align: center;
    }

    .pendencias-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .pendencia-card {
      border: 2px solid #ff6b6b;
      border-radius: 12px;
      padding: 16px;
      background: #fff5f5;
    }

    .pendencia-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #fecaca;
    }

    .pendencia-header strong {
      color: #991b1b;
    }

    .cliente-name {
      font-size: 12px;
      color: #666;
    }

    .pendencia-items {
      margin: 0 0 12px 0;
      padding-left: 20px;
      color: #374151;
      font-size: 13px;
    }

    .pendencia-items li {
      margin-bottom: 6px;
    }

    .btn-action {
      background: #ff6b6b;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      width: 100%;
    }

    .btn-action:hover {
      background: #ef4444;
    }

    .portos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 16px;
    }

    .porto-card {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 16px;
      background: #f9fafb;
    }

    .porto-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    .porto-name {
      font-weight: 600;
      color: #1a1a1a;
    }

    .porto-count {
      font-size: 12px;
      color: #666;
    }

    .porto-stats {
      display: flex;
      gap: 16px;
    }

    .stat-item {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 11px;
      color: #999;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 18px;
      font-weight: 700;
      color: #374151;
    }

    .financial-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .fin-card {
      padding: 20px;
      border-radius: 12px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
    }

    .fin-card.highlight {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
    }

    .fin-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .fin-card.highlight .fin-label {
      color: rgba(255,255,255,0.9);
    }

    .fin-value {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
    }

    .fin-card.highlight .fin-value {
      color: white;
    }

    @media (max-width: 768px) {
      .dashboard-aduana {
        padding: 12px;
      }

      .kpis-grid {
        grid-template-columns: 1fr;
      }

      .canais-grid {
        grid-template-columns: 1fr;
      }

      .table-aduana {
        font-size: 11px;
      }

      .table-aduana th,
      .table-aduana td {
        padding: 8px 6px;
      }
    }
  `]
})
export class AduanaNovaComponent implements OnInit {
  processos: ProcessoAduana[] = [];
  processosFiltrados: ProcessoAduana[] = [];
  pendenciasCriticas: ProcessoAduana[] = [];
  portosAnalise: any[] = [];
  
  filtroStatus = '';
  filtroCanal = '';

  totalProcessos = 0;
  processosPendentes = 0;
  processosEmAndamento = 0;
  processosConcluidos = 0;

  canaisCount = {
    verde: 0,
    amarelo: 0,
    vermelho: 0,
    cinza: 0
  };

  valorCIFTotal = 0;
  impostosTotal = 0;
  despesasTotal = 0;
  desembolsoTotal = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    const index = readJSON<any[]>(keys.orcamentosIndex()) || [];
    
    this.processos = index.map(item => {
      const aduanaSnap = readJSON<any>(keys.aduanaSnapshot(item.id)) || {};
      const packSnap = readJSON<any>(keys.packlist(item.id)) || {};
      const ultimoLancamento = aduanaSnap.lancamentos?.[0]?.aduanaCompleta;
      
      const dataInicio = new Date(item.data || Date.now());
      const hoje = new Date();
      const diasDecorridos = Math.floor((hoje.getTime() - dataInicio.getTime()) / (1000 * 60 * 60 * 24));
      
      const pendencias: string[] = [];
      if (!ultimoLancamento?.canal) pendencias.push('Aguardando parametrização');
      if (!ultimoLancamento?.dataEmbarque) pendencias.push('Sem data de embarque');
      if (!ultimoLancamento?.despachante) pendencias.push('Despachante não definido');
      if (diasDecorridos > 30 && aduanaSnap.status !== 'concluido') pendencias.push('Processo atrasado (>30 dias)');
      
      const statusAduana = aduanaSnap.status || 'pendente';
      
      // Contar canais
      if (ultimoLancamento?.canal) {
        const canal = ultimoLancamento.canal.toLowerCase();
        if (canal === 'verde') this.canaisCount.verde++;
        else if (canal === 'amarelo') this.canaisCount.amarelo++;
        else if (canal === 'vermelho') this.canaisCount.vermelho++;
        else if (canal === 'cinza') this.canaisCount.cinza++;
      }

      // Acumular valores financeiros
      this.valorCIFTotal += ultimoLancamento?.valorCIF || 0;
      this.impostosTotal += ultimoLancamento?.totalImpostos || 0;
      this.despesasTotal += ultimoLancamento?.totalDespesas || 0;
      this.desembolsoTotal += ultimoLancamento?.desembolsoTotal || 0;

      return {
        id: item.id,
        codigo: item.codigo || `ORC-${item.id.substring(0, 8)}`,
        cliente: item.cliente || 'Cliente não informado',
        despachante: ultimoLancamento?.despachante || '-',
        porto: ultimoLancamento?.porto || '-',
        canal: ultimoLancamento?.canal,
        status: statusAduana as any,
        dataInicio: item.data,
        dataEmbarque: ultimoLancamento?.dataEmbarque,
        dataChegada: ultimoLancamento?.dataChegada,
        dataDesembaraco: ultimoLancamento?.dataDesembaraco,
        diasDecorridos,
        totalVolumes: packSnap.totalVolumes || 0,
        pesoTotal: packSnap.pesoTotal || 0,
        cbmTotal: packSnap.cbmTotal || 0,
        valorCIF: ultimoLancamento?.valorCIF,
        impostoTotal: ultimoLancamento?.totalImpostos,
        despesasTotal: ultimoLancamento?.totalDespesas,
        desembolsoTotal: ultimoLancamento?.desembolsoTotal,
        pendencias
      };
    });

    this.totalProcessos = this.processos.length;
    this.processosPendentes = this.processos.filter(p => p.status === 'pendente').length;
    this.processosEmAndamento = this.processos.filter(p => p.status === 'em-andamento').length;
    this.processosConcluidos = this.processos.filter(p => p.status === 'concluido').length;

    this.pendenciasCriticas = this.processos.filter(p => p.pendencias.length > 0);
    
    this.analisarPortos();
    this.aplicarFiltros();
  }

  private analisarPortos(): void {
    const portosMap = new Map<string, any>();
    
    this.processos.forEach(proc => {
      if (!proc.porto || proc.porto === '-') return;
      
      if (!portosMap.has(proc.porto)) {
        portosMap.set(proc.porto, {
          nome: proc.porto,
          quantidade: 0,
          totalDias: 0,
          emAndamento: 0
        });
      }
      
      const porto = portosMap.get(proc.porto);
      porto.quantidade++;
      porto.totalDias += proc.diasDecorridos;
      if (proc.status === 'em-andamento') porto.emAndamento++;
    });

    this.portosAnalise = Array.from(portosMap.values()).map(p => ({
      ...p,
      tempoMedio: p.quantidade > 0 ? Math.round(p.totalDias / p.quantidade) : 0
    }));
  }

  aplicarFiltros(): void {
    let lista = [...this.processos];
    
    if (this.filtroStatus) {
      lista = lista.filter(p => p.status === this.filtroStatus);
    }
    
    if (this.filtroCanal) {
      lista = lista.filter(p => p.canal === this.filtroCanal);
    }
    
    // Ordenar por dias decorridos (maior primeiro)
    lista.sort((a, b) => b.diasDecorridos - a.diasDecorridos);
    
    this.processosFiltrados = lista;
  }

  formatStatus(status: string): string {
    const map: Record<string, string> = {
      'concluido': '✓ Concluído',
      'em-andamento': '⏳ Andamento',
      'pendente': '○ Pendente'
    };
    return map[status] || status;
  }

  getDiasClass(dias: number): string {
    if (dias <= 15) return 'normal';
    if (dias <= 30) return 'atencao';
    return 'critico';
  }

  abrirProcesso(proc: ProcessoAduana): void {
    this.router.navigate(['/orcamento', proc.id]);
  }
}