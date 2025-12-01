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
    <div class="content">
      <div class="filters card">
        <div class="filters-grid">
          <div class="field">
            <label>Buscar</label>
            <input type="text" [(ngModel)]="q" (ngModelChange)="applyFilters()" placeholder="Produto, cliente ou processo" />
          </div>
          <div class="field">
            <label>Origem</label>
            <select [(ngModel)]="origem" (ngModelChange)="applyFilters()">
              <option value="">Todas</option>
              <option>China</option>
              <option>EUA</option>
              <option>Europa</option>
              <option>Ásia</option>
            </select>
          </div>
          <div class="field">
            <label>Status</label>
            <select [(ngModel)]="status" (ngModelChange)="applyFilters()">
              <option value="">Todos</option>
              <option>Ativo</option>
              <option>Finalizado</option>
              <option>Rascunho</option>
            </select>
          </div>
          <div class="field">
            <label>Data início</label>
            <input type="date" [(ngModel)]="dataInicio" (ngModelChange)="applyFilters()" />
          </div>
          <div class="field">
            <label>Data fim</label>
            <input type="date" [(ngModel)]="dataFim" (ngModelChange)="applyFilters()" />
          </div>
          <div class="field actions-inline">
            <button class="btn btn-secondary" (click)="limparFiltros()">Limpar</button>
            <button class="btn btn-primary" (click)="nova()"><span class="icon">＋</span> Nova Planilha</button>
          </div>
        </div>
      </div>
      <div class="card">
        <table class="grid">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Cliente</th>
              <th>Processo</th>
              <th>Origem</th>
              <th>Status</th>
              <th>Data</th>
              <th style="text-align:right">Tributos</th>
              <th style="text-align:right">Desembolso Total</th>
              <th style="width:320px">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let row of pageRows">
              <td>{{row.produto}}</td>
              <td>{{row.cliente}}</td>
              <td>{{row.processo}}</td>
              <td>{{row.origem}}</td>
              <td>{{row.status}}</td>
              <td>{{row.dataSimulacao | date:'shortDate'}}</td>
              <td style="text-align:right">{{row.tributos | currency:'BRL'}}</td>
              <td style="text-align:right">{{row.desembolsoTotal | currency:'BRL'}}</td>
              <td>
                <div class="row-actions">
                  <button class="btn btn-secondary" (click)="abrir(row.id)">Abrir</button>
                  <button class="btn btn-secondary" (click)="duplicar(row.id)">Duplicar</button>
                  <button class="btn btn-danger" (click)="excluir(row.id)">Excluir</button>
                </div>
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
    `.content{padding:24px}`,
    `.filters{margin-bottom:16px}`,
    `.filters-grid{display:grid;grid-template-columns:1.2fr 0.8fr 0.8fr 0.7fr 0.7fr 1fr;gap:12px;align-items:end;padding:14px}`,
    `.field label{font-size:12px;color:var(--color-muted);margin-bottom:6px;display:block}`,
    `.field input,.field select{padding:10px 12px;border:2px solid var(--color-border);border-radius:8px;background:var(--color-surface)}`,
    `.actions-inline{display:flex;gap:10px;justify-content:flex-end}`,
    `.btn{padding:10px 14px;border:none;border-radius:8px;cursor:pointer;font-weight:700}`,
    `.btn-primary{background:var(--gradient-primary);color:#fff}`,
    `.btn-secondary{background:var(--color-surface);color:var(--color-primary);border:2px solid var(--color-primary)}`,
    `.btn-danger{background:var(--color-danger);color:#fff}`,
    `.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;overflow:hidden}`,
    `.grid{width:100%;border-collapse:collapse}`,
    `.grid th{background:var(--color-subtle-bg);color:var(--color-text);text-align:left;padding:10px;border-bottom:1px solid var(--color-border)}`,
    `.grid td{padding:10px;border-bottom:1px solid var(--color-border)}`,
    `.row-actions{display:flex;gap:10px}`,
    `.pagination{display:flex;justify-content:center;align-items:center;gap:12px;padding:10px}`,
    `.page{padding:8px 12px;border:2px solid var(--color-border);border-radius:8px;background:var(--color-surface);cursor:pointer}`
  ]
})
export class PlanilhasComponent {
  s = inject(PlanilhasService);
  q = '';
  origem = '';
  status = '';
  dataInicio = '';
  dataFim = '';
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
    const filtered = this.rows.filter(r => {
      const byText = (!this.q || r.produto.toLowerCase().includes(ql) || r.cliente.toLowerCase().includes(ql) || r.processo.toLowerCase().includes(ql));
      const byOrigem = (!this.origem || r.origem === this.origem);
      const byStatus = (!this.status || r.status === this.status);
      const ts = new Date(r.dataSimulacao).getTime();
      const startOk = (!this.dataInicio || ts >= new Date(this.dataInicio).getTime());
      const endOk = (!this.dataFim || ts <= new Date(this.dataFim).getTime());
      return byText && byOrigem && byStatus && startOk && endOk;
    });
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
  limparFiltros(){ this.q=''; this.origem=''; this.status=''; this.dataInicio=''; this.dataFim=''; this.applyFilters(); }
}