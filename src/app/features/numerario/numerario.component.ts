import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NumerarioService } from './numerario.service';

@Component({
  selector: 'app-numerario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="content">
      <div class="card">
        <h2>Numerário</h2>
        <div class="meta">{{meta?.produto}} · {{meta?.cliente}} · {{meta?.processo}}</div>
        <div class="grid-3" style="margin-top:12px">
          <div class="field"><label>Valor</label><input type="number" [(ngModel)]="valor" step="0.01"></div>
          <div class="field"><label>Moeda</label><select [(ngModel)]="moeda"><option>BRL</option><option>USD</option><option>EUR</option></select></div>
          <div class="field"><label>Responsável</label><input type="text" [(ngModel)]="responsavel"></div>
          <div class="field" style="grid-column:1/-1"><label>Observação</label><input type="text" [(ngModel)]="observacao"></div>
        </div>
        <div class="actions grid-3" style="margin-top:12px">
          <button class="btn btn-primary" (click)="criar()">Solicitar</button>
          <button class="btn btn-secondary" (click)="limpar()">Limpar</button>
        </div>
      </div>

      <div class="card" style="margin-top:16px">
        <h3>Solicitações</h3>
        <table class="grid">
          <thead><tr><th>Data</th><th>Valor</th><th>Status</th><th>Responsável</th><th style="width:280px">Ações</th></tr></thead>
          <tbody>
            <tr *ngFor="let r of (list$ | async)">
              <td>{{r.data | date:'short'}}</td>
              <td>{{r.valor | currency:r.moeda}}</td>
              <td><span class="badge">{{r.status}}</span></td>
              <td>{{r.responsavel}}</td>
              <td>
                <div class="row-actions">
                  <button class="btn btn-secondary" (click)="setStatus(r.id,'Enviado')">Enviar</button>
                  <button class="btn btn-secondary" (click)="setStatus(r.id,'Pago')">Marcar como Pago</button>
                  <button class="btn btn-secondary" (click)="setStatus(r.id,'Recebido')">Marcar como Recebido</button>
                  <button class="btn btn-danger" (click)="remover(r.id)">Excluir</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `.content{padding:24px}`,
    `.grid{width:100%;border-collapse:collapse}`,
    `.grid th{background:var(--color-subtle-bg);color:var(--color-text);text-align:left;padding:10px;border-bottom:1px solid var(--color-border)}`,
    `.grid td{padding:10px;border-bottom:1px solid var(--color-border)}`,
    `.field label{font-size:12px;color:var(--color-muted);margin-bottom:6px;display:block}`,
    `.field input,.field select{padding:10px 12px;border:2px solid var(--color-border);border-radius:8px;background:var(--color-surface)}`,
    `.row-actions{display:flex;gap:10px}`,
    `.btn-danger{background:var(--color-danger);color:#fff}`
  ]
})
export class NumerarioComponent {
  private s = inject(NumerarioService);
  list$ = this.s.list$();
  meta = this.s.meta();
  valor = 0;
  moeda: 'BRL'|'USD'|'EUR' = 'BRL';
  responsavel = '';
  observacao = '';
  criar(){ if(this.valor>0 && this.responsavel){ this.s.novo(this.valor, this.moeda, this.responsavel, this.observacao); this.limpar(); } }
  limpar(){ const m = this.moeda; this.valor=0; this.responsavel=''; this.observacao=''; this.moeda = m; }
  setStatus(id:string, st:'Enviado'|'Pago'|'Recebido'){ this.s.atualizar(id, st); }
  remover(id:string){ this.s.remover(id); }
}