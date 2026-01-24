import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AliquotasService } from '../services/aliquotas.service';
import { AliquotaPerfil } from '../models/aliquota.models';

@Component({
  selector: 'app-aliquotas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="content">
      <div class="header">
        <h1>🧮 Perfis de Alíquotas</h1>
        <p>Cadastre e reutilize perfis de impostos</p>
      </div>
      <div class="card">
        <div class="grid">
          <div class="field"><label>Nome</label><input type="text" [(ngModel)]="nome" placeholder="Padrão Nacional"></div>
          <div class="field"><label>Descrição</label><input type="text" [(ngModel)]="descricao" placeholder="Perfil base"></div>
          <div class="field"><label>II (%)</label><input type="number" step="0.01" [(ngModel)]="ii"></div>
          <div class="field"><label>IPI (%)</label><input type="number" step="0.01" [(ngModel)]="ipi"></div>
          <div class="field"><label>ICMS (%)</label><input type="number" step="0.01" [(ngModel)]="icms"></div>
          <div class="field"><label>PIS (%)</label><input type="number" step="0.01" [(ngModel)]="pis"></div>
          <div class="field"><label>COFINS (%)</label><input type="number" step="0.01" [(ngModel)]="cofins"></div>
          <div class="field"><label>Padrão</label><input type="checkbox" [(ngModel)]="padrao"></div>
        </div>
        <div class="actions"><button class="btn btn-primary" (click)="salvar()">Salvar</button><button class="btn btn-secondary" (click)="limpar()">Limpar</button></div>
      </div>
      <div class="card">
        <table class="table">
          <thead><tr><th>Nome</th><th>II</th><th>IPI</th><th>ICMS</th><th>PIS</th><th>COFINS</th><th>Padrão</th><th>Ações</th></tr></thead>
          <tbody>
            <tr *ngFor="let a of (list$ | async)">
              <td><input type="text" [(ngModel)]="a.nome" (change)="update(a)"></td>
              <td><input type="number" step="0.01" [(ngModel)]="a.ii" (change)="update(a)"></td>
              <td><input type="number" step="0.01" [(ngModel)]="a.ipi" (change)="update(a)"></td>
              <td><input type="number" step="0.01" [(ngModel)]="a.icms" (change)="update(a)"></td>
              <td><input type="number" step="0.01" [(ngModel)]="a.pis" (change)="update(a)"></td>
              <td><input type="number" step="0.01" [(ngModel)]="a.cofins" (change)="update(a)"></td>
              <td><input type="checkbox" [checked]="a.padrao" (change)="setPadrao(a)"></td>
              <td><button class="btn btn-secondary" (click)="remove(a.id)">Excluir</button></td>
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
    `.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px 25px}`,
    `.field{display:flex;flex-direction:column}`,
    `.field label{font-size:13px;color:var(--color-muted);font-weight:600;margin-bottom:8px}`,
    `.field input,.field select{padding:13px 16px;border:2px solid var(--color-border);border-radius:8px;font-size:15px;transition:.2s;background:var(--color-surface)}`,
    `.field input:focus,.field select:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 4px rgba(102,126,234,.1)}`,
    `.actions{display:flex;gap:12px;margin-top:16px}`,
    `.btn{padding:12px 16px;border-radius:8px;border:none;cursor:pointer;font-weight:700}`,
    `.btn-primary{background:var(--gradient-primary);color:#fff}`,
    `.btn-secondary{background:var(--color-surface);color:var(--color-primary);border:2px solid var(--color-primary)}`,
    `.table{width:100%;border-collapse:collapse}`,
    `.table th{font-size:12px;color:var(--color-muted);font-weight:700;letter-spacing:.4px;text-transform:uppercase}`,
    `.table th,.table td{border-bottom:1px solid var(--color-border);padding:12px;text-align:left}`,
    `.table td input{width:100%;padding:10px 12px;border:2px solid var(--color-border);border-radius:8px;font-size:14px;background:var(--color-surface)}`,
    `.table td input:focus{outline:none;border-color:var(--color-primary);box-shadow:0 0 0 4px rgba(102,126,234,.08)}`
  ]
})
export class AliquotasComponent {
  private service = inject(AliquotasService);
  list$ = this.service.list$();
  nome = 'Padrão Nacional';
  descricao = '';
  ii = 14.4; ipi = 7.43; icms = 4; pis = 2.1; cofins = 10.65;
  padrao = false;
  salvar(){ if(!this.nome) return; this.service.create({ nome: this.nome, descricao: this.descricao, ii: this.ii, ipi: this.ipi, icms: this.icms, pis: this.pis, cofins: this.cofins, padrao: this.padrao }); this.limpar(); }
  limpar(){ this.nome=''; this.descricao=''; this.ii=0; this.ipi=0; this.icms=0; this.pis=0; this.cofins=0; this.padrao=false; }
  update(a:any){ this.service.update(a.id, { nome: a.nome, descricao: a.descricao, ii: a.ii, ipi: a.ipi, icms: a.icms, pis: a.pis, cofins: a.cofins, padrao: a.padrao }); }
  remove(id:string){ this.service.remove(id); }
  setPadrao(a:any){ this.service.setPadrao(a.id); }
}