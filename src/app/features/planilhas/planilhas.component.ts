import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanilhasService } from './planilhas.service';
import { PlanilhaListItem } from '../../domain/planilha.catalog';

@Component({
  selector: 'app-planilhas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="content-header">
      <h1>Planilhas de Custo <small>Listagem com filtros e paginação</small></h1>
      <ul class="breadcrumb"><li>Home</li><li>Planilhas</li></ul>
    </div>
    <div class="content">
      <div class="toolbar">
        <input type="text" [(ngModel)]="q" placeholder="Buscar por produto, cliente ou processo" />
        <select [(ngModel)]="origem">
          <option value="">Todas as origens</option>
          <option>China</option>
          <option>EUA</option>
          <option>Europa</option>
          <option>Ásia</option>
        </select>
        <select [(ngModel)]="pageSize">
          <option [value]="10">10</option>
          <option [value]="20">20</option>
          <option [value]="50">50</option>
        </select>
        <button class="btn btn-primary" (click)="nova()"><span class="icon">＋</span> Nova Planilha</button>
      </div>
      <div class="card">
        <table class="grid">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Cliente</th>
              <th>Processo</th>
              <th>Origem</th>
              <th>Data</th>
              <th style="text-align:right">Tributos</th>
              <th style="text-align:right">Desembolso Total</th>
              <th style="width:280px">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of pageRows">
              <td>{{row.produto}}</td>
              <td>{{row.cliente}}</td>
              <td>{{row.processo}}</td>
              <td>{{row.origem}}</td>
              <td>{{row.dataSimulacao | date:'shortDate'}}</td>
              <td style="text-align:right">{{row.tributos | currency:'BRL'}}</td>
              <td style="text-align:right">{{row.desembolsoTotal | currency:'BRL'}}</td>
              <td>
                <button class="btn btn-secondary" (click)="abrir(row.id)">Abrir</button>
                <button class="btn btn-secondary" (click)="duplicar(row.id)">Duplicar</button>
                <button class="btn btn-danger" (click)="excluir(row.id)">Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="pagination">
          <button class="page" [disabled]="page===1" (click)="setPage(page-1)">◀</button>
          <span>Página {{page}} de {{totalPages}}</span>
          <button class="page" [disabled]="page===totalPages" (click)="setPage(page+1)">▶</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.content-header{background:var(--color-surface);border-bottom:1px solid var(--color-border);padding:12px 16px}`,
    `.content-header h1{margin:0;font-size:18px;color:var(--color-text)}`,
    `.content-header small{color:var(--color-muted);font-weight:400}`,
    `.breadcrumb{list-style:none;margin:6px 0 0 0;padding:0;display:flex;gap:6px;color:var(--color-muted)}`,
    `.content{padding:24px}`,
    `.toolbar{display:flex;gap:12px;align-items:center;margin-bottom:16px}`,
    `.toolbar input,.toolbar select{padding:10px 12px;border:2px solid var(--color-border);border-radius:8px}`,
    `.btn{padding:10px 14px;border:none;border-radius:8px;cursor:pointer;font-weight:700}`,
    `.btn-primary{background:var(--gradient-primary);color:#fff}`,
    `.btn-secondary{background:var(--color-surface);color:var(--color-primary);border:2px solid var(--color-primary)}`,
    `.btn-danger{background:var(--color-danger);color:#fff}`,
    `.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;overflow:hidden}`,
    `.grid{width:100%;border-collapse:collapse}`,
    `.grid th{background:var(--color-subtle-bg);color:var(--color-text);text-align:left;padding:10px;border-bottom:1px solid var(--color-border)}`,
    `.grid td{padding:10px;border-bottom:1px solid var(--color-border)}`,
    `.pagination{display:flex;justify-content:center;align-items:center;gap:12px;padding:10px}`,
    `.page{padding:8px 12px;border:2px solid var(--color-border);border-radius:8px;background:var(--color-surface);cursor:pointer}`
  ]
})
export class PlanilhasComponent {
  s = inject(PlanilhasService);
  q = '';
  origem = '';
  pageSize = 10;
  page = 1;
  rows: PlanilhaListItem[] = [];
  pageRows: PlanilhaListItem[] = [];
  totalPages = 1;

  constructor(){
    this.s.list$().subscribe((list: PlanilhaListItem[]) => { this.rows = list; this.applyFilters(); });
  }

  applyFilters(){
    const ql = this.q.toLowerCase();
    const filtered = this.rows.filter(r => (
      (!this.q || r.produto.toLowerCase().includes(ql) || r.cliente.toLowerCase().includes(ql) || r.processo.toLowerCase().includes(ql)) &&
      (!this.origem || r.origem === this.origem)
    ));
    this.totalPages = Math.max(1, Math.ceil(filtered.length / this.pageSize));
    this.page = Math.min(this.page, this.totalPages);
    const start = (this.page - 1) * this.pageSize;
    this.pageRows = filtered.slice(start, start + this.pageSize);
  }

  setPage(p:number){ this.page = p; this.applyFilters(); }
  nova(){ this.s.nova({ produto: 'Nova Simulação' }); }
  abrir(id:string){ this.s.abrir(id); }
  duplicar(id:string){ this.s.duplicar(id); }
  excluir(id:string){ this.s.excluir(id); this.applyFilters(); }
}