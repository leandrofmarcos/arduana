import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PacklistService } from '../services/packlist.service';
import { PacklistItem, PacklistSummary } from '../models/packlist.models';

@Component({
  standalone: true,
  selector: 'app-packlist-nova',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card" style="margin-top:12px">
      <h2>Packlists</h2>
      <p>Um packlist por orçamento. Mostramos apenas o que foi salvo pelo usuário.</p>
      <table class="table">
        <thead>
          <tr>
            <th style="width:30px"></th>
            <th>Processo</th>
            <th>Cliente</th>
            <th>Despachante</th>
            <th>Status</th>
            <th>Enviado em</th>
            <th>Arquivo</th>
            <th>Itens</th>
            <th style="width:60px">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngIf="summaries.length === 0"><td colspan="9">Nenhum packlist encontrado</td></tr>
          <ng-container *ngFor="let s of summaries; let i = index">
            <tr class="row-main">
              <td class="expand-btn" (click)="toggleExpand(i)">
                <span class="arrow" [class.expanded]="expandedIndex === i">▶</span>
              </td>
              <td>{{s.codigo || s.orcamentoId}}</td>
              <td>{{s.cliente || '-'}} </td>
              <td>{{s.despachante || '-'}} </td>
              <td>{{ formatStatus(s.status) }}</td>
              <td>{{ s.enviadoEm | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ s.arquivoNome || '-' }}</td>
              <td class="items-count">{{s.items}}</td>
              <td>
                <button class="btn-download" (click)="downloadPacklist(s)" title="Download" *ngIf="s.arquivoNome">⬇️</button>
              </td>
            </tr>
            <!-- Expanded detail row -->
            <tr *ngIf="expandedIndex === i" class="row-detail">
              <td colspan="9">
                <div class="detail-content">
                  <h4>Items Importados ({{ s.items }})</h4>
                  <div class="items-preview" *ngIf="s.items > 0">
                    <table class="items-table">
                      <thead>
                        <tr>
                          <th style="width:50px">#</th>
                          <th>Volumes</th>
                          <th>Peso (kg)</th>
                          <th>CBM (m³)</th>
                          <th>Descrição</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let item of getPacklistItems(s.orcamentoId); let j = index">
                          <td class="item-num">{{ j + 1 }}</td>
                          <td>{{ item.volumes || '-' }}</td>
                          <td>{{ item.peso || '-' }}</td>
                          <td>{{ item.cbm || '-' }}</td>
                          <td class="desc">{{ item.descricao || '-' }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </td>
            </tr>
          </ng-container>
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:24px}`,
    `.table{width:100%;border-collapse:collapse;margin-top:12px}`,
    `.table th,.table td{border-bottom:1px solid var(--color-border);padding:10px;text-align:left}`,
    `.table th{background:#f3f4f6;font-weight:600}`,
    `.row-main{cursor:pointer;transition:background 0.2s}`,
    `.row-main:hover{background:#f9fafb}`,
    `.expand-btn{text-align:center;padding:8px;cursor:pointer}`,
    `.arrow{display:inline-block;transition:transform 0.3s;font-size:12px;color:#6b7280}`,
    `.arrow.expanded{transform:rotate(90deg)}`,
    `.items-count{font-weight:500;color:#2563eb}`,
    `.row-detail{background:#f9fafb}`,
    `.row-detail td{border-top:1px solid #e5e7eb;padding:0}`,
    `.detail-content{padding:20px;background:#fff;border-radius:8px;margin:8px}`,
    `.detail-content h4{margin:0 0 12px 0;font-size:14px;font-weight:600;color:#111}`,
    `.items-preview{margin-top:12px}`,
    `.items-table{width:100%;border-collapse:collapse;font-size:12px;background:#fff}`,
    `.items-table th{background:#eff6ff;border-bottom:2px solid #bfdbfe;padding:8px;font-weight:600;color:#1e40af}`,
    `.items-table td{padding:8px;border-bottom:1px solid #e5e7eb}`,
    `.items-table td.item-num{background:#f3f4f6;text-align:center;font-weight:500;color:#9ca3af;width:40px}`,
    `.items-table td.desc{color:#6b7280;font-size:11px}`,
    `.btn-download{width:36px;height:36px;border:none;border-radius:8px;background:#2563eb;color:#fff;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all 0.2s}`,
    `.btn-download:hover{background:#1d4ed8}`
  ]
})
export class PacklistNovaComponent {
  items: PacklistItem[] = [];
  summaries: PacklistSummary[] = [];
  expandedIndex: number | null = null;

  constructor(private s: PacklistService){
    this.summaries = this.s.listPacklists();
  }

  toggleExpand(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  getPacklistItems(orcamentoId: string): any[] {
    const packlist = this.s.getByOrcamentoId(orcamentoId);
    return packlist?.itens || [];
  }

  formatStatus(status: string): string {
    const map: Record<string, string> = {
      'concluido': 'Concluído',
      'em-andamento': 'Em Andamento',
      'pendente': 'Pendente'
    };
    return map[status] || status;
  }

  downloadPacklist(packlist: PacklistSummary): void {
    const caminho = packlist.arquivoCaminho || packlist.arquivoNome;
    if (!caminho) return;

    // Se for uma URL ou caminho público, abre em nova aba; caso contrário, mostra caminho local para referência
    const isPublic = caminho.startsWith('http') || caminho.startsWith('/') || caminho.startsWith('file:');
    if (isPublic) {
      window.open(caminho, '_blank');
    } else {
      alert(`Arquivo armazenado localmente em: ${caminho}`);
    }
  }
}