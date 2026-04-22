import { Component, inject, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AliquotaPerfil } from '../models/aliquota.models';
import { AliquotasService } from '../services/aliquotas.service';
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
  imports: [CommonModule, FormsModule, AliquotaFilterPipe, PageHeaderComponent],
  template: `
    <div class="container-standard">
      <app-page-header 
        icon="💰" 
        title="Perfis de Alíquotas" 
        subtitle="Gerencie os perfis de taxas de importação">
        <button class="btn btn-primary" (click)="abrirModalCadastro()">+ Nova Alíquota</button>
      </app-page-header>

      <div class="modal-backdrop" *ngIf="showModalCadastro">
        <div class="modal">
          <div class="modal-header">
            <div class="modal-title">{{ modoEdicao ? 'Editar Alíquota' : 'Nova Alíquota' }}</div>
            <button class="btn btn-secondary" (click)="fecharModalCadastro()">Fechar</button>
          </div>
          <div class="modal-body">
            <div class="grid">
              <div class="field"><label>Nome *</label><input type="text" [(ngModel)]="nome" placeholder="Alíquota Padrão"></div>
              <div class="field"><label>II (%) *</label><input type="number" [(ngModel)]="ii" placeholder="0.00" step="0.01"></div>
              <div class="field"><label>IPI (%)</label><input type="number" [(ngModel)]="ipi" placeholder="0.00" step="0.01"></div>
              <div class="field"><label>ICMS (%)</label><input type="number" [(ngModel)]="icms" placeholder="0.00" step="0.01"></div>
              <div class="field"><label>PIS (%)</label><input type="number" [(ngModel)]="pis" placeholder="0.00" step="0.01"></div>
              <div class="field"><label>COFINS (%)</label><input type="number" [(ngModel)]="cofins" placeholder="0.00" step="0.01"></div>
            </div>
            <div class="field" style="margin-top:16px">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="padrao" />
                <span>Definir como padrão</span>
              </label>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="fecharModalCadastro()">Cancelar</button>
            <button class="btn btn-primary" (click)="salvar()">{{ modoEdicao ? 'Salvar' : 'Criar' }}</button>
          </div>
        </div>
      </div>

      <div class="content-section">
        <div class="toolbar">
          <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar por nome" />
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>II (%)</th>
              <th>IPI (%)</th>
              <th>ICMS (%)</th>
              <th>PIS (%)</th>
              <th>COFINS (%)</th>
              <th>Padrão</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let a of (aliquotas$ | async) | aliquotaFilter:q" [class.row-padrao]="a.padrao">
              <td>{{ a.nome }}</td>
              <td>{{ a.ii }}</td>
              <td>{{ a.ipi }}</td>
              <td>{{ a.icms }}</td>
              <td>{{ a.pis }}</td>
              <td>{{ a.cofins }}</td>
              <td>{{ a.padrao ? '✓' : '' }}</td>
              <td>
                <div class="row-actions">
                  <button class="btn-icon" title="Editar" (click)="editar(a)">✏️</button>
                  <button class="btn-icon danger" title="Excluir" (click)="remove(a.id)">🗑️</button>
                  <button class="btn-icon" [class.active]="a.padrao" title="Definir como padrão" (click)="setPadrao(a.id)">⭐</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px 25px}
    .field{display:flex;flex-direction:column}
    .field label{font-size:13px;color:var(--color-muted);font-weight:600;margin-bottom:8px}
    .field input,.field select{padding:13px 16px;border:2px solid var(--color-border);border-radius:8px;font-size:15px;transition:.2s;background:var(--color-surface)}
    .field input:focus,.field select:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 4px rgba(102,126,234,.1)}
    .checkbox-label{display:flex;align-items:center;gap:8px;cursor:pointer;padding:8px 0}
    .checkbox-label input[type="checkbox"]{width:18px;height:18px;cursor:pointer}
    .actions{display:flex;gap:12px;margin-top:16px}
    .btn{padding:12px 16px;border-radius:8px;border:none;cursor:pointer;font-weight:700}
    .btn-primary{background:var(--gradient-primary);color:#fff}
    .btn-secondary{background:var(--color-surface);color:var(--color-primary);border:2px solid var(--color-primary)}
    .toolbar{display:flex;gap:12px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
    .search{flex:1;min-width:200px;padding:13px 16px;border:2px solid var(--color-border);border-radius:8px;font-size:15px}
    .data-table th:last-child,.data-table td:last-child{text-align:right;width:160px}
    .row-actions{display:flex;justify-content:flex-end;gap:0;align-items:center}
    .row-actions .btn-icon{padding:6px 8px}
    .btn-icon{background:none;border:none;cursor:pointer;font-size:16px;padding:6px 8px;border-radius:4px;transition:.2s}
    .btn-icon:hover{background:var(--color-hover)}
    .btn-icon.danger{color:var(--color-danger)}
    .btn-icon.active{color:gold}
    .row-padrao{background:rgba(255,215,0,.1)}
    .modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:1000}
    .modal{width:min(900px,95vw);max-height:90vh;overflow-y:auto;background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;box-shadow:0 20px 40px rgba(0,0,0,.2)}
    .modal-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--color-border)}
    .modal-title{font-size:16px;font-weight:700}
    .modal-body{padding:20px}
    .modal-actions{display:flex;justify-content:flex-end;gap:12px;padding:16px 20px;border-top:1px solid var(--color-border)}
  `]
})
export class AliquotasComponent {
  private service = inject(AliquotasService);
  aliquotas$ = this.service.list$();
  id = '';
  nome = '';
  ii: number | null = null;
  ipi: number | null = null;
  icms: number | null = null;
  pis: number | null = null;
  cofins: number | null = null;
  padrao = false;
  q = '';
  showModalCadastro = false;
  modoEdicao = false;

  abrirModalCadastro(){ this.limpar(); this.modoEdicao = false; this.showModalCadastro = true; }
  fecharModalCadastro(){ this.showModalCadastro = false; this.limpar(); }
  
  editar(a: AliquotaPerfil){ 
    this.id = a.id;
    this.nome = a.nome; 
    this.ii = a.ii;
    this.ipi = a.ipi;
    this.icms = a.icms;
    this.pis = a.pis;
    this.cofins = a.cofins;
    this.padrao = a.padrao;
    this.modoEdicao = true; 
    this.showModalCadastro = true; 
  }
  
  salvar(){ 
    if(!this.nome || this.ii === null) return; 
    
    if(this.modoEdicao){
      this.service.update(this.id, { 
        nome: this.nome, 
        ii: this.ii ?? 0,
        ipi: this.ipi ?? 0,
        icms: this.icms ?? 0,
        pis: this.pis ?? 0,
        cofins: this.cofins ?? 0,
        padrao: this.padrao
      });
    } else {
      this.service.create({ 
        nome: this.nome, 
        ii: this.ii ?? 0,
        ipi: this.ipi ?? 0,
        icms: this.icms ?? 0,
        pis: this.pis ?? 0,
        cofins: this.cofins ?? 0,
        padrao: this.padrao
      }); 
    }
    
    this.limpar(); 
    this.showModalCadastro = false; 
  }
  
  limpar(){ 
    this.id = '';
    this.nome = ''; 
    this.ii = null;
    this.ipi = null;
    this.icms = null;
    this.pis = null;
    this.cofins = null;
    this.padrao = false;
  }
  
  remove(id: string){ this.service.remove(id); }
  setPadrao(id: string){ this.service.setPadrao(id); }
}
