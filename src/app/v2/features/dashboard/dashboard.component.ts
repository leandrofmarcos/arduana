import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { readV2, keysV2 } from '../../core/helpers/storage-v2.helper';
import { SeedDemoService } from '../../core/helpers/seed-demo.service';
import { EmbarqueAduana, FreeTimeEmbarque, PagamentoProcesso, StatusEmbarque } from '../embarque-aduana/models/embarque-aduana.models';
import { CustoDespachante } from '../custo-despachante/models/custo-despachante.models';
import { OrcamentoVenda } from '../orcamento-venda/models/orcamento-venda.models';
import { ClienteV2 } from '../cadastros/clientes/models/cliente-v2.models';

interface KpiEmbarque {
  codigoInterno: string;
  clienteNome: string;
  eta: string;
  diasRestantes: number;
  statusNome: string;
}

interface KpiFreeTime {
  embarqueCodigo: string;
  clienteNome: string;
  dataFim: string;
  diasRestantes: number;
  vencido: boolean;
}

interface KpiPagamento {
  embarqueCodigo: string;
  tipo: string;
  dataPrevista: string;
  valor: number;
  diasAtraso: number;
}

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
        <div class="page-header-top">
          <div>
            <h1 class="page-title">📊 Dashboard</h1>
            <p class="page-subtitle">Visão geral do sistema — {{ dataAtual }}</p>
          </div>
          <div class="demo-actions">
            <button *ngIf="!demoCarregado" class="btn-demo-load" (click)="carregarDemo()">
              🎭 Carregar Dados Demo
            </button>
            <button *ngIf="demoCarregado" class="btn-demo-clear" (click)="limparDemo()">
              🗑 Limpar Dados Demo
            </button>
          </div>
        </div>
      </div>

      <!-- Banner boas-vindas (apenas quando sem dados) -->
      <div class="welcome-banner" *ngIf="!demoCarregado && kpi.embarquesAtivos === 0 && kpi.custosMes === 0">
        <div class="welcome-icon">🚢</div>
        <div class="welcome-body">
          <p class="welcome-title">Bem-vindo ao Sistema Aduana V2</p>
          <p class="welcome-sub">O sistema está pronto. Carregue os dados demo para visualizar todos os cenários de negócio ou comece cadastrando os dados manualmente.</p>
        </div>
        <button class="btn-demo-load" (click)="carregarDemo()">🎭 Carregar Dados Demo</button>
      </div>

      <!-- ═══ KPI Cards ════════════════════════════════════════════════════ -->
      <div class="kpi-grid">
        <div class="kpi-card kpi-blue" routerLink="/embarques">
          <div class="kpi-icon">🚢</div>
          <div class="kpi-body">
            <div class="kpi-value">{{ kpi.embarquesAtivos }}</div>
            <div class="kpi-label">Embarques Ativos</div>
          </div>
          <div class="kpi-arrow">→</div>
        </div>

        <div class="kpi-card kpi-purple" routerLink="/orcamentos-venda">
          <div class="kpi-icon">💼</div>
          <div class="kpi-body">
            <div class="kpi-value">{{ kpi.orcamentosPendentes }}</div>
            <div class="kpi-label">Orçamentos sem Embarque</div>
          </div>
          <div class="kpi-arrow">→</div>
        </div>

        <div class="kpi-card kpi-green" routerLink="/custos">
          <div class="kpi-icon">🧾</div>
          <div class="kpi-body">
            <div class="kpi-value">{{ kpi.custosMes }}</div>
            <div class="kpi-label">Custos este Mês</div>
          </div>
          <div class="kpi-arrow">→</div>
        </div>

        <div class="kpi-card" [class.kpi-red]="kpi.freeTimesVencendo > 0" [class.kpi-muted]="kpi.freeTimesVencendo === 0" routerLink="/embarques">
          <div class="kpi-icon">⏳</div>
          <div class="kpi-body">
            <div class="kpi-value">{{ kpi.freeTimesVencendo }}</div>
            <div class="kpi-label">Free Times ≤ 7 dias</div>
          </div>
          <div class="kpi-arrow">→</div>
        </div>

        <div class="kpi-card" [class.kpi-orange]="kpi.pagamentosPendentes > 0" [class.kpi-muted]="kpi.pagamentosPendentes === 0" routerLink="/embarques">
          <div class="kpi-icon">💳</div>
          <div class="kpi-body">
            <div class="kpi-value">{{ kpi.pagamentosPendentes }}</div>
            <div class="kpi-label">Pagamentos em Atraso</div>
          </div>
          <div class="kpi-arrow">→</div>
        </div>
      </div>

      <!-- ═══ Row 2: Status chart + Próximos ETAs ═══════════════════════ -->
      <div class="row-2">

        <!-- Embarques por Status -->
        <div class="panel">
          <div class="panel-header">🗂️ Embarques por Status</div>
          <div class="panel-body">
            <div *ngIf="statusCounts.length === 0" class="empty-panel">Nenhum embarque cadastrado.</div>
            <div class="status-bar-list" *ngIf="statusCounts.length > 0">
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

        <!-- Próximos ETAs -->
        <div class="panel">
          <div class="panel-header">📅 Próximos ETAs</div>
          <div class="panel-body">
            <div *ngIf="proximosEtas.length === 0" class="empty-panel">Nenhum embarque com ETA futuro.</div>
            <div class="eta-list" *ngIf="proximosEtas.length > 0">
              <div class="eta-item" *ngFor="let e of proximosEtas" [routerLink]="['/embarques']">
                <div class="eta-left">
                  <span class="eta-code">{{ e.codigoInterno }}</span>
                  <span class="eta-client">{{ e.clienteNome }}</span>
                </div>
                <div class="eta-right">
                  <span class="eta-date">{{ e.eta | date:'dd/MM/yyyy' }}</span>
                  <span class="eta-days" [class.urgent]="e.diasRestantes <= 7">
                    {{ e.diasRestantes === 0 ? 'Hoje' : e.diasRestantes + 'd' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ Row 3: Free Times + Pagamentos em Atraso ═════════════════ -->
      <div class="row-2">

        <!-- Free Times Vencendo -->
        <div class="panel">
          <div class="panel-header">⏳ Free Times Vencendo (≤ 7 dias)</div>
          <div class="panel-body">
            <div *ngIf="freeTimesAlerta.length === 0" class="empty-panel success-empty">✅ Nenhum free time vencendo.</div>
            <div class="alert-list" *ngIf="freeTimesAlerta.length > 0">
              <div class="alert-item" *ngFor="let ft of freeTimesAlerta" [class.vencido]="ft.vencido" [routerLink]="['/embarques']">
                <div class="alert-left">
                  <span class="alert-code">{{ ft.embarqueCodigo }}</span>
                  <span class="alert-sub">{{ ft.clienteNome }}</span>
                </div>
                <div class="alert-right">
                  <span class="alert-date">{{ ft.dataFim | date:'dd/MM/yyyy' }}</span>
                  <span class="alert-badge" [class.badge-red]="ft.vencido" [class.badge-orange]="!ft.vencido">
                    {{ ft.vencido ? 'Vencido' : ft.diasRestantes + 'd restantes' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagamentos em Atraso -->
        <div class="panel">
          <div class="panel-header">💳 Pagamentos em Atraso</div>
          <div class="panel-body">
            <div *ngIf="pagamentosAtraso.length === 0" class="empty-panel success-empty">✅ Nenhum pagamento em atraso.</div>
            <div class="alert-list" *ngIf="pagamentosAtraso.length > 0">
              <div class="alert-item vencido" *ngFor="let p of pagamentosAtraso" [routerLink]="['/embarques']">
                <div class="alert-left">
                  <span class="alert-code">{{ p.embarqueCodigo }}</span>
                  <span class="alert-sub">{{ p.tipo }}</span>
                </div>
                <div class="alert-right">
                  <span class="alert-date">{{ p.dataPrevista | date:'dd/MM/yyyy' }}</span>
                  <span class="alert-badge badge-red">{{ p.diasAtraso }}d atraso</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .dashboard-page { max-width: 1100px; }
    .page-header { margin-bottom: 28px; }
    .page-header-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .page-title { margin: 0 0 4px; font-size: 24px; font-weight: 700; color: var(--color-text); }
    .page-subtitle { margin: 0; color: var(--color-muted); font-size: 14px; }

    /* Demo actions */
    .demo-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
    .btn-demo-load {
      padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer;
      background: #3b82f6; color: #fff; font-size: 13px; font-weight: 600;
      transition: background .15s;
    }
    .btn-demo-load:hover { background: #2563eb; }
    .btn-demo-clear {
      padding: 8px 16px; border-radius: 8px; border: 1px solid var(--color-border); cursor: pointer;
      background: var(--color-surface); color: var(--color-muted); font-size: 13px;
      transition: background .15s, color .15s;
    }
    .btn-demo-clear:hover { background: #fef2f2; color: #b91c1c; border-color: #fca5a5; }

    /* Welcome banner */
    .welcome-banner {
      display: flex; align-items: center; gap: 16px;
      background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
      border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px 24px;
      margin-bottom: 28px;
    }
    .welcome-icon { font-size: 36px; flex-shrink: 0; }
    .welcome-body { flex: 1; }
    .welcome-title { margin: 0 0 4px; font-weight: 700; color: var(--color-text); font-size: 15px; }
    .welcome-sub { margin: 0; font-size: 13px; color: var(--color-muted); }

    /* KPI Cards */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      padding: 18px 16px;
      display: flex;
      align-items: center;
      gap: 14px;
      cursor: pointer;
      transition: box-shadow .15s, transform .15s;
      text-decoration: none;
      color: inherit;
      border-left: 4px solid transparent;
    }
    .kpi-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.1); transform: translateY(-1px); }
    .kpi-blue   { border-left-color: #3b82f6; }
    .kpi-purple { border-left-color: #8b5cf6; }
    .kpi-green  { border-left-color: #22c55e; }
    .kpi-red    { border-left-color: #ef4444; }
    .kpi-orange { border-left-color: #f97316; }
    .kpi-muted  { border-left-color: var(--color-border); }
    .kpi-icon { font-size: 28px; flex-shrink: 0; }
    .kpi-body { flex: 1; }
    .kpi-value { font-size: 28px; font-weight: 800; color: var(--color-text); line-height: 1; }
    .kpi-label { font-size: 12px; color: var(--color-muted); margin-top: 3px; }
    .kpi-arrow { color: var(--color-muted); font-size: 16px; }

    /* Panels row */
    .row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    @media (max-width: 700px) { .row-2 { grid-template-columns: 1fr; } }

    .panel {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 12px;
      overflow: hidden;
    }
    .panel-header {
      padding: 12px 16px;
      background: var(--color-bg);
      border-bottom: 1px solid var(--color-border);
      font-weight: 700;
      font-size: 14px;
      color: var(--color-text);
    }
    .panel-body { padding: 12px; }
    .empty-panel { text-align: center; color: var(--color-muted); font-size: 13px; padding: 16px 0; }
    .success-empty { color: #22c55e; }

    /* Status bars */
    .status-bar-list { display: flex; flex-direction: column; gap: 8px; }
    .status-bar-row { display: flex; align-items: center; gap: 8px; }
    .status-bar-label { font-size: 12px; color: var(--color-text-muted, #64748b); min-width: 110px; }
    .status-bar-track { flex: 1; height: 8px; background: var(--color-border); border-radius: 4px; overflow: hidden; }
    .status-bar-fill { height: 100%; border-radius: 4px; transition: width .4s; }
    .status-bar-count { font-size: 12px; font-weight: 700; color: var(--color-text); min-width: 20px; text-align: right; }

    /* ETA list */
    .eta-list { display: flex; flex-direction: column; gap: 6px; }
    .eta-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      border-radius: 8px;
      background: var(--color-bg);
      cursor: pointer;
      transition: .12s;
    }
    .eta-item:hover { background: var(--color-border); }
    .eta-left { display: flex; flex-direction: column; }
    .eta-code { font-size: 13px; font-weight: 700; color: var(--color-text); }
    .eta-client { font-size: 11px; color: var(--color-muted); }
    .eta-right { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
    .eta-date { font-size: 12px; color: var(--color-text); }
    .eta-days { font-size: 11px; font-weight: 700; color: var(--color-muted); }
    .eta-days.urgent { color: #ef4444; }

    /* Alert list */
    .alert-list { display: flex; flex-direction: column; gap: 6px; }
    .alert-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      border-radius: 8px;
      background: var(--color-bg);
      cursor: pointer;
      transition: .12s;
    }
    .alert-item:hover { background: var(--color-border); }
    .alert-item.vencido { background: #fef2f2; }
    .alert-item.vencido:hover { background: #fee2e2; }
    .alert-left { display: flex; flex-direction: column; }
    .alert-code { font-size: 13px; font-weight: 700; color: var(--color-text); }
    .alert-sub { font-size: 11px; color: var(--color-muted); }
    .alert-right { display: flex; flex-direction: column; align-items: flex-end; gap: 3px; }
    .alert-date { font-size: 12px; color: var(--color-text); }
    .alert-badge { font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 4px; }
    .badge-red    { background: #fee2e2; color: #b91c1c; }
    .badge-orange { background: #ffedd5; color: #c2410c; }
  `]
})
export class DashboardV2Component implements OnInit {
  dataAtual = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  demoCarregado = false;

  constructor(private seedDemoService: SeedDemoService) {}

  kpi = {
    embarquesAtivos:    0,
    orcamentosPendentes: 0,
    custosMes:          0,
    freeTimesVencendo:  0,
    pagamentosPendentes: 0,
  };

  statusCounts: StatusCount[] = [];
  maxStatusCount = 1;
  proximosEtas:   KpiEmbarque[]   = [];
  freeTimesAlerta: KpiFreeTime[]  = [];
  pagamentosAtraso: KpiPagamento[] = [];

  private STATUS_CORES: Record<string, string> = {
    Previsto:       '#94a3b8',
    Aguardando:     '#f97316',
    Atracado:       '#eab308',
    Registrado:     '#3b82f6',
    'Desembaraçado': '#8b5cf6',
    Entregue:       '#22c55e',
    Finalizado:     '#64748b',
  };

  private PAGAMENTO_LABELS: Record<string, string> = {
    CobrancaSinal:  'Cobrança Sinal',
    SinalPago:      'Sinal Pago',
    FechamentoPago: 'Fechamento Pago',
    Honorario:      'Honorário',
    Outro:          'Outro',
  };

  ngOnInit(): void {
    this.demoCarregado = this.seedDemoService.isDemoCarregado();
    this.calcular();
  }

  carregarDemo(): void {
    this.seedDemoService.carregarSeedDemo();
    this.demoCarregado = true;
    this.calcular();
  }

  limparDemo(): void {
    if (!confirm('Limpar todos os dados demo? Dados inseridos manualmente também serão removidos.')) return;
    this.seedDemoService.limparSeedDemo();
    this.demoCarregado = false;
    this.calcular();
  }

  private calcular(): void {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const mesAtual = hoje.getMonth();
    const anoAtual = hoje.getFullYear();

    const embarques    = readV2<EmbarqueAduana>(keysV2.embarques);
    const statusList   = readV2<StatusEmbarque>(keysV2.statusEmbarque);
    const orcamentos   = readV2<OrcamentoVenda>(keysV2.orcamentosVenda);
    const custos       = readV2<CustoDespachante>(keysV2.custos);
    const freeTimes    = readV2<FreeTimeEmbarque>(keysV2.freeTimes);
    const pagamentos   = readV2<PagamentoProcesso>(keysV2.pagamentos);
    const clientes     = readV2<ClienteV2>(keysV2.clientes);

    const statusMap = new Map(statusList.map(s => [s.id, s]));
    const clienteMap = new Map(clientes.map(c => [c.id, c.razaoSocial]));
    const statusFinalizado = statusList.find(s => s.codigo === 'FNLZ');

    // ── Embarques Ativos (status != Finalizado)
    const embarquesAtivos = statusFinalizado
      ? embarques.filter(e => e.statusEmbarqueId !== statusFinalizado.id)
      : embarques;
    this.kpi.embarquesAtivos = embarquesAtivos.length;

    // ── Orçamentos sem embarque vinculado
    const ovComEmbarque = new Set(embarques.map(e => e.orcamentoVendaId).filter(Boolean));
    this.kpi.orcamentosPendentes = orcamentos.filter(o => !ovComEmbarque.has(o.id)).length;

    // ── Custos criados no mês atual
    this.kpi.custosMes = custos.filter(c => {
      const d = new Date(c.data);
      return d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    }).length;

    // ── Embarques por Status (bar chart)
    const countByStatus = new Map<string, number>();
    embarques.forEach(e => {
      const nome = statusMap.get(e.statusEmbarqueId)?.nome ?? 'Desconhecido';
      countByStatus.set(nome, (countByStatus.get(nome) ?? 0) + 1);
    });
    this.statusCounts = [...countByStatus.entries()]
      .map(([nome, count]) => ({ nome, count, cor: this.STATUS_CORES[nome] ?? '#94a3b8' }))
      .sort((a, b) => b.count - a.count);
    this.maxStatusCount = Math.max(1, ...this.statusCounts.map(s => s.count));

    // ── Próximos ETAs (5 embarques com ETA >= hoje, ordenados ASC)
    this.proximosEtas = embarques
      .filter(e => new Date(e.eta) >= hoje)
      .sort((a, b) => a.eta.localeCompare(b.eta))
      .slice(0, 5)
      .map(e => {
        const etaDate = new Date(e.eta);
        const diasRestantes = Math.ceil((etaDate.getTime() - hoje.getTime()) / 86400000);
        return {
          codigoInterno: e.codigoInterno,
          clienteNome: clienteMap.get(e.clienteId) ?? '—',
          eta: e.eta,
          diasRestantes,
          statusNome: statusMap.get(e.statusEmbarqueId)?.nome ?? '—',
        };
      });

    // ── Free Times vencendo (dataFim <= 7 dias, ou já vencidos)
    const limite7 = new Date(hoje);
    limite7.setDate(limite7.getDate() + 7);
    const embarqueMap = new Map(embarques.map(e => [e.id, e]));

    this.freeTimesAlerta = freeTimes
      .filter(ft => new Date(ft.dataFim) <= limite7)
      .map(ft => {
        const dataFimDate = new Date(ft.dataFim);
        const dias = Math.ceil((dataFimDate.getTime() - hoje.getTime()) / 86400000);
        const embarque = embarqueMap.get(ft.embarqueAduanaId);
        return {
          embarqueCodigo: embarque?.codigoInterno ?? '—',
          clienteNome: clienteMap.get(embarque?.clienteId ?? '') ?? '—',
          dataFim: ft.dataFim,
          diasRestantes: Math.max(0, dias),
          vencido: dias < 0,
        };
      })
      .sort((a, b) => a.dataFim.localeCompare(b.dataFim));

    this.kpi.freeTimesVencendo = this.freeTimesAlerta.filter(ft => !ft.vencido).length;

    // ── Pagamentos em atraso (dataPrevista < hoje, sem dataPagamento)
    this.pagamentosAtraso = pagamentos
      .filter(p => !p.dataPagamento && new Date(p.dataPrevista) < hoje)
      .map(p => {
        const prevDate = new Date(p.dataPrevista);
        const diasAtraso = Math.ceil((hoje.getTime() - prevDate.getTime()) / 86400000);
        const embarque = embarqueMap.get(p.embarqueAduanaId);
        return {
          embarqueCodigo: embarque?.codigoInterno ?? '—',
          tipo: this.PAGAMENTO_LABELS[p.tipoPagamento] ?? p.tipoPagamento,
          dataPrevista: p.dataPrevista,
          valor: p.valor,
          diasAtraso,
        };
      })
      .sort((a, b) => b.diasAtraso - a.diasAtraso);

    this.kpi.pagamentosPendentes = this.pagamentosAtraso.length;
  }
}

