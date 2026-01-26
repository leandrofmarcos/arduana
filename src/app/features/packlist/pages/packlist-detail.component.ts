import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PacklistRecord, PacklistStatus } from '../models/packlist.models';
import { PacklistService } from '../services/packlist.service';
import { keys, readJSON } from '../data/storage.helper';

@Component({
  standalone: true,
  selector: 'app-packlist-detalhe',
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="page">
      <div class="header">
        <div>
          <h1>Packlist do processo {{ codigo || orcamentoId }}</h1>
          <p class="subtitle">Cliente: {{ cliente || '-' }} • Despachante: {{ despachante || '-' }}</p>
        </div>
        <div class="header-actions">
          <button class="btn" [disabled]="!detalhe" (click)="baixarArquivo()">⬇️ Download</button>
          <button class="btn secondary" (click)="voltar()">← Voltar</button>
        </div>
      </div>

      <div class="info-grid" *ngIf="detalhe; else emptyState">
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
          <div class="sub">Por {{ detalhe?.enviadoPor || 'Usuário' }}</div>
        </div>
      </div>

      <ng-template #emptyState>
        <div class="empty-card">
          <div class="empty-title">Nenhum packlist enviado ainda</div>
          <div class="empty-desc">Inicie enviando o packlist do cliente com os itens a importar.</div>
        </div>
      </ng-template>

      <div class="card">
        <div class="card-header">Upload / atualização do packlist</div>
        <div class="form-grid">
          <label class="field">
            <span>Arquivo</span>
            <input type="file" (change)="onFileSelect($event)" />
          </label>
          <label class="field">
            <span>Nome do arquivo</span>
            <input type="text" [(ngModel)]="form.arquivoNome" placeholder="packlist.xlsx" />
          </label>
          <label class="field">
            <span>Caminho para download</span>
            <input type="text" [(ngModel)]="form.arquivoCaminho" placeholder="/uploads/packlists/{{orcamentoId}}/packlist.xlsx" />
          </label>
          <label class="field">
            <span>Status</span>
            <select [(ngModel)]="form.status">
              <option value="concluido">Concluído</option>
              <option value="em-andamento">Em andamento</option>
              <option value="pendente">Pendente</option>
            </select>
          </label>
          <label class="field">
            <span>Enviado por</span>
            <input type="text" [(ngModel)]="form.enviadoPor" placeholder="Você" />
          </label>
        </div>
        <button class="btn primary" (click)="salvar()">Salvar packlist</button>
      </div>
    </div>
  `,
  styles: [
    `.page{padding:24px;max-width:1200px;margin:0 auto}`,
    `.header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px}`,
    `.subtitle{color:#6b7280;margin:4px 0 0}`,
    `.btn{border:none;border-radius:8px;padding:10px 14px;background:#2563eb;color:#fff;font-weight:600;cursor:pointer;margin-left:8px}`,
    `.btn.secondary{background:#e5e7eb;color:#111}`,
    `.btn.primary{margin-top:12px}`,
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
    `.table th,.table td{border-bottom:1px solid #e5e7eb;padding:10px;text-align:left;font-size:14px}`,
    `.form-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}`,
    `.field{display:flex;flex-direction:column;gap:6px}`,
    `.field input,.field select{border:1px solid #e5e7eb;border-radius:8px;padding:10px;font-size:14px}`,
    `.empty-card{background:#fff;border:1px dashed #cbd5e1;border-radius:12px;padding:16px;margin-bottom:14px}`,
    `.empty-title{font-weight:700;margin-bottom:4px}`,
    `.empty-desc{color:#6b7280}`
  ]
})
export class PacklistDetalheComponent implements OnInit {
  detalhe: PacklistRecord | null = null;
  orcamentoId = '';
  cliente?: string;
  despachante?: string;
  codigo?: string;
  form: { arquivoNome: string; arquivoCaminho: string; status: PacklistStatus; enviadoPor?: string } = {
    arquivoNome: '',
    arquivoCaminho: '',
    status: 'pendente',
    enviadoPor: 'Usuário'
  };

  constructor(private route: ActivatedRoute, private router: Router, private service: PacklistService) {}

  ngOnInit(): void {
    this.route.params.subscribe(p => {
      this.orcamentoId = p['id'] || '';
      this.loadMeta();
      this.loadPacklist();
    });
  }

  private loadMeta(): void {
    if (!this.orcamentoId) return;
    const meta = readJSON<any>(keys.orcamento(this.orcamentoId));
    this.cliente = meta?.cliente || this.cliente;
    this.despachante = meta?.despachante || this.despachante;
    this.codigo = meta?.codigo || this.codigo || `ORC-${this.orcamentoId}`;
  }

  private loadPacklist(): void {
    if (!this.orcamentoId) return;
    this.detalhe = this.service.getByOrcamentoId(this.orcamentoId);
    if (this.detalhe) {
      this.cliente = this.detalhe.cliente || this.cliente;
      this.despachante = this.detalhe.despachante || this.despachante;
      this.codigo = this.detalhe.codigo || this.codigo;
      this.form = {
        arquivoNome: this.detalhe.arquivoNome,
        arquivoCaminho: this.detalhe.arquivoCaminho,
        status: this.detalhe.status,
        enviadoPor: this.detalhe.enviadoPor || 'Usuário'
      };
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (file) {
      this.form.arquivoNome = file.name;
      if (!this.form.arquivoCaminho) {
        this.form.arquivoCaminho = `/uploads/packlists/${this.orcamentoId}/${file.name}`;
      }
    }
  }

  salvar(): void {
    if (!this.orcamentoId) return;
    const nome = this.form.arquivoNome?.trim();
    if (!nome) {
      alert('Informe o nome do arquivo do packlist.');
      return;
    }
    const caminho = this.form.arquivoCaminho?.trim() || `/uploads/packlists/${this.orcamentoId}/${nome}`;
    const now = new Date().toISOString();
    const saved = this.service.save({
      id: this.detalhe?.id,
      orcamentoId: this.orcamentoId,
      codigo: this.codigo,
      cliente: this.cliente,
      despachante: this.despachante,
      arquivoNome: nome,
      arquivoCaminho: caminho,
      status: this.form.status,
      enviadoEm: now,
      enviadoPor: this.form.enviadoPor || 'Usuário',
      itens: this.detalhe?.itens || []
    });
    this.detalhe = saved;
    this.loadPacklist();
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
    if (!this.detalhe?.arquivoCaminho) return;
    window.open(this.detalhe.arquivoCaminho, '_blank');
  }

  voltar(): void {
    this.router.navigate(['/orcamento']);
  }
}
