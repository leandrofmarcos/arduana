import { Component, inject, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DespachantesService } from './despachantes.service';
import { Despachante } from '../../domain/despachante.models';

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
  imports: [CommonModule, FormsModule, RouterModule, DespFilterPipe],
  template: `
    <div class="content">
      <div class="header">
        <h1>🧭 Cadastro de Despachantes</h1>
        <p>Gerencie despachantes para uso nos processos</p>
      </div>
      <div class="card">
        <div class="grid">
          <div class="field wide-2"><label>Nome</label><input type="text" [(ngModel)]="nome" placeholder="Despachante XPTO"></div>
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
          <thead><tr><th>Nome</th><th>Documento</th><th>Contato</th><th style="width:80px">Ações</th></tr></thead>
          <tbody>
            <tr *ngFor="let c of (list$ | async) | despFilter:q">
              <td><input type="text" [(ngModel)]="c.nome" (change)="update(c)"></td>
              <td><input type="text" [(ngModel)]="c.documento" (change)="update(c)"></td>
              <td><input type="text" [(ngModel)]="c.contato" (change)="update(c)"></td>
              <td class="row-actions"><button class="btn btn-icon" title="Excluir" (click)="remove(c.id)">🗑️</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `.content{padding:24px}`,
    `.header h1{font-size:22px;margin:0 0 6px 0}`,
    `.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:20px;margin-bottom:16px}`,
    `.grid{display:grid;grid-template-columns:2fr 1fr 1fr;gap:20px 25px}`,
    `.field{display:flex;flex-direction:column}`,
    `.field.wide-2{grid-column:span 2}`,
    `.field label{font-size:13px;color:var(--color-muted);font-weight:600;margin-bottom:8px}`,
    `.field input{padding:13px 16px;border:2px solid var(--color-border);border-radius:8px;font-size:15px;transition:.2s;background:var(--color-surface)}`,
    `.field input:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 4px rgba(102,126,234,.1)}`,
    `.actions{display:flex;gap:12px;margin-top:16px}`,
    `.btn{padding:12px 16px;border-radius:8px;border:none;cursor:pointer;font-weight:700}`,
    `.btn-primary{background:var(--gradient-primary);color:#fff}`,
    `.btn-secondary{background:var(--color-surface);color:var(--color-primary);border:2px solid var(--color-primary)}`,
    `.toolbar{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}`,
    `.search{width:360px;padding:13px 16px;border:2px solid var(--color-border);border-radius:8px;font-size:15px}`,
    `.table{width:100%;border-collapse:collapse}`,
    `.table th{font-size:12px;color:var(--color-muted);font-weight:700;letter-spacing:.4px;text-transform:uppercase}`,
    `.table th,.table td{border-bottom:1px solid var(--color-border);padding:12px;text-align:left}`,
    `.table td input{width:100%;padding:10px 12px;border:2px solid var(--color-border);border-radius:8px;font-size:14px;background:var(--color-surface)}`,
    `.table td input:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 4px rgba(102,126,234,.08)}`,
    `.row-actions{display:flex;align-items:center}`,
    `.btn-icon{width:36px;height:36px;display:flex;align-items:center;justify-content:center;border:2px solid var(--color-border);border-radius:8px;background:var(--color-surface);cursor:pointer}`
  ]
})
export class DespachantesComponent {
  private service = inject(DespachantesService);
  list$ = this.service.list$();
  nome = '';
  documento = '';
  contato = '';
  q = '';
  salvar(){ if(!this.nome || !this.documento) return; this.service.create(this.nome, this.documento, this.contato); this.limpar(); }
  limpar(){ this.nome=''; this.documento=''; this.contato=''; }
  update(c: Despachante){ this.service.update(c.id, { nome: c.nome, documento: c.documento, contato: c.contato }); }
  remove(id: string){ this.service.remove(id); }
}