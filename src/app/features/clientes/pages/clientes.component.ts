import { Component, inject, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ClientesService } from '../services/clientes.service';
import { Cliente } from '../models/cliente.models';

@Pipe({name:'clienteFilter', standalone: true})
export class ClienteFilterPipe implements PipeTransform {
  transform(list: Cliente[] | null, q: string){
    if(!list) return [];
    if(!q) return list;
    const s = q.toLowerCase();
    return list.filter(c => (c.nome||'').toLowerCase().includes(s) || (c.documento||'').toLowerCase().includes(s));
  }
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ClienteFilterPipe],
  template: `
    <div class="container-standard">
      <div class="header">
        <h1>👥 Cadastro de Clientes v2.0</h1>
        <p>Gerencie clientes para uso nos processos</p>
      </div>
      <div class="card">
        <div class="grid">
          <div class="field"><label>Nome</label><input type="text" [(ngModel)]="nome" placeholder="Empresa XYZ"></div>
          <div class="field"><label>Documento</label><input type="text" [(ngModel)]="documento" placeholder="00.000.000/0001-00"></div>
          <div class="field"><label>Contato</label><input type="text" [(ngModel)]="contato" placeholder="(11) 90000-0000"></div>
        </div>
        <div class="actions"><button class="btn btn-primary" (click)="salvar()">💾 Salvar</button><button class="btn btn-secondary" (click)="limpar()">🧹 Limpar</button></div>
      </div>
      <div class="card">
        <div class="toolbar">
          <input class="search" type="text" [(ngModel)]="q" placeholder="🔎 Buscar por nome ou documento" />
        </div>
        <table class="table">
          <thead><tr><th>Nome</th><th>Documento</th><th>Contato</th><th>Ações</th></tr></thead>
          <tbody>
            <tr *ngFor="let c of (clientes$ | async) | clienteFilter:q">
              <td><input type="text" [(ngModel)]="c.nome" (change)="update(c)"></td>
              <td><input type="text" [(ngModel)]="c.documento" (change)="update(c)"></td>
              <td><input type="text" [(ngModel)]="c.contato" (change)="update(c)"></td>
              <td><button class="btn btn-secondary" (click)="remove(c.id)">Excluir</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `.header h1{font-size:22px;margin:0 0 6px 0}`,
    `.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:20px;margin-bottom:16px}`,
    `.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px 25px}`,
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
    `.table{width:100%;border-collapse:collapse}`,
    `.table th{font-size:12px;color:var(--color-muted);font-weight:700;letter-spacing:.4px;text-transform:uppercase}`,
    `.table th,.table td{border-bottom:1px solid var(--color-border);padding:12px;text-align:left}`,
    `.table td input{width:100%;padding:10px 12px;border:2px solid var(--color-border);border-radius:8px;font-size:14px;background:var(--color-surface)}`,
    `.table td input:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 4px rgba(102,126,234,.08)}`
  ]
})
export class ClientesComponent {
  private service = inject(ClientesService);
  clientes$ = this.service.list$();
  nome = '';
  documento = '';
  contato = '';
  q = '';
  salvar(){ if(!this.nome || !this.documento) return; this.service.create(this.nome, this.documento, this.contato); this.limpar(); }
  limpar(){ this.nome=''; this.documento=''; this.contato=''; }
  update(c: Cliente){ this.service.update(c.id, { nome: c.nome, documento: c.documento, contato: c.contato }); }
  remove(id: string){ this.service.remove(id); }
}