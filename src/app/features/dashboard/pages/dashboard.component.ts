import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { readJSON, keys } from '../../orcamento/data/storage.helper';

interface OrçamentoResumo {
  id: string;
  cliente: string;
  codigo: string;
  data: string;
  status: string;
  progresso: number;
  fases: {
    packlist: 'pendente' | 'em-andamento' | 'concluido';
    custo: 'pendente' | 'em-andamento' | 'concluido';
    venda: 'pendente' | 'em-andamento' | 'concluido';
    aduana: 'pendente' | 'em-andamento' | 'concluido';
  };
  aduanaInfo?: {
    canal?: string;
    dataEmbarque?: string;
    dataChegada?: string;
    despesasTotal?: number;
    desembolsoTotal?: number;
  };
}

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <div class="header-content">
          <h1>📊 Dashboard de Importações</h1>
          <p class="subtitle">Acompanhamento completo de orçamentos e fases de desembaraço</p>
        </div>
        <button class="btn btn-primary" (click)="novoOrcamento()">+ Novo Orçamento</button>
      </div>

      <!-- KPIs -->
      <div class="kpis-grid">
        <div class="kpi-card">
          <div class="kpi-icon">📦</div>
          <div class="kpi-content">
            <div class="kpi-value">{{ totalOrcamentos }}</div>
            <div class="kpi-label">Total de Orçamentos</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">✅</div>
          <div class="kpi-content">
            <div class="kpi-value">{{ orcamentosFinalizados }}</div>
            <div class="kpi-label">Finalizados</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">⏳</div>
          <div class="kpi-content">
            <div class="kpi-value">{{ orcamentosEmAndamento }}</div>
            <div class="kpi-label">Em Andamento</div>
          </div>
        </div>
        <div class="kpi-card">
          <div class="kpi-icon">💰</div>
          <div class="kpi-content">
            <div class="kpi-value">{{ desembolsoTotal | currency:'BRL':'symbol':'1.0-0' }}</div>
            <div class="kpi-label">Desembolso Total</div>
          </div>
        </div>
      </div>

      <!-- Lista de Orçamentos -->
      <div class="content-section">
        <div class="section-header">
          <h2>📋 Orçamentos em Acompanhamento</h2>
          <div class="filters">
            <select [(ngModel)]="filtroStatus" (change)="aplicarFiltros()" class="filter-select">
              <option value="">Todos os Status</option>
              <option value="pendente">Pendentes</option>
              <option value="em-andamento">Em Andamento</option>
              <option value="concluido">Concluídos</option>
            </select>
          </div>
        </div>

        <div class="table-wrapper">
          <table class="table-orcamentos">
            <thead>
              <tr>
                <th>Código</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Progresso</th>
                <th>Packlist</th>
                <th>Custo</th>
                <th>Venda</th>
                <th>Aduana</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="orcamentosFiltrados.length === 0">
                <td colspan="9" class="empty-state">Nenhum orçamento encontrado</td>
              </tr>
              <tr *ngFor="let orc of orcamentosFiltrados" class="orc-row">
                <td class="codigo"><strong>{{ orc.codigo }}</strong></td>
                <td>{{ orc.cliente }}</td>
                <td>{{ orc.data | date:'dd/MM/yyyy' }}</td>
                <td>
                  <div class="progresso-bar">
                    <div class="progresso-fill" [style.width.%]="orc.progresso"></div>
                    <span class="progresso-text">{{ orc.progresso }}%</span>
                  </div>
                </td>
                <td><span class="badge" [ngClass]="'status-' + orc.fases.packlist">{{ formatStatus(orc.fases.packlist) }}</span></td>
                <td><span class="badge" [ngClass]="'status-' + orc.fases.custo">{{ formatStatus(orc.fases.custo) }}</span></td>
                <td><span class="badge" [ngClass]="'status-' + orc.fases.venda">{{ formatStatus(orc.fases.venda) }}</span></td>
                <td><span class="badge" [ngClass]="'status-' + orc.fases.aduana">{{ formatStatus(orc.fases.aduana) }}</span></td>
                <td>
                  <div class="actions">
                    <button class="btn-icon" (click)="abrirDetalhes(orc)" title="Detalhes">👁️</button>
                    <button class="btn-icon" (click)="abrirAcompanhamento(orc)" title="Acompanhamento">📊</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Seção de Aduana (Crítica) -->
      <div class="content-section" *ngIf="aduanasCriticas.length > 0">
        <div class="section-header critical">
          <h2>🏛️ Aduana - Atenção Necessária</h2>
          <span class="badge-alert">{{ aduanasCriticas.length }} item(ns)</span>
        </div>

        <div class="aduana-grid">
          <div *ngFor="let item of aduanasCriticas" class="aduana-card">
            <div class="card-header">
              <strong>{{ item.codigo }}</strong>
              <span class="client-name">{{ item.cliente }}</span>
            </div>
            <div class="card-body">
              <div class="info-row">
                <label>Status Aduana:</label>
                <span class="badge" [ngClass]="'status-' + item.fases.aduana">{{ formatStatus(item.fases.aduana) }}</span>
              </div>
              <div class="info-row" *ngIf="item.aduanaInfo?.canal">
                <label>Canal:</label>
                <span class="canal-badge" [ngClass]="'canal-' + item.aduanaInfo?.canal">{{ item.aduanaInfo?.canal }}</span>
              </div>
              <div class="info-row" *ngIf="item.aduanaInfo?.dataEmbarque">
                <label>Embarque:</label>
                <span>{{ item.aduanaInfo?.dataEmbarque | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-row" *ngIf="item.aduanaInfo?.dataChegada">
                <label>ETA:</label>
                <span>{{ item.aduanaInfo?.dataChegada | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-row financial" *ngIf="item.aduanaInfo?.desembolsoTotal">
                <label>Desembolso:</label>
                <span class="amount">{{ item.aduanaInfo?.desembolsoTotal | currency:'BRL' }}</span>
              </div>
            </div>
            <div class="card-footer">
              <button class="btn btn-small" (click)="abrirAduana(item)">Abrir Aduana →</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Resumo Financeiro -->
      <div class="content-section">
        <div class="section-header">
          <h2>💰 Resumo Financeiro</h2>
        </div>

        <div class="financial-grid">
          <div class="financial-card">
            <div class="fi-label">Custos Totais</div>
            <div class="fi-value">{{ custoTotal | currency:'BRL' }}</div>
            <div class="fi-sub">Todos os orçamentos</div>
          </div>
          <div class="financial-card">
            <div class="fi-label">Vendas Totais</div>
            <div class="fi-value highlight">{{ vendaTotal | currency:'BRL' }}</div>
            <div class="fi-sub">Margem de lucro</div>
          </div>
          <div class="financial-card">
            <div class="fi-label">Aduana (Despesas)</div>
            <div class="fi-value">{{ despesasAduanaTotal | currency:'BRL' }}</div>
            <div class="fi-sub">Desembaraço</div>
          </div>
          <div class="financial-card total">
            <div class="fi-label">Desembolso Total</div>
            <div class="fi-value">{{ desembolsoTotal | currency:'BRL' }}</div>
            <div class="fi-sub">Custo + Aduana</div>
          </div>
        </div>
      </div>

      <!-- Timeline de Atividades Recentes -->
      <div class="content-section">
        <div class="section-header">
          <h2>📅 Atividades Recentes</h2>
        </div>

        <div class="timeline">
          <div *ngIf="atividadesRecentes.length === 0" class="empty-timeline">
            Nenhuma atividade registrada
          </div>
          <div *ngFor="let atividade of atividadesRecentes; let i = index" class="timeline-item">
            <div class="timeline-marker" [ngClass]="atividade.tipo"></div>
            <div class="timeline-content">
              <div class="timeline-title">{{ atividade.titulo }}</div>
              <div class="timeline-desc">{{ atividade.descricao }}</div>
              <div class="timeline-time">{{ atividade.data | date:'dd/MM/yyyy HH:mm' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: white;
      padding: 24px;
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .dashboard-header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      color: #1a1a1a;
    }

    .dashboard-header .subtitle {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    /* KPIs Grid */
    .kpis-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .kpi-card {
      display: flex;
      align-items: center;
      gap: 16px;
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      border-left: 4px solid #667eea;
    }

    .kpi-icon {
      font-size: 32px;
    }

    .kpi-content {
      flex: 1;
    }

    .kpi-value {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
    }

    .kpi-label {
      font-size: 12px;
      color: #999;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Content Section */
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

    .section-header.critical {
      border-bottom-color: #ff6b6b;
    }

    .section-header.critical h2 {
      color: #ff6b6b;
    }

    .badge-alert {
      background: #ff6b6b;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    .filters {
      display: flex;
      gap: 12px;
    }

    .filter-select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
    }

    /* Table */
    .table-wrapper {
      overflow-x: auto;
    }

    .table-orcamentos {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .table-orcamentos thead {
      background: #f8f9fa;
      border-bottom: 2px solid #ddd;
    }

    .table-orcamentos th {
      padding: 12px;
      text-align: left;
      font-weight: 600;
      color: #1a1a1a;
    }

    .table-orcamentos td {
      padding: 12px;
      border-bottom: 1px solid #f0f0f0;
    }

    .table-orcamentos .orc-row:hover {
      background: #f9f9f9;
    }

    .codigo {
      font-weight: 600;
      color: #667eea;
    }

    .empty-state {
      text-align: center;
      color: #999;
      padding: 32px 12px !important;
    }

    /* Badges */
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

    .canal-badge {
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .canal-badge.canal-Verde {
      background: #d4edda;
      color: #155724;
    }

    .canal-badge.canal-Amarelo {
      background: #fff3cd;
      color: #664d03;
    }

    .canal-badge.canal-Vermelho {
      background: #f8d7da;
      color: #721c24;
    }

    /* Progress Bar */
    .progresso-bar {
      position: relative;
      height: 20px;
      background: #f0f0f0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progresso-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s;
    }

    .progresso-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 11px;
      font-weight: 600;
      color: white;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }

    /* Actions */
    .actions {
      display: flex;
      gap: 8px;
    }

    .btn-icon {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .btn-icon:hover {
      background: #f0f0f0;
    }

    /* Aduana Cards */
    .aduana-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .aduana-card {
      border: 1px solid #ff6b6b;
      border-radius: 8px;
      overflow: hidden;
      background: linear-gradient(135deg, #ffe8e8 0%, #fff5f5 100%);
    }

    .aduana-card .card-header {
      background: #ff6b6b;
      color: white;
      padding: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .aduana-card .client-name {
      font-size: 12px;
      opacity: 0.9;
      font-weight: 400;
    }

    .aduana-card .card-body {
      padding: 12px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,107,107,0.1);
      font-size: 13px;
    }

    .info-row label {
      font-weight: 600;
      color: #666;
    }

    .info-row.financial {
      background: white;
      padding: 10px;
      border-radius: 4px;
      border-bottom: none;
    }

    .info-row .amount {
      font-weight: 700;
      color: #ff6b6b;
      font-size: 14px;
    }

    .aduana-card .card-footer {
      padding: 12px;
      border-top: 1px solid rgba(255,107,107,0.1);
      text-align: center;
    }

    .btn-small {
      background: #ff6b6b;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-small:hover {
      background: #ff5252;
      transform: translateY(-1px);
    }

    /* Financial Grid */
    .financial-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
    }

    .financial-card {
      background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
      border: 2px solid #667eea;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }

    .financial-card.total {
      border-color: #ff6b6b;
      background: linear-gradient(135deg, #ff6b6b15 0%, #ff000015 100%);
    }

    .fi-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }

    .fi-value {
      font-size: 28px;
      font-weight: 700;
      color: #667eea;
      margin-bottom: 8px;
    }

    .fi-value.highlight {
      color: #28a745;
    }

    .financial-card.total .fi-value {
      color: #ff6b6b;
    }

    .fi-sub {
      font-size: 12px;
      color: #999;
    }

    /* Timeline */
    .timeline {
      position: relative;
      padding-left: 40px;
    }

    .timeline::before {
      content: '';
      position: absolute;
      left: 8px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #ddd;
    }

    .timeline-item {
      position: relative;
      padding-bottom: 20px;
    }

    .timeline-marker {
      position: absolute;
      left: -40px;
      top: 2px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: white;
      border: 3px solid #667eea;
    }

    .timeline-marker.packlist {
      border-color: #28a745;
    }

    .timeline-marker.custo {
      border-color: #ffc107;
    }

    .timeline-marker.venda {
      border-color: #17a2b8;
    }

    .timeline-marker.aduana {
      border-color: #ff6b6b;
    }

    .timeline-title {
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 4px;
    }

    .timeline-desc {
      font-size: 13px;
      color: #666;
      margin-bottom: 4px;
    }

    .timeline-time {
      font-size: 11px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .empty-timeline {
      text-align: center;
      color: #999;
      padding: 32px;
    }

    @media (max-width: 768px) {
      .dashboard {
        padding: 12px;
      }

      .dashboard-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .table-orcamentos {
        font-size: 12px;
      }

      .table-orcamentos th,
      .table-orcamentos td {
        padding: 8px;
      }

      .kpis-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .aduana-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  orcamentos: OrçamentoResumo[] = [];
  orcamentosFiltrados: OrçamentoResumo[] = [];
  aduanasCriticas: OrçamentoResumo[] = [];
  atividadesRecentes: any[] = [];
  filtroStatus = '';

  totalOrcamentos = 0;
  orcamentosFinalizados = 0;
  orcamentosEmAndamento = 0;
  desembolsoTotal = 0;
  custoTotal = 0;
  vendaTotal = 0;
  despesasAduanaTotal = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  private carregarDados(): void {
    const index = readJSON<any[]>(keys.orcamentosIndex()) || [];
    
    this.orcamentos = index.map(item => {
      const meta = readJSON<any>(keys.orcamento(item.id)) || {};
      const packSnap = readJSON<any>(keys.packlist(item.id)) || {};
      const custoSnap = readJSON<any>(keys.custoSnapshot(item.id)) || {};
      const vendaSnap = readJSON<any>(keys.vendaSnapshot(item.id)) || {};
      const aduanaSnap = readJSON<any>(keys.aduanaSnapshot(item.id)) || {};
      
      const statusPack = packSnap.status || (packSnap.totalItems ? 'em-andamento' : 'pendente');
      const statusCusto = custoSnap.status || (custoSnap.valorTotal ? 'em-andamento' : 'pendente');
      const statusVenda = vendaSnap.status || (vendaSnap.valorTotal ? 'em-andamento' : 'pendente');
      const statusAduana = aduanaSnap.status || (aduanaSnap.lancamentos?.length > 0 ? 'em-andamento' : 'pendente');

      const progresso = this.calcularProgresso(statusPack, statusCusto, statusVenda, statusAduana);
      
      // Calcular valores
      const custoValor = custoSnap.valorTotal || 0;
      const vendaValor = vendaSnap.valorTotal || 0;
      const despesasAduana = aduanaSnap.lancamentos?.length > 0 
        ? aduanaSnap.lancamentos[0]?.aduanaCompleta?.totalDespesas || 0 
        : 0;
      const desembolsoAduana = aduanaSnap.lancamentos?.length > 0 
        ? aduanaSnap.lancamentos[0]?.aduanaCompleta?.desembolsoTotal || 0 
        : 0;

      // Info aduana
      const ultimoLancamento = aduanaSnap.lancamentos?.[0]?.aduanaCompleta;
      
      const orc: OrçamentoResumo = {
        id: item.id,
        cliente: item.cliente || 'Cliente não informado',
        codigo: item.codigo || `ORC-${item.id.substring(0, 8)}`,
        data: item.data || new Date().toISOString(),
        status: statusAduana === 'concluido' ? 'finalizado' : 'em-andamento',
        progresso,
        fases: {
          packlist: statusPack as any,
          custo: statusCusto as any,
          venda: statusVenda as any,
          aduana: statusAduana as any
        },
        aduanaInfo: {
          canal: ultimoLancamento?.canal,
          dataEmbarque: ultimoLancamento?.dataEmbarque,
          dataChegada: ultimoLancamento?.dataChegada,
          despesasTotal: despesasAduana,
          desembolsoTotal: desembolsoAduana
        }
      };

      this.custoTotal += custoValor;
      this.vendaTotal += vendaValor;
      this.despesasAduanaTotal += despesasAduana;
      this.desembolsoTotal += desembolsoAduana;

      return orc;
    });

    this.totalOrcamentos = this.orcamentos.length;
    this.orcamentosFinalizados = this.orcamentos.filter(o => o.progresso === 100).length;
    this.orcamentosEmAndamento = this.orcamentos.filter(o => o.progresso > 0 && o.progresso < 100).length;
    
    this.aduanasCriticas = this.orcamentos.filter(o => 
      o.fases.aduana !== 'concluido' && (o.fases.packlist === 'concluido' && o.fases.custo === 'concluido' && o.fases.venda === 'concluido')
    );

    this.orcamentosFiltrados = [...this.orcamentos];
    this.gerarAtividades();
  }

  private calcularProgresso(pack: string, custo: string, venda: string, aduana: string): number {
    let progresso = 0;
    if (pack === 'concluido') progresso += 25;
    if (custo === 'concluido') progresso += 25;
    if (venda === 'concluido') progresso += 25;
    if (aduana === 'concluido') progresso += 25;
    return progresso;
  }

  private gerarAtividades(): void {
    this.atividadesRecentes = this.orcamentos
      .slice(0, 5)
      .map((orc, i) => {
        const tipos = ['packlist', 'custo', 'venda', 'aduana'];
        const tipo = tipos[i % 4];
        return {
          titulo: `Orçamento ${orc.codigo}`,
          descricao: `${orc.cliente} - ${tipo === 'packlist' ? 'Packlist' : tipo === 'custo' ? 'Custo' : tipo === 'venda' ? 'Venda' : 'Aduana'} atualizado`,
          data: new Date(orc.data),
          tipo
        };
      });
  }

  aplicarFiltros(): void {
    if (this.filtroStatus === '') {
      this.orcamentosFiltrados = [...this.orcamentos];
    } else {
      this.orcamentosFiltrados = this.orcamentos.filter(o => {
        if (this.filtroStatus === 'concluido') return o.progresso === 100;
        if (this.filtroStatus === 'em-andamento') return o.progresso > 0 && o.progresso < 100;
        if (this.filtroStatus === 'pendente') return o.progresso === 0;
        return true;
      });
    }
  }

  formatStatus(status: string): string {
    const map: Record<string, string> = {
      'concluido': '✓ Concluído',
      'em-andamento': '⏳ Andamento',
      'pendente': '○ Pendente'
    };
    return map[status] || status;
  }

  abrirDetalhes(orc: OrçamentoResumo): void {
    this.router.navigate(['/orcamento', orc.id]);
  }

  abrirAcompanhamento(orc: OrçamentoResumo): void {
    this.router.navigate(['/orcamento', orc.id]);
  }

  abrirAduana(orc: OrçamentoResumo): void {
    this.router.navigate(['/orcamento', orc.id], { fragment: 'aduana' });
  }

  novoOrcamento(): void {
    this.router.navigate(['/orcamentos/novo']);
  }
}
