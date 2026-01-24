import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Despesa } from '../models/orcamento.models';

@Component({
  standalone: true,
  selector: 'app-resumo-financeiro',
  imports: [CommonModule],
  template: `
    <div class="card summary-finance">
      <h3 class="section-title">Resumo Financeiro</h3>
      <div class="stack">
        <div class="block">
          <div class="label">CIF (USD)</div>
          <div class="value usd">{{ cifUsd | currency:'USD' }}</div>
        </div>
        <div class="block">
          <div class="label">CIF (BRL)</div>
          <div class="value">{{ cifBrl | currency:'BRL' }}</div>
        </div>
        <div class="block">
          <div class="label">Despachante</div>
          <div class="value">{{ totalDespachante | currency:'BRL' }}</div>
        </div>
        <div class="block">
          <div class="label">Despesas Desembaraço (Agência Marítima)</div>
          <div class="value">{{ totalAgencia | currency:'BRL' }}</div>
        </div>
        <div class="block total">
          <div class="label">Custo Total</div>
          <div class="value">{{ custoTotal | currency:'BRL' }}</div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.summary-finance{background:linear-gradient(135deg,#667eea20 0%,#764ba220 100%);border:2px solid var(--color-primary);border-radius:12px;padding:16px}`,
    `.stack{display:flex;flex-direction:column;gap:10px}`,
    `.block{background:rgba(255,255,255,.22);border:1px solid var(--color-border);border-radius:12px;padding:12px 14px;display:flex;align-items:center;justify-content:space-between}`,
    `.block.total{background:linear-gradient(135deg,#667eea40 0%,#764ba240 100%);border-color:var(--color-primary)}`,
    `.label{font-size:12px;color:var(--color-muted);font-weight:700}`,
    `.value{font-size:20px;font-weight:800;color:var(--color-primary)}`,
    `.usd{color:#3b82f6}`
  ]
})
export class ResumoFinanceiroComponent{
  @Input() form: any;
  @Input() despesas: Despesa[] = [];
  @Input() despesasDespachante: Despesa[] = [];
  get cifUsd(){ const f = this.form || {}; return (f.fobUsd||0) + (f.freteUsd||0) + (f.seguroUsd||0); }
  get cifBrl(){ const f = this.form || {}; return this.cifUsd * (f.taxaUsd||0); }
  get totalAgencia(){ return (this.despesas||[]).reduce((s,d)=>s + (d.valor||0), 0); }
  get totalDespachante(){ return (this.despesasDespachante||[]).reduce((s,d)=>s + (d.valor||0), 0); }
  get custoTotal(){ return this.cifBrl + this.totalAgencia + this.totalDespachante; }
}