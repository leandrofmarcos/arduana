import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

interface PacklistDetalheItem {
  codigo: string;
  descricao: string;
  quantidade: number;
  pesoKg: number;
  volumeM3: number;
  valorUSD: number;
}

interface PacklistDetalhe {
  id: string;
  processo: string;
  cliente: string;
  despachante: string;
  status: 'concluido' | 'pendente' | 'em-andamento';
  arquivoNome: string;
  arquivoCaminho: string;
  enviadoEm: string;
  enviadoPor: string;
  itens: PacklistDetalheItem[];
}

@Component({
  standalone: true,
  selector: 'app-packlist-detalhe',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page">
      <div class="header">
        <div>
          <h1>Packlist do processo {{ detalhe?.processo }}</h1>
          <p class="subtitle">Cliente: {{ detalhe?.cliente }} • Despachante: {{ detalhe?.despachante }}</p>
        </div>
        <div class="header-actions">
          <button class="btn" (click)="baixarArquivo()">⬇️ Download</button>
          <button class="btn secondary" (click)="voltar()">← Voltar</button>
        </div>
      </div>

      <div class="info-grid">
        <div class="info-box">
          <div class="label">Status</div>
          <div class="value" [ngClass]="'badge ' + detalhe?.status">{{ formatStatus(detalhe?.status) }}</div>
        </div>
        <div class="info-box">
          <div class="label">Arquivo</div>
          <div class="value">{{ detalhe?.arquivoNome }}</div>
          <div class="sub">{{ detalhe?.arquivoCaminho }}</div>
        </div>
        <div class="info-box">
          <div class="label">Enviado em</div>
          <div class="value">{{ detalhe?.enviadoEm | date:'dd/MM/yyyy HH:mm' }}</div>
          <div class="sub">Por {{ detalhe?.enviadoPor }}</div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">Itens ({{ detalhe?.itens?.length ?? 0 }})</div>
        <table class="table">
          <thead>
            <tr>
              <th>Código</th>
              <th>Descrição</th>
              <th>Qtd</th>
              <th>Peso (kg)</th>
              <th>Volume (m³)</th>
              <th>Valor (USD)</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let it of detalhe?.itens">
              <td>{{ it.codigo }}</td>
              <td>{{ it.descricao }}</td>
              <td>{{ it.quantidade }}</td>
              <td>{{ it.pesoKg | number:'1.2-2' }}</td>
              <td>{{ it.volumeM3 | number:'1.3-3' }}</td>
              <td>{{ it.valorUSD | number:'1.2-2' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `.page{padding:24px;max-width:1200px;margin:0 auto}`,
    `.header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}`,
    `.subtitle{color:#6b7280;margin:4px 0 0}`,
    `.btn{border:none;border-radius:8px;padding:10px 14px;background:#2563eb;color:#fff;font-weight:600;cursor:pointer;margin-left:8px}`,
    `.btn.secondary{background:#e5e7eb;color:#111}`,
    `.info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin-bottom:18px}`,
    `.info-box{background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px}`,
    `.label{font-size:12px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px}`,
    `.value{font-size:16px;font-weight:700;color:#111}`,
    `.sub{font-size:12px;color:#6b7280;word-break:break-all}`,
    `.badge{display:inline-block;padding:4px 10px;border-radius:999px;font-size:12px}`,
    `.badge.concluido{background:#dcfce7;color:#166534}`,
    `.badge.em-andamento{background:#dbeafe;color:#1e3a8a}`,
    `.badge.pendente{background:#f3f4f6;color:#4b5563}`,
    `.card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:14px}`,
    `.card-header{font-weight:700;margin-bottom:10px}`,
    `.table{width:100%;border-collapse:collapse}`,
    `.table th,.table td{border-bottom:1px solid #e5e7eb;padding:10px;text-align:left;font-size:14px}`
  ]
})
export class PacklistDetalheComponent implements OnInit {
  detalhe: PacklistDetalhe | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      const id = p['id'] || '0001';
      this.mock(id);
    });
  }

  mock(id: string): void {
    this.detalhe = {
      id,
      processo: `ORC-${id}`,
      cliente: 'Empresa Importadora XYZ',
      despachante: 'João Silva',
      status: 'concluido',
      arquivoNome: `packlist-${id}.xlsx`,
      arquivoCaminho: `/uploads/packlists/${id}/packlist.xlsx`,
      enviadoEm: new Date().toISOString(),
      enviadoPor: 'Maria Costa',
      itens: [
        { codigo: 'PL-001', descricao: 'Motor elétrico trifásico', quantidade: 4, pesoKg: 120, volumeM3: 1.24, valorUSD: 8200 },
        { codigo: 'PL-002', descricao: 'Painel de controle industrial', quantidade: 6, pesoKg: 45, volumeM3: 0.52, valorUSD: 3600 },
        { codigo: 'PL-003', descricao: 'Kit de cabos e conectores', quantidade: 20, pesoKg: 18, volumeM3: 0.18, valorUSD: 950 },
        { codigo: 'PL-004', descricao: 'Sensor de temperatura', quantidade: 50, pesoKg: 10, volumeM3: 0.08, valorUSD: 750 },
        { codigo: 'PL-005', descricao: 'Manual técnico impresso', quantidade: 20, pesoKg: 6, volumeM3: 0.04, valorUSD: 120 }
      ]
    };
  }

  formatStatus(status?: string): string {
    const map: Record<string, string> = {
      'concluido': 'Concluído',
      'em-andamento': 'Em Andamento',
      'pendente': 'Pendente'
    };
    return status ? (map[status] || '-') : '-';
  }

  baixarArquivo(): void {
    // Placeholder: em um app real, faria download do caminho informado
    alert('Download simulado de ' + (this.detalhe?.arquivoNome || 'arquivo'));
  }

  voltar(): void {
    this.router.navigate(['/orcamento']);
  }
}
