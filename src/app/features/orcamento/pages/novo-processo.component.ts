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
      <h2>Processos</h2>
      <p>Lista e gerenciamento de processos</p>
      <div class="actions">
        <button class="btn btn-primary" (click)="criarNovo()">Criar novo orçamento</button>
      </div>
      <table class="table">
        <thead>
          <tr><th>Data</th><th>Cliente</th><th>Despachante</th><th>Código</th><th>Status</th><th style="width:140px">Ações</th></tr>
        </thead>
        <tbody>
          <tr *ngIf="(list|async)?.length === 0"><td colspan="6">Nenhum processo</td></tr>
          <tr *ngFor="let p of (list|async)">
            <td>{{p.data | date:'short'}}</td>
            <td>{{p.cliente || '-'}}</td>
            <td>{{p.despachante || '-'}}</td>
            <td>{{p.codigo || '-'}}</td>
            <td>{{p.status}}</td>
            <td>
              <div class="row-actions">
                <button class="btn-icon" title="Abrir para edição" (click)="abrir(p)">✏️</button>
                <button class="btn-icon danger" title="Excluir processo" (click)="confirmExcluir(p)">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="modal-backdrop" *ngIf="confirmId">
        <div class="modal">
          <div class="modal-header">⚠️ Confirmar exclusão</div>
          <div class="modal-body">Tem certeza que deseja excluir este processo?</div>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="cancelarExclusao()">Cancelar</button>
            <button class="btn btn-primary" (click)="removerConfirmado()">Excluir</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:24px}`,
    `.actions{display:flex;justify-content:flex-end;margin:12px 0}`,
    `.btn{padding:10px 12px;border-radius:10px}`,
    `.btn-primary{background:var(--gradient-primary);color:#fff;border:none}`,
    `.btn-icon{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:2px solid var(--color-border);border-radius:8px;background:var(--color-surface);cursor:pointer}`,
    `.btn-icon.danger{border-color:var(--color-danger);color:var(--color-danger)}`,
    `.table{width:100%;border-collapse:collapse;margin-top:12px}`,
    `.table th,.table td{border-bottom:1px solid var(--color-border);padding:10px;text-align:left}`,
    `.row-actions{display:flex;gap:8px}`,
    `.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center}`,
    `.modal{width:360px;background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;overflow:hidden;box-shadow:0 10px 20px rgba(0,0,0,.2)}`,
    `.modal-header{background:var(--color-header-bg);color:#fff;padding:12px 16px;font-weight:800}`,
    `.modal-body{padding:16px}`,
    `.modal-actions{display:flex;justify-content:flex-end;padding:12px 16px;border-top:1px solid var(--color-border)}`
  ]
})
export class NovoProcessoNovaComponent {
  list!: import('rxjs').Observable<OrcamentoListItem[]>;
  confirmId: string | null = null;
  constructor(private s: OrcamentoService, private router: Router){
    this.list = this.s.list$();
  }
  criarNovo(){
    try{ const ls = (globalThis as any).localStorage as Storage | undefined; ls?.removeItem('current_orcamento_id'); }catch{}
    const id = this.s.criar();
    this.s.ensureCustoForOrcamento(id);
    this.router.navigateByUrl('/orcamento/custo');
  }
  abrir(p: OrcamentoListItem){
    this.s.abrir(p.id);
    this.s.ensureCustoForOrcamento(p.id);
    this.router.navigateByUrl('/orcamento/custo');
  }
  confirmExcluir(p: OrcamentoListItem){ this.confirmId = p.id; }
  removerConfirmado(){ if(this.confirmId){ try{ const ls = (globalThis as any).localStorage as Storage | undefined; const cur = ls?.getItem('nova_current_orcamento_id'); if(cur === this.confirmId){ ls?.removeItem('nova_current_orcamento_id'); } }catch{} this.s.remover(this.confirmId); this.confirmId = null; } }
  cancelarExclusao(){ this.confirmId = null; }
}