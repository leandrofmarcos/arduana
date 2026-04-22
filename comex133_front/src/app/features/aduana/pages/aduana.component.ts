import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { readJSON, keys } from '../../orcamento/data/storage.helper';
import { PageHeaderComponent } from '../../../core/layout/page-header.component';

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
  imports: [CommonModule, RouterModule, FormsModule, PageHeaderComponent],
  template: `
    <div class="container-standard">
      <!-- Header -->
      <app-page-header 
        icon="🛃" 
        title="Dashboard Aduana" 
        subtitle="Controle analítico e acompanhamento detalhado do desembaraço aduaneiro">
      </app-page-header>

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
          <table class="data-table clickable">
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
              <tr *ngFor="let proc of processosFiltrados" (click)="abrirProcesso(proc)">
                <td><strong>{{ proc.codigo }}</strong></td>
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
                <td class="numeric currency">{{ proc.desembolsoTotal ? (proc.desembolsoTotal | currency:'BRL':'symbol':'1.0-0') : '-' }}</td>
                <td>
                  <span class="badge-alert" *ngIf="proc.pendencias.length > 0">{{ proc.pendencias.length }}</span>
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
    /* Estilos adicionais específicos da Aduana */
    .canais-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: var(--spacing-lg);
    }

    .canal-card {
      padding: var(--spacing-lg);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      gap: var(--spacing-lg);
      border: 2px solid;
    }

    .canal-card.verde {
      background: var(--color-success-light);
      border-color: var(--color-success);
    }

    .canal-card.amarelo {
      background: var(--color-warning-light);
      border-color: var(--color-warning);
    }

    .canal-card.vermelho {
      background: var(--color-danger-light);
      border-color: var(--color-danger);
    }

    .canal-card.cinza {
      background: var(--color-border-light);
      border-color: #9ca3af;
    }

    .canal-icon {
      font-size: 36px;
      min-width: 50px;
    }

    .canal-value {
      font-size: 32px;
      font-weight: 700;
      color: var(--color-text);
    }

    .canal-label {
      font-size: 14px;
      font-weight: 600;
      margin-top: var(--spacing-xs);
      color: var(--color-text);
    }

    .canal-desc {
      font-size: 11px;
      color: var(--color-text-muted);
      margin-top: 2px;
    }

    .canal-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .canal-badge.canal-Verde {
      background: var(--color-success-light);
      color: #065f46;
    }

    .canal-badge.canal-Amarelo {
      background: var(--color-warning-light);
      color: #92400e;
    }

    .canal-badge.canal-Vermelho {
      background: var(--color-danger-light);
      color: #991b1b;
    }

    .canal-badge.canal-Cinza {
      background: var(--color-border-light);
      color: #374151;
    }

    .dias-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      font-size: 11px;
      font-weight: 600;
    }

    .dias-badge.normal {
      background: var(--color-success-light);
      color: #065f46;
    }

    .dias-badge.atencao {
      background: var(--color-warning-light);
      color: #92400e;
    }

    .dias-badge.critico {
      background: var(--color-danger-light);
      color: #991b1b;
    }

    .pendencias-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: var(--spacing-lg);
    }

    .pendencia-card {
      border: 2px solid var(--color-danger);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      background: #fff5f5;
    }

    .pendencia-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);
      padding-bottom: var(--spacing-md);
      border-bottom: 1px solid #fecaca;
    }

    .pendencia-header strong {
      color: #991b1b;
    }

    .cliente-name {
      font-size: 12px;
      color: var(--color-text-muted);
    }

    .pendencia-items {
      margin: 0 0 var(--spacing-md) 0;
      padding-left: 20px;
      color: var(--color-text-secondary);
      font-size: 13px;
    }

    .pendencia-items li {
      margin-bottom: 6px;
    }

    .portos-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: var(--spacing-lg);
    }

    .porto-card {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--spacing-lg);
      background: var(--color-subtle-bg);
    }

    .porto-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);
      padding-bottom: var(--spacing-md);
      border-bottom: 1px solid var(--color-border);
    }

    .porto-name {
      font-weight: 600;
      color: var(--color-text);
    }

    .porto-count {
      font-size: 12px;
      color: var(--color-text-muted);
    }

    .porto-stats {
      display: flex;
      gap: var(--spacing-lg);
    }

    .stat-item {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .stat-label {
      font-size: 11px;
      color: var(--color-text-muted);
      text-transform: uppercase;
      margin-bottom: var(--spacing-xs);
    }

    .stat-value {
      font-size: 18px;
      font-weight: 700;
      color: var(--color-text-secondary);
    }

    .financial-summary {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: var(--spacing-lg);
    }

    .fin-card {
      padding: var(--spacing-lg);
      border-radius: var(--radius-lg);
      background: var(--color-subtle-bg);
      border: 1px solid var(--color-border);
    }

    .fin-card.highlight {
      background: var(--gradient-primary);
      color: white;
      border: none;
    }

    .fin-label {
      font-size: 12px;
      color: var(--color-text-muted);
      text-transform: uppercase;
      margin-bottom: var(--spacing-md);
    }

    .fin-card.highlight .fin-label {
      color: rgba(255,255,255,0.9);
    }

    .fin-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--color-text);
    }

    .fin-card.highlight .fin-value {
      color: white;
    }

    .section-header.alert {
      border-bottom-color: var(--color-danger);
    }

    .section-header.alert h2 {
      color: var(--color-danger);
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