import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { OrcamentoService } from '../services/orcamento.service';

interface OrçamentoDetalhe {
  id: string;
  numero: string;
  cliente: string;
  despachante: string;
  codigo: string;
  data: string;
  criadoEm: string;
  atualizadoEm: string;
  fases: {
    criacao: { status: 'concluido' | 'em-andamento' | 'pendente'; data: string };
    packlist: { status: 'concluido' | 'em-andamento' | 'pendente'; data?: string; itens?: number };
    custo: { status: 'concluido' | 'em-andamento' | 'pendente'; data?: string; valor?: number };
    venda: { status: 'concluido' | 'em-andamento' | 'pendente'; data?: string };
    aduana: { status: 'concluido' | 'em-andamento' | 'pendente'; data?: string };
    fechamento: { status: 'concluido' | 'em-andamento' | 'pendente'; data?: string };
  };
}

@Component({
  standalone: true,
  selector: 'app-orcamento-detail',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="detail-container">
      <!-- Header -->
      <div class="detail-header">
        <div class="header-info">
          <h1>{{ orcamento?.numero }}</h1>
          <p class="header-subtitle">{{ orcamento?.cliente }}</p>
        </div>
        <button class="btn btn-secondary" (click)="voltar()">← Voltar</button>
      </div>

      <!-- Timeline Visual do Processo -->
      <div class="timeline-section">
        <div class="timeline-track">
          <div class="timeline-step" [ngClass]="'step-' + getPhaseStatus('criacao')">
            <div class="step-circle">✓</div>
            <div class="step-label">Criação</div>
          </div>
          <div class="timeline-line" [ngClass]="getLineStatus('criacao')"></div>
          
          <div class="timeline-step" [ngClass]="'step-' + getPhaseStatus('packlist')">
            <div class="step-circle">✓</div>
            <div class="step-label">Packlist</div>
          </div>
          <div class="timeline-line" [ngClass]="getLineStatus('packlist')"></div>
          
          <div class="timeline-step" [ngClass]="'step-' + getPhaseStatus('custo')">
            <div class="step-circle">✓</div>
            <div class="step-label">Custo</div>
          </div>
          <div class="timeline-line" [ngClass]="getLineStatus('custo')"></div>
          
          <div class="timeline-step" [ngClass]="'step-' + getPhaseStatus('venda')">
            <div class="step-circle">✓</div>
            <div class="step-label">Venda</div>
          </div>
          <div class="timeline-line" [ngClass]="getLineStatus('venda')"></div>
          
          <div class="timeline-step" [ngClass]="'step-' + getPhaseStatus('fechamento')">
            <div class="step-circle">✓</div>
            <div class="step-label">Fechamento</div>
          </div>
        </div>
      </div>

      <!-- Detalhes Rápidos -->
      <div class="quick-info">
        <div class="info-box">
          <span class="label">Despachante:</span>
          <span class="value">{{ orcamento?.despachante }}</span>
        </div>
        <div class="info-box">
          <span class="label">Código:</span>
          <span class="value">{{ orcamento?.codigo || '-' }}</span>
        </div>
        <div class="info-box">
          <span class="label">Criado em:</span>
          <span class="value">{{ orcamento?.criadoEm | date: 'dd/MM' }}</span>
        </div>
      </div>

      <!-- Fases Detalhadas em Grid -->
      <div class="phases-section">
        <h2>📋 Fases Detalhadas</h2>
        <div class="phases-grid">
          <!-- Packlist -->
          <div class="phase-card" [ngClass]="'status-' + orcamento!.fases.packlist.status">
            <div class="phase-header">
              <h3>📦 Packlist</h3>
              <span class="phase-badge" [ngClass]="'badge-' + orcamento!.fases.packlist.status">{{ formatStatus(orcamento!.fases.packlist.status) }}</span>
            </div>
            <div class="phase-body">
              <p class="phase-desc">Recebimento e validação de itens</p>
              <div class="phase-meta">
                <span *ngIf="orcamento!.fases.packlist.itens">{{ orcamento!.fases.packlist.itens }} itens</span>
                <span *ngIf="orcamento!.fases.packlist.data">{{ orcamento!.fases.packlist.data | date: 'dd/MM/yyyy' }}</span>
              </div>
              <button class="btn btn-sm btn-primary" (click)="irParaPacklist()">Visualizar →</button>
            </div>
          </div>

          <!-- Custo -->
          <div class="phase-card" [ngClass]="'status-' + orcamento!.fases.custo.status">
            <div class="phase-header">
              <h3>💰 Planilha de Custo</h3>
              <span class="phase-badge" [ngClass]="'badge-' + orcamento!.fases.custo.status">{{ formatStatus(orcamento!.fases.custo.status) }}</span>
            </div>
            <div class="phase-body">
              <p class="phase-desc">Cálculo e análise de despesas</p>
              <div class="phase-meta">
                <span *ngIf="orcamento!.fases.custo.valor">R$ {{ orcamento!.fases.custo.valor | number: '1.2-2' }}</span>
                <span *ngIf="orcamento!.fases.custo.data">{{ orcamento!.fases.custo.data | date: 'dd/MM/yyyy' }}</span>
              </div>
              <button class="btn btn-sm btn-primary" (click)="irParaCusto()">Visualizar →</button>
            </div>
          </div>

          <!-- Venda -->
          <div class="phase-card" [ngClass]="'status-' + orcamento!.fases.venda.status">
            <div class="phase-header">
              <h3>🛍️ Planilha de Venda</h3>
              <span class="phase-badge" [ngClass]="'badge-' + orcamento!.fases.venda.status">{{ formatStatus(orcamento!.fases.venda.status) }}</span>
            </div>
            <div class="phase-body">
              <p class="phase-desc">Definição de preços e margens</p>
              <div class="phase-meta">
                <span *ngIf="orcamento!.fases.venda.data">{{ orcamento!.fases.venda.data | date: 'dd/MM/yyyy' }}</span>
              </div>
              <button class="btn btn-sm btn-secondary">Visualizar →</button>
            </div>
          </div>

          <!-- Aduana -->
          <div class="phase-card" [ngClass]="'status-' + orcamento!.fases.aduana.status">
            <div class="phase-header">
              <h3>🏛️ Aduana</h3>
              <span class="phase-badge" [ngClass]="'badge-' + orcamento!.fases.aduana.status">{{ formatStatus(orcamento!.fases.aduana.status) }}</span>
            </div>
            <div class="phase-body">
              <p class="phase-desc">Documentação aduaneira</p>
              <div class="phase-meta">
                <span *ngIf="orcamento!.fases.aduana.data">{{ orcamento!.fases.aduana.data | date: 'dd/MM/yyyy' }}</span>
              </div>
              <button class="btn btn-sm btn-secondary">Visualizar →</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Histórico Compacto -->
      <div class="history-section">
        <h2>📝 Histórico</h2>
        <div class="history-compact">
          <div class="history-item" *ngFor="let item of getHistoricoResumido()">
            <span class="action-badge" [ngClass]="'action-' + item.acao">{{ formatAction(item.acao) }}</span>
            <span class="history-user">{{ item.usuario }}</span>
            <span class="history-desc">{{ item.descricao }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-container {max-width:1400px;margin:0 auto;padding:16px}
    .detail-header {display:flex;justify-content:space-between;align-items:center;padding:24px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;margin-bottom:24px}
    .header-info h1 {margin:0;font-size:28px;color:var(--color-text);font-weight:700}
    .header-subtitle {margin:4px 0 0 0;color:var(--color-muted);font-size:14px}
    .btn {padding:10px 16px;border:none;border-radius:8px;font-weight:600;cursor:pointer;transition:.2s}
    .btn-secondary {background:var(--color-bg);border:2px solid var(--color-border);color:var(--color-text)}
    .btn-secondary:hover {background:var(--color-border)}
    .btn-primary {background:var(--gradient-primary);color:#fff}
    .btn-primary:hover {opacity:0.9}
    .btn-sm {padding:6px 12px;font-size:12px}

    /* Timeline Visual */
    .timeline-section {background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:24px;margin-bottom:24px}
    .timeline-track {display:flex;align-items:center;gap:12px;overflow-x:auto;padding:0}
    .timeline-step {display:flex;flex-direction:column;align-items:center;gap:8px;flex-shrink:0}
    .step-circle {width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;border:2px solid var(--color-border);background:var(--color-bg);color:var(--color-muted)}
    .step-label {font-size:11px;font-weight:600;color:var(--color-muted);text-align:center;width:60px}
    .step-concluido .step-circle {background:#dcfce7;border-color:#22c55e;color:#166534}
    .step-em-andamento .step-circle {background:#bfdbfe;border-color:#3b82f6;color:#1e40af}
    .step-pendente .step-circle {background:var(--color-bg);border-color:var(--color-muted);color:var(--color-muted)}
    .timeline-line {width:40px;height:2px;flex-shrink:0}
    .line-concluido {background:#22c55e}
    .line-em-andamento {background:#3b82f6}
    .line-pendente {background:var(--color-border)}

    /* Quick Info -->
    .quick-info {display:flex;gap:16px;margin-bottom:24px}
    .info-box {background:var(--color-surface);border:1px solid var(--color-border);border-radius:8px;padding:12px;flex:1;display:flex;flex-direction:column;gap:4px}
    .info-box .label {font-size:11px;color:var(--color-muted);font-weight:600;text-transform:uppercase}
    .info-box .value {font-size:14px;color:var(--color-text);font-weight:500}

    /* Phases Grid -->
    .phases-section {background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:24px;margin-bottom:24px}
    .phases-section h2 {margin:0 0 16px 0;font-size:16px;color:var(--color-text)}
    .phases-grid {display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
    .phase-card {background:var(--color-bg);border:2px solid var(--color-border);border-radius:8px;overflow:hidden;display:flex;flex-direction:column}
    .phase-card.status-concluido {border-color:#22c55e;background:#f0fdf4}
    .phase-card.status-em-andamento {border-color:#3b82f6;background:#f0f9ff}
    .phase-card.status-pendente {border-color:var(--color-border);background:var(--color-bg)}
    .phase-header {padding:12px 16px;border-bottom:1px solid var(--color-border);display:flex;justify-content:space-between;align-items:center}
    .phase-header h3 {margin:0;font-size:15px;color:var(--color-text)}
    .phase-badge {padding:4px 8px;border-radius:4px;font-size:11px;font-weight:600}
    .badge-concluido {background:#dcfce7;color:#166534}
    .badge-em-andamento {background:#bfdbfe;color:#1e40af}
    .badge-pendente {background:var(--color-border);color:var(--color-muted)}
    .phase-body {padding:12px 16px;flex:1;display:flex;flex-direction:column;gap:8px}
    .phase-desc {margin:0;font-size:13px;color:var(--color-text)}
    .phase-meta {display:flex;gap:12px;font-size:12px;color:var(--color-muted)}

    /* History -->
    .history-section {background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:24px}
    .history-section h2 {margin:0 0 16px 0;font-size:16px;color:var(--color-text)}
    .history-compact {display:flex;flex-direction:column;gap:8px}
    .history-item {display:flex;align-items:center;gap:12px;padding:8px;background:var(--color-bg);border-radius:6px;font-size:13px}
    .action-badge {padding:2px 8px;border-radius:3px;font-size:10px;font-weight:600}
    .action-create {background:#dcfce7;color:#166534}
    .action-update {background:#bfdbfe;color:#1e40af}
    .action-delete {background:#fee2e2;color:#b91c1c}
    .action-view {background:#f3e8ff;color:#6b21a8}
    .history-user {font-weight:600;color:var(--color-text);min-width:80px}
    .history-desc {color:var(--color-muted);flex:1}

    @media (max-width:768px) {
      .detail-header {flex-direction:column;gap:12px}
      .quick-info {flex-direction:column;gap:8px}
      .phases-grid {grid-template-columns:1fr}
    }
  `]
})
export class OrçamentoDetailComponent implements OnInit {
  orcamento: OrçamentoDetalhe | null = null;
  orcamentoId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orcamentoService: OrcamentoService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.orcamentoId = params['id'];
      if (this.orcamentoId) {
        this.carregarOrçamento(this.orcamentoId);
      }
    });
  }

  private carregarOrçamento(id: string): void {
    const hoje = new Date();
    
    // Orçamento fake COMPLETO
    this.orcamento = {
      id,
      numero: `ORC-2025-0001`,
      cliente: 'Empresa Importadora XYZ',
      despachante: 'Despacho Brasil LTDA',
      codigo: 'PRJ-001',
      data: hoje.toISOString(),
      criadoEm: new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      atualizadoEm: hoje.toISOString(),
      fases: {
        criacao: {
          status: 'concluido',
          data: new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        packlist: {
          status: 'concluido',
          data: new Date(hoje.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          itens: 24
        },
        custo: {
          status: 'concluido',
          data: new Date(hoje.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          valor: 45750.50
        },
        venda: {
          status: 'em-andamento',
          data: new Date(hoje.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        aduana: {
          status: 'em-andamento',
          data: hoje.toISOString()
        },
        fechamento: {
          status: 'pendente'
        }
      }
    };
  }

  getPhaseStatus(phase: 'criacao' | 'packlist' | 'custo' | 'venda' | 'aduana' | 'fechamento'): string {
    return this.orcamento?.fases[phase]?.status || 'pendente';
  }

  getLineStatus(phase: 'criacao' | 'packlist' | 'custo' | 'venda'): string {
    const phaseMap = { criacao: 'packlist', packlist: 'custo', custo: 'venda', venda: 'aduana' };
    const nextPhase = phaseMap[phase];
    const currentStatus = this.getPhaseStatus(phase);
    if (currentStatus === 'concluido') return 'line-concluido';
    if (currentStatus === 'em-andamento') return 'line-em-andamento';
    return 'line-pendente';
  }

  getHistoricoResumido() {
    return [
      { acao: 'create', usuario: 'admin', descricao: 'Orçamento criado' },
      { acao: 'update', usuario: 'despachante', descricao: 'Packlist atualizado (24 itens)' },
      { acao: 'update', usuario: 'financeiro', descricao: 'Custo calculado (R$ 45.750,50)' },
      { acao: 'update', usuario: 'comercial', descricao: 'Planilha de venda iniciada' },
      { acao: 'update', usuario: 'aduana', descricao: 'Documentação aduaneira em processo' }
    ];
  }

  formatStatus(status: string | undefined): string {
    const map: Record<string, string> = {
      'concluido': '✓ Concluído',
      'em-andamento': '⏳ Em Andamento',
      'pendente': '○ Pendente'
    };
    return map[status || ''] || status || '';
  }

  formatAction(acao: string): string {
    const map: Record<string, string> = {
      'create': 'Criado',
      'update': 'Atualizado',
      'delete': 'Deletado',
      'view': 'Visualizado'
    };
    return map[acao] || acao;
  }

  irParaPacklist(): void {
    this.router.navigateByUrl(`/packlist?orcamento=${this.orcamentoId}`);
  }

  irParaCusto(): void {
    this.router.navigateByUrl(`/custo?orcamento=${this.orcamentoId}`);
  }

  voltar(): void {
    this.router.navigateByUrl('/orcamento');
  }
}
