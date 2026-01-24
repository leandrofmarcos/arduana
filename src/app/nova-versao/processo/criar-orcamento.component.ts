import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OrcamentoService } from '../services/orcamento.service';

@Component({
  standalone: true,
  selector: 'app-criar-orcamento',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <div class="header-card">
        <h1 class="header-title">Novo Orçamento</h1>
        <p class="header-subtitle">Preencha os dados iniciais do orçamento</p>
      </div>

      <div class="form-container">
        <div class="form-grid">
          <div class="field">
            <label>Cliente *</label>
            <input type="text" [(ngModel)]="form.cliente" placeholder="Nome do cliente">
          </div>
          <div class="field">
            <label>Despachante *</label>
            <input type="text" [(ngModel)]="form.despachante" placeholder="Nome do despachante">
          </div>
          <div class="field">
            <label>Código do Orçamento</label>
            <input type="text" [(ngModel)]="form.codigo" placeholder="Ex: ORC-2025-001">
          </div>
          <div class="field">
            <label>Data</label>
            <input type="date" [(ngModel)]="form.data">
          </div>
        </div>

        <div class="actions">
          <button class="btn btn-secondary" (click)="cancelar()">Cancelar</button>
          <button class="btn btn-primary" (click)="criar()" [disabled]="!form.cliente || !form.despachante">Criar Orçamento</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:24px;max-width:600px;margin:0 auto}`,
    `.header-card{background:var(--gradient-primary);color:#fff;padding:24px;border-radius:12px;margin-bottom:24px}`,
    `.header-title{font-size:24px;font-weight:800;margin:0 0 8px 0}`,
    `.header-subtitle{font-size:14px;opacity:.9;margin:0}`,
    `.form-container{display:flex;flex-direction:column;gap:20px}`,
    `.form-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}`,
    `.field{display:flex;flex-direction:column;gap:8px}`,
    `.field label{font-size:13px;font-weight:600;color:var(--color-text)}`,
    `.field input{padding:13px 16px;border:2px solid var(--color-border);border-radius:8px;font-size:15px;transition:.2s}`,
    `.field input:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 4px rgba(102,126,234,.1)}`,
    `.actions{display:flex;gap:8px;justify-content:flex-end}`,
    `.btn{padding:10px 16px;border-radius:8px;border:none;font-weight:600;cursor:pointer;transition:.2s}`,
    `.btn-primary{background:var(--gradient-primary);color:#fff}`,
    `.btn-primary:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 4px 12px rgba(102,126,234,.4)}`,
    `.btn-primary:disabled{opacity:.6;cursor:not-allowed}`,
    `.btn-secondary{background:var(--color-bg);border:2px solid var(--color-border);color:var(--color-text)}`,
    `.btn-secondary:hover{background:var(--color-border)}`
  ]
})
export class CriarOrcamentoComponent {
  form = { cliente: '', despachante: '', codigo: '', data: new Date().toISOString().split('T')[0] };

  constructor(private s: OrcamentoService, private router: Router){}

  criar(){
    if(!this.form.cliente || !this.form.despachante) return;
    const id = this.s.criar(this.form.cliente, this.form.despachante, this.form.codigo, this.form.data);
    this.s.ensureCustoForOrcamento(id);
    this.router.navigateByUrl('/nova/processo/custo');
  }

  cancelar(){
    this.router.navigateByUrl('/nova/processo/novo');
  }
}
