import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { OrcamentoService } from '../services/orcamento.service';
import { OrcamentoListItem } from '../models/orcamento.models';

@Component({
  standalone: true,
  selector: 'app-novo-processo-nova',
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="card">
      <h2>Orçamentos</h2>
      <p>Lista e gerenciamento de orçamentos</p>
      <div class="actions">
        <button class="btn btn-primary" (click)="abrirModalCriar()">Criar novo orçamento</button>
      </div>
      <table class="table">
        <thead>
          <tr><th>Data</th><th>Cliente</th><th>Despachante</th><th>Código</th><th>Status</th><th style="width:140px">Ações</th></tr>
        </thead>
        <tbody>
          <tr *ngIf="(list|async)?.length === 0"><td colspan="6">Nenhum orçamento</td></tr>
          <tr *ngFor="let p of (list|async)">
            <td>{{p.data | date:'short'}}</td>
            <td>{{p.cliente || '-'}}</td>
            <td>{{p.despachante || '-'}}</td>
            <td>{{p.codigo || '-'}}</td>
            <td>{{p.status}}</td>
            <td>
              <div class="row-actions">
                <button class="btn-icon" title="Abrir para edição" (click)="abrir(p)">✏️</button>
                <button class="btn-icon danger" title="Excluir orçamento" (click)="confirmExcluir(p)">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="modal-backdrop" *ngIf="confirmId">
        <div class="modal">
          <div class="modal-header">⚠️ Confirmar exclusão</div>
          <div class="modal-body">Tem certeza que deseja excluir este orçamento?</div>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="cancelarExclusao()">Cancelar</button>
            <button class="btn btn-primary" (click)="removerConfirmado()">Excluir</button>
          </div>
        </div>
      </div>

      <div class="modal-backdrop" *ngIf="showModalCriar">
        <div class="modal modal-lg">
          <div class="modal-header-flex">
            <h3>Novo Orçamento</h3>
            <button class="btn-close" (click)="fecharModalCriar()">✕</button>
          </div>
          <div class="modal-body">
            <p style="color: var(--color-muted); margin-bottom: 16px;">Preencha os dados iniciais do orçamento</p>
            <div class="form-grid">
              <div class="field">
                <label>Cliente *</label>
                <input type="text" [(ngModel)]="formCriar.cliente" placeholder="Nome do cliente">
              </div>
              <div class="field">
                <label>Despachante *</label>
                <input type="text" [(ngModel)]="formCriar.despachante" placeholder="Nome do despachante">
              </div>
              <div class="field">
                <label>Código do Orçamento</label>
                <input type="text" [(ngModel)]="formCriar.codigo" placeholder="Ex: ORC-2025-001">
              </div>
              <div class="field">
                <label>Data</label>
                <input type="date" [(ngModel)]="formCriar.data">
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="fecharModalCriar()">Cancelar</button>
            <button class="btn btn-primary" (click)="criarNovoOrcamento()" [disabled]="!formCriar.cliente || !formCriar.despachante">Criar Orçamento</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:24px}`,
    `.actions{display:flex;justify-content:flex-end;margin:12px 0}`,
    `.btn{padding:10px 12px;border-radius:10px;cursor:pointer;font-size:14px}`,
    `.btn-primary{background:var(--gradient-primary);color:#fff;border:none}`,
    `.btn-primary:disabled{opacity:.6;cursor:not-allowed}`,
    `.btn-secondary{background:var(--color-bg);border:2px solid var(--color-border);color:var(--color-text)}`,
    `.btn-secondary:hover{background:var(--color-border)}`,
    `.btn-icon{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:2px solid var(--color-border);border-radius:8px;background:var(--color-surface);cursor:pointer}`,
    `.btn-icon.danger{border-color:var(--color-danger);color:var(--color-danger)}`,
    `.table{width:100%;border-collapse:collapse;margin-top:12px}`,
    `.table th,.table td{border-bottom:1px solid var(--color-border);padding:10px;text-align:left}`,
    `.row-actions{display:flex;gap:8px}`,
    `.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;z-index:1000}`,
    `.modal{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;overflow:hidden;box-shadow:0 10px 20px rgba(0,0,0,.2)}`,
    `.modal-lg{width:520px}`,
    `.modal-header{background:var(--color-header-bg);color:#fff;padding:12px 16px;font-weight:800}`,
    `.modal-header-flex{background:var(--color-header-bg);color:#fff;padding:12px 16px;font-weight:800;display:flex;justify-content:space-between;align-items:center}`,
    `.modal-header-flex h3{margin:0;font-size:18px}`,
    `.btn-close{background:none;border:none;color:#fff;font-size:24px;cursor:pointer;padding:0;width:24px;height:24px}`,
    `.modal-body{padding:16px}`,
    `.modal-actions{display:flex;justify-content:flex-end;gap:8px;padding:12px 16px;border-top:1px solid var(--color-border)}`,
    `.form-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}`,
    `.field{display:flex;flex-direction:column;gap:6px}`,
    `.field label{font-size:13px;font-weight:600;color:var(--color-text)}`,
    `.field input{padding:10px 12px;border:2px solid var(--color-border);border-radius:8px;font-size:14px;transition:.2s}`,
    `.field input:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 3px rgba(102,126,234,.1)}`
  ]
})
export class NovoProcessoNovaComponent {
  list!: import('rxjs').Observable<OrcamentoListItem[]>;
  confirmId: string | null = null;
  showModalCriar = false;
  formCriar = { cliente: '', despachante: '', codigo: '', data: new Date().toISOString().split('T')[0] };

  constructor(private s: OrcamentoService, private router: Router) {
    this.list = this.s.list$();
  }

  abrirModalCriar() {
    this.formCriar = { cliente: '', despachante: '', codigo: '', data: new Date().toISOString().split('T')[0] };
    this.showModalCriar = true;
  }

  fecharModalCriar() {
    this.showModalCriar = false;
  }

  criarNovoOrcamento() {
    if (!this.formCriar.cliente || !this.formCriar.despachante) return;
    try { const ls = (globalThis as any).localStorage as Storage | undefined; ls?.removeItem('current_orcamento_id'); } catch { }
    const id = this.s.criar(this.formCriar.cliente, this.formCriar.despachante, this.formCriar.codigo, this.formCriar.data);
    this.s.ensureCustoForOrcamento(id);
    this.fecharModalCriar();
    this.router.navigateByUrl('/custo');
  }

  abrir(p: OrcamentoListItem) {
    this.s.abrir(p.id);
    this.s.ensureCustoForOrcamento(p.id);
    this.router.navigateByUrl('/custo');
  }

  confirmExcluir(p: OrcamentoListItem) { this.confirmId = p.id; }

  removerConfirmado() {
    if (this.confirmId) {
      try { const ls = (globalThis as any).localStorage as Storage | undefined; const cur = ls?.getItem('nova_current_orcamento_id'); if (cur === this.confirmId) { ls?.removeItem('nova_current_orcamento_id'); } } catch { }
      this.s.remover(this.confirmId);
      this.confirmId = null;
    }
  }

  cancelarExclusao() { this.confirmId = null; }
}