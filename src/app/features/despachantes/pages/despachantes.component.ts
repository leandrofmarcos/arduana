import { Component, inject, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DespachantesService } from '../services/despachantes.service';
import { Despachante } from '../models/despachante.models';
import { PageHeaderComponent } from '../../../core/layout/page-header.component';

@Pipe({name:'despFilter', standalone: true})
export class DespFilterPipe implements PipeTransform {
  transform(list: Despachante[] | null, q: string){
    if(!list) return [];
    if(!q) return list;
    const s = q.toLowerCase();
    return list.filter(c => (c.nome||'').toLowerCase().includes(s) || (c.documento||'').toLowerCase().includes(s));
  }
}

@Component({
  selector: 'app-despachantes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DespFilterPipe, PageHeaderComponent],
  template: `
    <div class="container-standard">
      <app-page-header
        icon="🧭"
        title="Cadastro de Despachantes"
        subtitle="Gerencie despachantes para uso nos processos">
        <button class="btn btn-primary" (click)="abrirModalCadastro()">+ Novo Despachante</button>
      </app-page-header>

      <div class="modal-backdrop" *ngIf="showModalCadastro">
        <div class="modal">
          <div class="modal-header">
            <div class="modal-title">Novo Despachante</div>
            <button class="btn btn-secondary" (click)="fecharModalCadastro()">Fechar</button>
          </div>
          <div class="modal-body">
            <div class="grid">
              <div class="field"><label>Nome</label><input type="text" [(ngModel)]="nome" placeholder="Despachante XPTO"></div>
              <div class="field"><label>Documento</label><input type="text" [(ngModel)]="documento" placeholder="00.000.000/0001-00"></div>
              <div class="field"><label>Contato</label><input type="text" [(ngModel)]="contato" placeholder="(11) 90000-0000"></div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="fecharModalCadastro()">Cancelar</button>
            <button class="btn btn-primary" (click)="salvar()">Salvar</button>
          </div>
        </div>
      </div>

      <div class="content-section">
        <div class="toolbar">
          <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar por nome ou documento" />
        </div>
        <table class="data-table">
          <thead><tr><th>Nome</th><th>Documento</th><th>Contato</th><th style="width:80px">Ações</th></tr></thead>
          <tbody>
            <tr *ngFor="let c of (list$ | async) | despFilter:q">
              <td>{{ c.nome }}</td>
              <td>{{ c.documento }}</td>
              <td>{{ c.contato || '—' }}</td>
              <td>
                <div class="row-actions">
                  <button class="btn-icon danger" title="Excluir despachante" (click)="remove(c.id)">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px 25px}`,
    `.field{display:flex;flex-direction:column}`,
    `.field label{font-size:13px;color:var(--color-muted);font-weight:600;margin-bottom:8px}`,
    `.field input{padding:13px 16px;border:2px solid var(--color-border);border-radius:8px;font-size:15px;transition:.2s;background:var(--color-surface);width:100%}`,
    `.field input:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 4px rgba(102,126,234,.1)}`,
    `.btn{padding:12px 16px;border-radius:8px;border:none;cursor:pointer;font-weight:700}`,
    `.btn-primary{background:var(--gradient-primary);color:#fff}`,
    `.btn-secondary{background:var(--color-surface);color:var(--color-primary);border:2px solid var(--color-primary)}`,
    `.toolbar{display:flex;gap:12px;align-items:center;margin-bottom:16px;flex-wrap:wrap}`,
    `.search{flex:1;min-width:200px;padding:13px 16px;border:2px solid var(--color-border);border-radius:8px;font-size:15px}`,
    `.data-table th:last-child,.data-table td:last-child{text-align:right;width:120px}`,
    `.row-actions{display:flex;justify-content:flex-end;gap:0;align-items:center}`,
    `.row-actions .btn-icon{padding:6px 8px}`,
    `.btn-icon.danger{color:var(--color-danger)}`,
    `.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:1000}`,
    `.modal{width:min(700px,92vw);background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;box-shadow:0 20px 40px rgba(0,0,0,.2);overflow:hidden}`,
    `.modal-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--color-border)}`,
    `.modal-title{font-size:16px;font-weight:700}`,
    `.modal-body{padding:20px}`,
    `.modal-actions{display:flex;justify-content:flex-end;gap:12px;padding:16px 20px;border-top:1px solid var(--color-border)}`
  ]
})
export class DespachantesComponent {
  private service = inject(DespachantesService);
  list$ = this.service.list$();
  nome = '';
  documento = '';
  contato = '';
  q = '';
  showModalCadastro = false;
  abrirModalCadastro(){ this.limpar(); this.showModalCadastro = true; }
  fecharModalCadastro(){ this.showModalCadastro = false; this.limpar(); }
  salvar(){ if(!this.nome || !this.documento) return; this.service.create(this.nome, this.documento, this.contato); this.limpar(); this.showModalCadastro = false; }
  limpar(){ this.nome=''; this.documento=''; this.contato=''; }
  remove(id: string){ this.service.remove(id); }
}