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
    <div class="card" *ngIf="false">
      <h2>Packlist</h2>
      <p>Itens vinculados ao processo atual</p>
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
          <tr *ngIf="items.length === 0"><td colspan="6">Nenhum item</td></tr>
          <tr *ngFor="let it of items">
            <td>{{it.codigo}}</td>
            <td>{{it.descricao}}</td>
            <td>{{it.quantidade}}</td>
            <td>{{it.pesoKg}}</td>
            <td>{{it.volumeM3 || '-'}}</td>
            <td>{{it.valorUSD | number:'1.2-2'}}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="card" style="margin-top:12px">
      <h2>Packlists</h2>
      <p>Um packlist por orçamento. Mostramos apenas o que foi salvo pelo usuário.</p>
      <table class="table">
        <thead>
          <tr>
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
          <tr *ngIf="summaries.length === 0"><td colspan="8">Nenhum packlist encontrado</td></tr>
          <tr *ngFor="let s of summaries">
            <td>{{s.codigo || s.orcamentoId}}</td>
            <td>{{s.cliente || '-'}} </td>
            <td>{{s.despachante || '-'}} </td>
            <td>{{ formatStatus(s.status) }}</td>
            <td>{{ s.enviadoEm | date:'dd/MM/yyyy HH:mm' }}</td>
            <td>{{ s.arquivoNome || '-' }}</td>
            <td>{{s.items}}</td>
            <td>
              <button class="btn-download" (click)="downloadPacklist(s)" title="Download" *ngIf="s.arquivoNome">⬇️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:24px}`,
    `.table{width:100%;border-collapse:collapse;margin-top:12px}`,
    `.table th,.table td{border-bottom:1px solid var(--color-border);padding:10px;text-align:left}`,
    `.row-actions{display:flex;gap:8px}`,
    `.btn-icon{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:2px solid var(--color-border);border-radius:8px;background:var(--color-surface);cursor:pointer}`,
    `.btn-download{width:36px;height:36px;border:none;border-radius:8px;background:#2563eb;color:#fff;cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;transition:all 0.2s}`,
    `.btn-download:hover{background:#1d4ed8}`
  ]
})
export class PacklistNovaComponent {
  items: PacklistItem[] = [];
  summaries: PacklistSummary[] = [];
  constructor(private s: PacklistService){
    this.summaries = this.s.listPacklists();
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