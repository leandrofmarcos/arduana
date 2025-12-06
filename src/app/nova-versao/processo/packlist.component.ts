import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProcessoServiceNova, PacklistItem, PacklistSummary } from '../services/processo.service';

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
      <p>Listagem de todos os packlists enviados via criação/edição de processo</p>
      <table class="table">
        <thead>
          <tr>
            <th>Processo</th>
            <th>Cliente</th>
            <th>Despachante</th>
            <th>Itens</th>
            <th style="width:120px">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngIf="summaries.length === 0"><td colspan="5">Nenhum packlist encontrado</td></tr>
          <tr *ngFor="let s of summaries">
            <td>{{s.codigo || s.id}}</td>
            <td>{{s.cliente || '-'}} </td>
            <td>{{s.despachante || '-'}} </td>
            <td>{{s.items}}</td>
            <td>
              <div class="row-actions">
                <button class="btn-icon" title="Download CSV">⬇️</button>
              </div>
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
    `.btn-icon{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:2px solid var(--color-border);border-radius:8px;background:var(--color-surface);cursor:pointer}`
  ]
})
export class PacklistNovaComponent {
  items: PacklistItem[] = [];
  summaries: PacklistSummary[] = [];
  constructor(private s: ProcessoServiceNova){
    this.summaries = this.s.listPacklists();
  }
}