import { Component, inject, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AliquotasService } from '../services/aliquotas.service';
import { AliquotaPerfil } from '../models/aliquota.models';
import { PageHeaderComponent } from '../../../core/layout/page-header.component';

@Pipe({name:'aliquotaFilter', standalone: true})
export class AliquotaFilterPipe implements PipeTransform {
  transform(list: AliquotaPerfil[] | null, q: string){
    if(!list) return [];
    if(!q) return list;
    const s = q.toLowerCase();
    return list.filter(a => (a.nome||'').toLowerCase().includes(s));
  }
}

@Component({
  selector: 'app-aliquotas',
  standalone: true,
  imports: [CommonModule, FormsModule, PageHeaderComponent, AliquotaFilterPipe],
  template: `
    <div class="container-standard">
      <app-page-header 
        icon="🧮" 
        title="Perfis de Alíquotas" 
        subtitle="Cadastre e reutilize perfis de impostos">
        <button class="btn btn-primary" (click)="abrirCadastro()">+ Novo cadastro</button>
      </app-page-header>
      <div class="modal-backdrop" *ngIf="showForm">
        <div class="modal">
          <div class="modal-header">
            <div class="modal-title">Novo perfil de alíquotas</div>
            <button class="btn btn-secondary" (click)="cancelarCadastro()">Fechar</button>
          </div>
          <div class="modal-body">
            <div class="grid">
              <div class="field"><label>Nome</label><input type="text" [(ngModel)]="nome" placeholder="Ex: Padrão Nacional"></div>
              <div class="field"><label>Descrição</label><input type="text" [(ngModel)]="descricao" placeholder="Descrição do perfil"></div>
              <div class="field"><label>II (%)</label><input type="number" step="0.01" [(ngModel)]="ii"></div>
              <div class="field"><label>IPI (%)</label><input type="number" step="0.01" [(ngModel)]="ipi"></div>
              <div class="field"><label>ICMS (%)</label><input type="number" step="0.01" [(ngModel)]="icms"></div>
              <div class="field"><label>PIS (%)</label><input type="number" step="0.01" [(ngModel)]="pis"></div>
              <div class="field"><label>COFINS (%)</label><input type="number" step="0.01" [(ngModel)]="cofins"></div>
              <div class="field"><label>Padrão</label><input type="checkbox" [(ngModel)]="padrao"></div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="cancelarCadastro()">Cancelar</button>
            <button class="btn btn-primary" (click)="salvar()">Salvar</button>
          </div>
        </div>
      </div>

      <div class="content-section">
        <div class="toolbar">
          <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar por nome" />
        </div>
        <table class="data-table">
          <thead><tr><th>Nome</th><th>II</th><th>IPI</th><th>ICMS</th><th>PIS</th><th>COFINS</th><th>Padrão</th><th>Ações</th></tr></thead>
          <tbody>
            <tr *ngFor="let a of (list$ | async) | aliquotaFilter:q">
              <td>{{ a.nome }}</td>
              <td>{{ a.ii }}</td>
              <td>{{ a.ipi }}</td>
              <td>{{ a.icms }}</td>
              <td>{{ a.pis }}</td>
              <td>{{ a.cofins }}</td>
              <td>{{ a.padrao ? 'Sim' : 'Não' }}</td>
              <td>
                <div class="row-actions">
                  <button class="btn-icon danger" title="Excluir perfil" (click)="remove(a.id)">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px 25px}`,
    `.field{display:flex;flex-direction:column}`,
    `.field label{font-size:13px;color:var(--color-muted);font-weight:600;margin-bottom:8px}`,
    `.field input,.field select{padding:13px 16px;border:2px solid var(--color-border);border-radius:8px;font-size:15px;transition:.2s;background:var(--color-surface)}`,
    `.field input:focus,.field select:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 4px rgba(102,126,234,.1)}`,
    `.actions{display:flex;gap:12px;margin-top:16px}`,
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
    `.modal{width:min(900px,92vw);background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;box-shadow:0 20px 40px rgba(0,0,0,.2);overflow:hidden}`,
    `.modal-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--color-border)}`,
    `.modal-title{font-size:16px;font-weight:700}`,
    `.modal-body{padding:20px}`,
    `.modal-actions{display:flex;justify-content:flex-end;gap:12px;padding:16px 20px;border-top:1px solid var(--color-border)}`
  ]
})
export class AliquotasComponent {
  private service = inject(AliquotasService);
  list$ = this.service.list$();
  showForm = false;
  nome = 'Padrão Nacional';
  descricao = '';
  ii = 14.4; ipi = 7.43; icms = 4; pis = 2.1; cofins = 10.65;
  padrao = false;
  q = '';
  abrirCadastro(){ this.limpar(); this.showForm = true; }
  cancelarCadastro(){ this.showForm = false; this.limpar(); }
  salvar(){ if(!this.nome) return; this.service.create({ nome: this.nome, descricao: this.descricao, ii: this.ii, ipi: this.ipi, icms: this.icms, pis: this.pis, cofins: this.cofins, padrao: this.padrao }); this.limpar(); this.showForm = false; }
  limpar(){ this.nome=''; this.descricao=''; this.ii=0; this.ipi=0; this.icms=0; this.pis=0; this.cofins=0; this.padrao=false; }
  update(a:any){ this.service.update(a.id, { nome: a.nome, descricao: a.descricao, ii: a.ii, ipi: a.ipi, icms: a.icms, pis: a.pis, cofins: a.cofins, padrao: a.padrao }); }
  remove(id:string){ this.service.remove(id); }
  setPadrao(a:any){ this.service.setPadrao(a.id); }
}