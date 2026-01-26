import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

interface OrçamentoDetalhe {
  id: string;
  numero: string;
  cliente: string;
  despachante: string;
  codigo: string;
  data: string;
  status: string;
  criadoEm: string;
  atualizadoEm: string;
  fases: {
    criacao: { status: 'concluido' | 'em-andamento' | 'pendente'; data: string };
    packlist: { status: 'concluido' | 'em-andamento' | 'pendente'; data?: string; itens?: number; arquivoNome?: string; arquivoCaminho?: string };
    custo: { status: 'concluido' | 'em-andamento' | 'pendente'; data?: string; valor?: number };
    venda: { status: 'concluido' | 'em-andamento' | 'pendente'; data?: string };
    aduana: { status: 'concluido' | 'em-andamento' | 'pendente'; data?: string };
    fechamento: { status: 'concluido' | 'em-andamento' | 'pendente'; data?: string };
  };
  historico: Array<{
    id: string;
    acao: string;
    usuario: string;
    data: string;
    descricao: string;
  }>;
}

@Component({
  standalone: true,
  selector: 'app-orcamento-detail-v2',
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

      <!-- Visual Timeline - Semáforo de Fases -->
      <div class="timeline-container">
        <div class="timeline-track">
          <div 
            *ngFor="let phase of fases" 
            [ngClass]="getPhaseClass(phase.key)"
            class="timeline-item"
          >
            <div class="timeline-step" [ngClass]="'status-' + phase.status">
              <div class="step-indicator">
                {{ getPhaseIcon(phase.status) }}
              </div>
            </div>
            <div class="step-label">{{ phase.label }}</div>
          </div>
        </div>
      </div>

      <!-- Quick Info -->
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
          <span class="label">Criado:</span>
          <span class="value">{{ orcamento?.criadoEm | date: 'dd/MM/yyyy' }}</span>
        </div>
      </div>

      <!-- Interações e alertas -->
      <div class="alerts-panel" *ngIf="interacoes.length">
        <div class="alert-card" *ngFor="let alerta of interacoes" [ngClass]="'level-' + alerta.nivel">
          <div class="alert-title">{{ alerta.titulo }}</div>
          <div class="alert-desc">{{ alerta.descricao }}</div>
          <button *ngIf="alerta.acao" class="alert-action" (click)="onAlertAction(alerta)">{{ alerta.acao.label }}</button>
        </div>
      </div>

      <!-- Phase Cards Grid -->
      <div class="phases-grid">
        <div class="phase-card" (click)="navigarParaPacklist()">
          <div class="card-header">📦 Packlist</div>
          <div class="card-value">{{ orcamento?.fases?.packlist?.itens ?? 0 }} itens</div>
          <div class="card-status" [ngClass]="'status-' + (orcamento?.fases?.packlist?.status || 'pendente')">
            {{ formatStatusLabel(orcamento?.fases?.packlist?.status) }}
          </div>
          <div class="card-note" *ngIf="orcamento?.fases?.packlist?.arquivoNome">Arquivo: {{ orcamento?.fases?.packlist?.arquivoNome }}</div>
        </div>

        <div class="phase-card" (click)="navigarParaCusto()">
          <div class="card-header">💰 Custo</div>
          <div class="card-value">R$ {{ formatCurrency(orcamento?.fases?.custo?.valor) }}</div>
          <div class="card-status" [ngClass]="'status-' + (orcamento?.fases?.custo?.status || 'pendente')">
            {{ formatStatusLabel(orcamento?.fases?.custo?.status) }}
          </div>
        </div>

        <div class="phase-card">
          <div class="card-header">🛍️ Venda</div>
          <div class="card-value">R$ 52.500,00</div>
          <div class="card-status" [ngClass]="'status-' + (orcamento?.fases?.venda?.status || 'pendente')">
            {{ formatStatusLabel(orcamento?.fases?.venda?.status) }}
          </div>
        </div>

        <div class="phase-card">
          <div class="card-header">🏛️ Aduana</div>
          <div class="card-value">Documentação</div>
          <div class="card-status" [ngClass]="'status-' + (orcamento?.fases?.aduana?.status || 'pendente')">
            {{ formatStatusLabel(orcamento?.fases?.aduana?.status) }}
          </div>
        </div>
      </div>

      <!-- Historical Actions -->
      <div class="history-section">
        <h3>📋 Histórico de Ações (últimas 5)</h3>
        <div class="history-list">
          <div *ngFor="let item of historicoResumido" class="history-item">
            <div class="history-action" [ngClass]="'action-' + getActionType(item.acao)">
              {{ item.acao }}
            </div>
            <div class="history-date">{{ item.data | date: 'dd/MM HH:mm' }}</div>
            <div class="history-desc">{{ item.descricao }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px;
      background: #f8f9fa;
    }

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .header-info h1 {
      margin: 0;
      font-size: 24px;
      color: #1a1a1a;
    }

    .header-subtitle {
      margin: 4px 0 0 0;
      color: #666;
      font-size: 14px;
    }

    .btn {
      padding: 10px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-secondary {
      background: #e0e0e0;
      color: #333;
    }

    .btn-secondary:hover {
      background: #d0d0d0;
    }

    /* Timeline Visual */
    .timeline-container {
      background: white;
      padding: 24px;
      border-radius: 8px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .timeline-track {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }

    .timeline-item {
      flex: 1;
      text-align: center;
      position: relative;
    }

    .timeline-step {
      display: flex;
      justify-content: center;
      margin-bottom: 12px;
    }

    .step-indicator {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: bold;
      border: 2px solid #ccc;
      background: white;
    }

    .timeline-step.status-concluido .step-indicator {
      background: #22c55e;
      color: white;
      border-color: #16a34a;
    }

    .timeline-step.status-em-andamento .step-indicator {
      background: #3b82f6;
      color: white;
      border-color: #2563eb;
      animation: pulse 2s infinite;
    }

    .timeline-step.status-pendente .step-indicator {
      background: #e5e7eb;
      color: #999;
      border-color: #d1d5db;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .step-label {
      font-size: 14px;
      font-weight: 600;
      color: #333;
      margin-top: 8px;
    }

    /* Quick Info */
    .quick-info {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .info-box {
      background: white;
      padding: 16px;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .info-box .label {
      display: block;
      font-size: 12px;
      color: #999;
      font-weight: 600;
      margin-bottom: 4px;
      text-transform: uppercase;
    }

    .info-box .value {
      display: block;
      font-size: 16px;
      color: #1a1a1a;
      font-weight: 600;
    }

    /* Alerts */
    .alerts-panel {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 12px;
      margin: 12px 0 20px;
    }

    .alert-card {
      border-radius: 10px;
      padding: 14px;
      background: #fff7ed;
      border: 1px solid #fed7aa;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }

    .alert-card.level-warning { background: #fff7ed; border-color: #fdba74; }
    .alert-card.level-danger { background: #fef2f2; border-color: #fecdd3; }
    .alert-card.level-info { background: #eff6ff; border-color: #bfdbfe; }

    .alert-title { font-weight: 700; color: #1f2937; margin-bottom: 6px; }
    .alert-desc { color: #4b5563; font-size: 13px; margin-bottom: 8px; }

    .alert-action {
      padding: 6px 10px;
      border-radius: 6px;
      border: none;
      background: #2563eb;
      color: #fff;
      cursor: pointer;
      font-weight: 600;
      transition: background .2s;
    }

    .alert-action:hover { background: #1d4ed8; }

    /* Phase Cards Grid */
    .phases-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .phase-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid transparent;
    }

    .phase-card:hover {
      border-color: #3b82f6;
      box-shadow: 0 4px 12px rgba(59,130,246,0.15);
    }

    .card-header {
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin-bottom: 12px;
    }

    .card-value {
      font-size: 24px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 12px;
    }

    .card-note {
      font-size: 12px;
      color: #4b5563;
      margin-top: 6px;
    }

    .card-status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }

    .card-status.status-concluido {
      background: #dcfce7;
      color: #166534;
    }

    .card-status.status-em-andamento {
      background: #dbeafe;
      color: #1e40af;
    }

    .card-status.status-pendente {
      background: #f3f4f6;
      color: #666;
    }

    /* History Section */
    .history-section {
      background: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .history-section h3 {
      margin: 0 0 16px 0;
      font-size: 16px;
      color: #1a1a1a;
    }

    .history-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .history-item {
      display: grid;
      grid-template-columns: 120px 1fr 150px;
      gap: 16px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 6px;
      align-items: center;
    }

    .history-action {
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      text-align: center;
    }

    .history-action.action-create {
      background: #dbeafe;
      color: #1e40af;
    }

    .history-action.action-update {
      background: #fef08a;
      color: #854d0e;
    }

    .history-action.action-change {
      background: #fce7f3;
      color: #831843;
    }

    .history-date {
      font-size: 12px;
      color: #999;
      text-align: right;
    }

    .history-desc {
      font-size: 13px;
      color: #666;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .quick-info {
        grid-template-columns: 1fr;
      }

      .phases-grid {
        grid-template-columns: 1fr;
      }

      .timeline-track {
        flex-wrap: wrap;
      }

      .history-item {
        grid-template-columns: 1fr;
        gap: 8px;
      }
    }
  `]
})
export class OrçamentoDetailComponentV2 implements OnInit {
  orcamento: OrçamentoDetalhe | null = null;
  historicoResumido: any[] = [];
  interacoes: Array<{ id: string; titulo: string; descricao: string; nivel: 'info' | 'warning' | 'danger'; acao?: { label: string; rota: any[]; query?: Record<string, any> } }> = [];

  fases = [
    { key: 'criacao', label: 'Criação', status: 'concluido' },
    { key: 'packlist', label: 'Packlist', status: 'concluido' },
    { key: 'custo', label: 'Custo', status: 'em-andamento' },
    { key: 'venda', label: 'Venda', status: 'pendente' },
    { key: 'aduana', label: 'Aduana', status: 'pendente' },
    { key: 'fechamento', label: 'Fechamento', status: 'pendente' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.carregarOrçamento(params['id']);
      }
    });
  }

  carregarOrçamento(id: string): void {
    const meta = this.getMockMetaData(id);
    const hoje = new Date();

    this.orcamento = {
      id,
      numero: meta.codigo || `ORC-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      cliente: meta.cliente || 'Cliente não informado',
      despachante: meta.despachante || '-',
      codigo: meta.codigo || '-',
      data: meta.createdAt || hoje.toISOString(),
      status: 'em-andamento',
      criadoEm: meta.createdAt || hoje.toISOString(),
      atualizadoEm: hoje.toISOString(),
      fases: {
        criacao: { status: 'concluido', data: meta.createdAt || hoje.toISOString() },
        packlist: { status: 'pendente', itens: 0, data: undefined },
        custo: { status: 'pendente', valor: 0, data: undefined },
        venda: { status: 'pendente' },
        aduana: { status: 'pendente' },
        fechamento: { status: 'pendente' }
      },
      historico: [
        {
          id: '1',
          acao: 'CREATE',
          usuario: 'Sistema',
          data: meta.createdAt || hoje.toISOString(),
          descricao: `Orçamento criado para ${meta.cliente || 'cliente'}`
        }
      ]
    };

    this.historicoResumido = this.orcamento.historico.slice(0, 5);

    // Atualizar status das fases baseado em dados reais
    this.fases = this.fases.map(f => {
      if (this.orcamento?.fases[f.key as keyof typeof this.orcamento.fases]) {
        f.status = this.orcamento.fases[f.key as keyof typeof this.orcamento.fases].status;
      }
      return f;
    });

    this.interacoes = this.gerarInteracoes(id);
  }

  private getMockMetaData(id: string): any {
    try {
      const data = (globalThis as any).localStorage?.getItem(`orcamento_${id}`);
      if (data) {
        return JSON.parse(data);
      }
    } catch { }
    return { cliente: 'Novo cliente', codigo: `ORC-${id.substring(0, 8)}`, createdAt: new Date().toISOString() };
  }

  private gerarInteracoes(id: string): any[] {
    const interacoes = [];
    if (this.orcamento?.fases.packlist.status === 'pendente') {
      interacoes.push({
        id: 'packlist-pendente',
        titulo: 'Enviar packlist',
        descricao: 'Inicie enviando o packlist do cliente com os itens a importar.',
        nivel: 'warning',
        acao: { label: 'Ir para packlist', rota: ['/packlist', id] }
      });
    }
    return interacoes;
  }

  getPhaseIcon(status: string): string {
    switch (status) {
      case 'concluido': return '✓';
      case 'em-andamento': return '⏳';
      default: return '○';
    }
  }

  getPhaseClass(key: string): string {
    const phase = this.orcamento?.fases[key as keyof typeof this.orcamento.fases];
    return `status-${phase?.status || 'pendente'}`;
  }

  formatStatusLabel(status?: string): string {
    const labels: Record<string, string> = {
      'concluido': 'Concluído',
      'em-andamento': 'Em Andamento',
      'pendente': 'Pendente'
    };
    return status ? (labels[status] || '-') : '-';
  }

  formatCurrency(value?: number): string {
    if (!value) return '0,00';
    return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  getActionType(acao: string): string {
    const type = acao.toLowerCase();
    if (type === 'create') return 'create';
    if (type === 'change') return 'change';
    return 'update';
  }

  navigarParaPacklist(): void {
    if (!this.orcamento?.id) return;
    this.router.navigate(['/packlist', this.orcamento.id]);
  }

  navigarParaCusto(): void {
    this.router.navigate(['/custo'], { queryParams: { orcamento: this.orcamento?.id } });
  }

  onAlertAction(alerta: { acao?: { rota: any[]; query?: Record<string, any> } }): void {
    if (!alerta.acao) return;
    this.router.navigate(alerta.acao.rota, { queryParams: alerta.acao.query });
  }

  voltar(): void {
    this.router.navigate(['/orcamento']);
  }
}
