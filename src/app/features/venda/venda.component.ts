import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendaService } from './venda.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-venda',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="content">
      <div class="card">
        <h2>Planilha de Venda (OMINIUM)</h2>
        <div class="meta">{{meta?.produto}} · {{meta?.cliente}} · {{meta?.processo}}</div>
        <div class="grid-3" style="margin-top:12px">
          <div class="field"><label>Margem (%)</label><input type="number" [(ngModel)]="margem" step="0.1"></div>
          <div class="field"><label>Desconto (%)</label><input type="number" [(ngModel)]="desconto" step="0.1"></div>
          <div class="field"><label>Observação</label><input type="text" [(ngModel)]="observacao"></div>
        </div>
        <div class="actions grid-3" style="margin-top:12px">
          <button class="btn btn-primary" [disabled]="!canEdit" (click)="salvar()">Salvar</button>
          <button class="btn btn-secondary" (click)="recalcular()">Recalcular</button>
        </div>
      </div>

      <div class="card" style="margin-top:16px">
        <h3>Resumo de Preços</h3>
        <table class="grid">
          <thead><tr><th>Base</th><th>Com IPI</th><th>Sem IPI</th></tr></thead>
          <tbody>
            <tr><td>{{base | currency:'BRL'}}</td><td>{{comIPI | currency:'BRL'}}</td><td>{{semIPI | currency:'BRL'}}</td></tr>
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
    `.field input{padding:10px 12px;border:2px solid var(--color-border);border-radius:8px;background:var(--color-surface)}`
  ]
})
export class VendaComponent {
  private s = inject(VendaService);
  private auth = inject(AuthService);
  meta = this.s.meta();
  margem = 10; desconto = 0; observacao = '';
  base = 0; comIPI = 0; semIPI = 0;
  get canEdit(){ const r = this.auth.currentUser?.role; return r === 'admin' || r === 'cliente'; }
  constructor(){ this.recalcular(); }
  recalcular(){ const calc = this.s.calcularPrecoBase(); this.base = calc.comIPI; this.comIPI = calc.comIPI * (1 + this.margem/100) * (1 - this.desconto/100); this.semIPI = calc.semIPI; }
  salvar(){ this.s.salvar(this.margem, this.desconto, this.observacao); alert('Planilha de venda salva.'); }
}