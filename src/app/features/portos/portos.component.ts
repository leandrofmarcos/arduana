import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PortosService } from './portos.service';
import { Pipe, PipeTransform } from '@angular/core';
@Pipe({name:'portoFilter', standalone: true})
export class PortoFilterPipe implements PipeTransform {
  transform(list: any[] | null, q: string){
    if(!list) return [];
    if(!q) return list;
    const s = q.toLowerCase();
    return list.filter(p => (p.nome||'').toLowerCase().includes(s) || (p.codigo||'').toLowerCase().includes(s) || (p.pais||'').toLowerCase().includes(s));
  }
}

@Component({
  selector: 'app-portos',
  standalone: true,
  imports: [CommonModule, FormsModule, PortoFilterPipe],
  template: `
    <div class="content">
      <div class="header">
        <h1>🛳️ Cadastro de Portos</h1>
        <p>Gerencie portos para uso nas simulações</p>
      </div>
      <div class="card">
        <div class="grid">
          <div class="field"><label>Nome</label><input type="text" [(ngModel)]="nome" placeholder="Porto de Santos"></div>
          <div class="field"><label>Código</label><input type="text" [(ngModel)]="codigo" placeholder="BRSSZ"></div>
          <div class="field"><label>País</label><input type="text" [(ngModel)]="pais" placeholder="Brasil"></div>
        </div>
        <div class="actions"><button class="btn btn-primary" (click)="salvar()">Salvar</button><button class="btn btn-secondary" (click)="limpar()">Limpar</button></div>
      </div>
      <div class="card">
        <div class="toolbar">
          <input class="search" type="text" [(ngModel)]="q" placeholder="Buscar por nome, código ou país" />
        </div>
        <table class="table">
          <thead><tr><th>Nome</th><th>Código</th><th>País</th><th>Ações</th></tr></thead>
          <tbody>
            <tr *ngFor="let p of (portos$ | async) | portoFilter:q">
              <td><input type="text" [(ngModel)]="p.nome" (change)="update(p)"></td>
              <td><input type="text" [(ngModel)]="p.codigo" (change)="update(p)"></td>
              <td><input type="text" [(ngModel)]="p.pais" (change)="update(p)"></td>
              <td><button class="btn btn-secondary" (click)="remove(p.id)">Excluir</button></td>
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
    `.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px 25px}`,
    `.field{display:flex;flex-direction:column}`,
    `.field label{font-size:13px;color:var(--color-muted);font-weight:600;margin-bottom:8px}`,
    `.field input,.field select{padding:13px 16px;border:2px solid var(--color-border);border-radius:8px;font-size:15px;transition:.2s;background:var(--color-surface)}`,
    `.field input:focus,.field select:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 4px rgba(102,126,234,.1)}`,
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
    `.table td input:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 4px rgba(102,126,234,.08)}`
  ]
})
export class PortosComponent {
  private service = inject(PortosService);
  portos$ = this.service.list$();
  nome = '';
  codigo = '';
  pais = '';
  q = '';
  salvar(){ if(!this.nome || !this.codigo || !this.pais) return; this.service.create(this.nome, this.codigo, this.pais); this.limpar(); }
  limpar(){ this.nome=''; this.codigo=''; this.pais=''; }
  update(p:any){ this.service.update(p.id, { nome: p.nome, codigo: p.codigo, pais: p.pais }); }
  remove(id:string){ this.service.remove(id); }
}