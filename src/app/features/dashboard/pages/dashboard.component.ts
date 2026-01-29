import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { readJSON, keys } from '../../orcamento/data/storage.helper';
import { PageHeaderComponent } from '../../../core/layout/page-header.component';

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
  imports: [CommonModule, RouterModule, FormsModule, PageHeaderComponent],
  template: `
    <div class="container-standard">
      <!-- Header -->
      <app-page-header 
        icon="📊" 
        title="Dashboard de Importações" 
        subtitle="Acompanhamento completo de orçamentos e fases de desembaraço">
        <button class="btn btn-primary" (click)="novoOrcamento()">+ Novo Orçamento</button>
      </app-page-header>

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

      <!-- Resumo Financeiro -->
      <div class="content-section">
        <div class="section-header">
          <h2>💰 Resumo Financeiro</h2>
        </div>

        <div class="financial-grid">
          <div class="fin-card">
            <div class="fin-label">Custos Totais</div>
            <div class="fin-value">{{ custoTotal | currency:'BRL' }}</div>
            <div class="fin-sub">Todos os orçamentos</div>
          </div>
          <div class="fin-card">
            <div class="fin-label">Vendas Totais</div>
            <div class="fin-value highlight">{{ vendaTotal | currency:'BRL' }}</div>
            <div class="fin-sub">Margem de lucro</div>
          </div>
          <div class="fin-card">
            <div class="fin-label">Aduana (Despesas)</div>
            <div class="fin-value">{{ despesasAduanaTotal | currency:'BRL' }}</div>
            <div class="fin-sub">Desembaraço</div>
          </div>
          <div class="fin-card highlight">
            <div class="fin-label">Desembolso Total</div>
            <div class="fin-value">{{ desembolsoTotal | currency:'BRL' }}</div>
            <div class="fin-sub">Custo + Aduana</div>
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
          <table class="data-table">
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
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="orcamentosFiltrados.length === 0">
                <td colspan="8" class="empty-state">Nenhum orçamento encontrado</td>
              </tr>
              <tr *ngFor="let orc of orcamentosFiltrados" class="clickable" (click)="abrirDetalhes(orc)">
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
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Seção de Aduana (Crítica) -->
      <div class="content-section" *ngIf="aduanasCriticas.length > 0">
        <div class="section-header alert">
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
    /* Dashboard-specific styles - minimal, component-specific only */
    
    /* Progress Bar */
    .progresso-bar {
      position: relative;
      height: 20px;
      background: var(--color-border-light);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .progresso-fill {
      height: 100%;
      background: var(--gradient-primary);
      transition: width var(--transition-standard);
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
      gap: var(--spacing-sm);
    }

    .btn-icon {
      background: transparent;
      border: none;
      cursor: pointer;
      font-size: 16px;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      transition: background var(--transition-standard);
    }

    .btn-icon:hover {
      background: var(--color-border-light);
    }

    /* Aduana Cards - Alert style */
    .aduana-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--spacing-lg);
    }

    .aduana-card {
      border: 2px solid var(--color-danger);
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: var(--color-danger-light);
    }

    .aduana-card .card-header {
      background: var(--color-danger);
      color: white;
      padding: var(--spacing-md);
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
      padding: var(--spacing-md);
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--spacing-sm) 0;
      border-bottom: 1px solid rgba(239, 68, 68, 0.1);
      font-size: 13px;
    }

    .info-row label {
      font-weight: 600;
      color: var(--color-text-secondary);
    }

    .info-row.financial {
      background: white;
      padding: var(--spacing-md);
      border-radius: var(--radius-sm);
      border-bottom: none;
    }

    .info-row .amount {
      font-weight: 700;
      color: var(--color-danger);
      font-size: 14px;
    }

    .aduana-card .card-footer {
      padding: var(--spacing-md);
      border-top: 1px solid rgba(239, 68, 68, 0.1);
      text-align: center;
    }

    .btn-small {
      background: var(--color-danger);
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: var(--radius-md);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-standard);
    }

    .btn-small:hover {
      background: #dc2626;
      transform: translateY(-1px);
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
      background: var(--color-border);
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
      border: 3px solid var(--color-primary);
    }

    .timeline-marker.packlist {
      border-color: var(--color-success);
    }

    .timeline-marker.custo {
      border-color: var(--color-warning);
    }

    .timeline-marker.venda {
      border-color: #17a2b8;
    }

    .timeline-marker.aduana {
      border-color: var(--color-danger);
    }

    .timeline-title {
      font-weight: 600;
      color: var(--color-text);
      margin-bottom: var(--spacing-xs);
    }

    .timeline-desc {
      font-size: 13px;
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-xs);
    }

    .timeline-time {
      font-size: 11px;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .empty-timeline {
      text-align: center;
      color: var(--color-text-muted);
      padding: var(--spacing-2xl);
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
    let lista = [...this.orcamentos];
    
    if (this.filtroStatus !== '') {
      lista = lista.filter(o => {
        if (this.filtroStatus === 'concluido') return o.progresso === 100;
        if (this.filtroStatus === 'em-andamento') return o.progresso > 0 && o.progresso < 100;
        if (this.filtroStatus === 'pendente') return o.progresso === 0;
        return true;
      });
    }
    
    // Ordenar: packlist pendente primeiro
    lista.sort((a, b) => {
      if (a.fases.packlist === 'pendente' && b.fases.packlist !== 'pendente') return -1;
      if (a.fases.packlist !== 'pendente' && b.fases.packlist === 'pendente') return 1;
      return 0;
    });
    
    this.orcamentosFiltrados = lista;
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

  abrirAduana(orc: OrçamentoResumo): void {
    this.router.navigate(['/orcamento', orc.id], { fragment: 'aduana' });
  }

  novoOrcamento(): void {
    this.router.navigate(['/orcamentos/novo']);
  }
}
