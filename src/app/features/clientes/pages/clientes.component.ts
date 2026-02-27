import { Component, inject, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientesService } from '../services/clientes.service';
import { Cliente } from '../models/cliente.models';
import { PageHeaderComponent } from '../../../core/layout/page-header.component';

@Pipe({name:'clienteFilter', standalone: true})
export class ClienteFilterPipe implements PipeTransform {
  transform(list: Cliente[] | null, q: string){
    if(!list) return [];
    if(!q) return list;
    const s = q.toLowerCase();
    return list.filter(c => (c.nome||'').toLowerCase().includes(s));
  }
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, ClienteFilterPipe, PageHeaderComponent],
  template: `
    <div class="container-standard">
      <app-page-header 
        icon="👥" 
        title="Cadastro de Clientes" 
        subtitle="Gerencie clientes para uso nos processos">
        <button class="btn btn-primary" (click)="abrirModalCadastro()">+ Novo Cliente</button>
      </app-page-header>

      <div class="content-section">
        <div class="toolbar">
          <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar por nome" />
        </div>
        <table class="data-table">
          <thead><tr><th>Nome</th><th>Contato</th><th>Ações</th></tr></thead>
          <tbody>
            <tr *ngFor="let c of (clientes$ | async) | clienteFilter:q">
              <td>{{ c.nome }}</td>
              <td>{{ c.contato }}</td>
              <td>
                <div class="row-actions">
                  <button class="btn-icon" title="Editar" (click)="editar(c)">✏️</button>
                  <button class="btn-icon danger" title="Excluir cliente" (click)="remove(c.id)">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="modal-backdrop" *ngIf="showModalCadastro">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">{{ modoEdicao ? 'Editar Cliente' : 'Novo Cliente' }}</div>
          <button class="btn btn-secondary" (click)="fecharModalCadastro()">Fechar</button>
        </div>
        <div class="modal-body">
          <div class="grid">
            <div class="field"><label>Nome *</label><input type="text" [(ngModel)]="nome" placeholder="Empresa XYZ" required></div>
            <div class="field"><label>Contato</label><input type="text" [(ngModel)]="contato" placeholder="(11) 90000-0000"></div>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" (click)="fecharModalCadastro()">Cancelar</button>
          <button class="btn btn-primary" (click)="salvar()">{{ modoEdicao ? 'Salvar' : 'Criar' }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px 25px}
    .field{display:flex;flex-direction:column}
    .field label{font-size:13px;color:var(--color-muted);font-weight:600;margin-bottom:8px}
    .field input,.field select{padding:13px 16px;border:2px solid var(--color-border);border-radius:8px;font-size:15px;transition:.2s;background:var(--color-surface)}
    .field input:focus,.field select:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 4px rgba(102,126,234,.1)}
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
    .modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px}
    .modal{width:min(900px,95vw);max-height:90vh;overflow-y:auto;background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;box-shadow:0 20px 40px rgba(0,0,0,.2);animation:modalFadeIn .2s}
    @keyframes modalFadeIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
    .modal-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--color-border)}
    .modal-title{font-size:16px;font-weight:700}
    .modal-body{padding:20px}
    .modal-actions{display:flex;justify-content:flex-end;gap:12px;padding:16px 20px;border-top:1px solid var(--color-border)}
  `]
})
export class ClientesComponent {
  private service = inject(ClientesService);
  clientes$ = this.service.list$();
  id = '';
  nome = '';
  contato = '';
  q = '';
  showModalCadastro = false;
  modoEdicao = false;
  
  abrirModalCadastro(){ this.limpar(); this.modoEdicao = false; this.showModalCadastro = true; }
  fecharModalCadastro(){ this.showModalCadastro = false; this.limpar(); }
  
  editar(c: Cliente){ 
    this.id = c.id;
    this.nome = c.nome; 
    this.contato = c.contato || '';
    this.modoEdicao = true; 
    this.showModalCadastro = true; 
  }
  
  salvar(){ 
    if(!this.nome) {
      alert('Preencha o campo obrigatório (Nome)');
      return;
    }
    
    if(this.modoEdicao){
      this.service.update(this.id, { 
        nome: this.nome,
        contato: this.contato
      });
    } else {
      this.service.create(this.nome, '', this.contato); 
    }
    
    this.limpar(); 
    this.showModalCadastro = false; 
  }
  
  limpar(){ this.id=''; this.nome=''; this.contato=''; }
  remove(id: string){ this.service.remove(id); }
}