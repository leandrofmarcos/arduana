import { Component, inject, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FuncionariosService } from '../services/funcionarios.service';
import { Funcionario } from '../../../domain/funcionario.models';
import { PageHeaderComponent } from '../../../core/layout/page-header.component';

@Pipe({name:'funcFilter', standalone: true})
export class FuncFilterPipe implements PipeTransform {
  transform(list: Funcionario[] | null, q: string){
    if(!list) return [];
    if(!q) return list;
    const s = q.toLowerCase();
    return list.filter(f => 
      (f.nomeCompleto||'').toLowerCase().includes(s) || 
      (f.username||'').toLowerCase().includes(s) ||
      (f.email||'').toLowerCase().includes(s) ||
      (f.setor||'').toLowerCase().includes(s) ||
      (f.cargo||'').toLowerCase().includes(s)
    );
  }
}

@Component({
  selector: 'app-funcionarios',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, FuncFilterPipe, PageHeaderComponent],
  template: `
    <div class="container-standard">
      <app-page-header
        icon="👥"
        title="Cadastro de Funcionários"
        subtitle="Gerencie os funcionários da empresa">
        <button class="btn btn-primary" (click)="abrirModalCadastro()">+ Novo Funcionário</button>
      </app-page-header>

      <div class="modal-backdrop" *ngIf="showModalCadastro">
        <div class="modal">
          <div class="modal-header">
            <div class="modal-title">{{ isEdicao ? 'Editar Funcionário' : 'Novo Funcionário' }}</div>
            <button class="btn btn-secondary" (click)="fecharModalCadastro()">Fechar</button>
          </div>
          <div class="modal-body">
            <div class="grid">
              <div class="field full-width">
                <label>Nome Completo *</label>
                <input type="text" [(ngModel)]="nomeCompleto" placeholder="João da Silva">
              </div>
              <div class="field">
                <label>Username *</label>
                <input type="text" [(ngModel)]="username" placeholder="joao.silva">
              </div>
              <div class="field">
                <label>Email *</label>
                <input type="email" [(ngModel)]="email" placeholder="joao@empresa.com">
              </div>
              <div class="field">
                <label>WhatsApp</label>
                <input type="text" [(ngModel)]="contatoWhatsApp" placeholder="+55 11 90000-0000">
              </div>
              <div class="field">
                <label>WeChat</label>
                <input type="text" [(ngModel)]="contatoWeChat" placeholder="joaosilva123">
              </div>
              <div class="field">
                <label>Setor *</label>
                <input type="text" [(ngModel)]="setor" placeholder="Comercial, Logística, etc.">
              </div>
              <div class="field">
                <label>Cargo *</label>
                <input type="text" [(ngModel)]="cargo" placeholder="Analista, Gerente, etc.">
              </div>
            </div>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="fecharModalCadastro()">Cancelar</button>
            <button class="btn btn-primary" (click)="salvar()">{{ isEdicao ? 'Atualizar' : 'Salvar' }}</button>
          </div>
        </div>
      </div>

      <div class="content-section">
        <div class="toolbar">
          <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar por nome, username, email, setor ou cargo" />
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>Nome Completo</th>
              <th>Username</th>
              <th>Email</th>
              <th>WhatsApp</th>
              <th>WeChat</th>
              <th>Setor</th>
              <th>Cargo</th>
              <th style="width:120px">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let f of (list$ | async) | funcFilter:q">
              <td>{{ f.nomeCompleto }}</td>
              <td>{{ f.username }}</td>
              <td>{{ f.email }}</td>
              <td>{{ f.contatoWhatsApp || '—' }}</td>
              <td>{{ f.contatoWeChat || '—' }}</td>
              <td>{{ f.setor }}</td>
              <td>{{ f.cargo }}</td>
              <td>
                <div class="row-actions">
                  <button class="btn-icon" title="Editar funcionário" (click)="editar(f)">✏️</button>
                  <button class="btn-icon danger" title="Excluir funcionário" (click)="remove(f.id)">🗑️</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px 25px}`,
    `.grid .full-width{grid-column:1/-1}`,
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
    `.row-actions{display:flex;justify-content:flex-end;gap:4px;align-items:center}`,
    `.row-actions .btn-icon{padding:6px 8px}`,
    `.btn-icon{background:transparent;border:none;cursor:pointer;font-size:16px;transition:.2s}`,
    `.btn-icon:hover{transform:scale(1.1)}`,
    `.btn-icon.danger{color:var(--color-danger)}`,
    `.modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:1000}`,
    `.modal{width:min(900px,92vw);background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;box-shadow:0 20px 40px rgba(0,0,0,.2);overflow:hidden}`,
    `.modal-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;border-bottom:1px solid var(--color-border)}`,
    `.modal-title{font-size:16px;font-weight:700}`,
    `.modal-body{padding:20px;max-height:70vh;overflow-y:auto}`,
    `.modal-actions{display:flex;justify-content:flex-end;gap:12px;padding:16px 20px;border-top:1px solid var(--color-border)}`
  ]
})
export class FuncionariosComponent {
  private service = inject(FuncionariosService);
  list$ = this.service.list$();
  
  nomeCompleto = '';
  username = '';
  email = '';
  contatoWhatsApp = '';
  contatoWeChat = '';
  setor = '';
  cargo = '';
  q = '';
  
  showModalCadastro = false;
  isEdicao = false;
  idEdicao = '';

  abrirModalCadastro(){ 
    this.limpar(); 
    this.isEdicao = false;
    this.showModalCadastro = true; 
  }

  editar(func: Funcionario){
    this.idEdicao = func.id;
    this.nomeCompleto = func.nomeCompleto;
    this.username = func.username;
    this.email = func.email;
    this.contatoWhatsApp = func.contatoWhatsApp || '';
    this.contatoWeChat = func.contatoWeChat || '';
    this.setor = func.setor;
    this.cargo = func.cargo;
    this.isEdicao = true;
    this.showModalCadastro = true;
  }

  fecharModalCadastro(){ 
    this.showModalCadastro = false; 
    this.limpar(); 
  }

  salvar(){ 
    if(!this.nomeCompleto || !this.username || !this.email || !this.setor || !this.cargo) {
      alert('Preencha todos os campos obrigatórios (*)');
      return;
    }

    const data = {
      nomeCompleto: this.nomeCompleto,
      username: this.username,
      email: this.email,
      contatoWhatsApp: this.contatoWhatsApp || undefined,
      contatoWeChat: this.contatoWeChat || undefined,
      setor: this.setor,
      cargo: this.cargo
    };

    if(this.isEdicao){
      this.service.update(this.idEdicao, data);
    } else {
      this.service.create(data);
    }

    this.limpar(); 
    this.showModalCadastro = false; 
  }

  limpar(){ 
    this.nomeCompleto = ''; 
    this.username = ''; 
    this.email = '';
    this.contatoWhatsApp = '';
    this.contatoWeChat = '';
    this.setor = '';
    this.cargo = '';
    this.isEdicao = false;
    this.idEdicao = '';
  }

  remove(id: string){ 
    if(confirm('Tem certeza que deseja excluir este funcionário?')){
      this.service.remove(id); 
    }
  }
}
