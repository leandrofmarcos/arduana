import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnexosService } from './anexos.service';

@Component({
  selector: 'app-anexos',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="content">
      <div class="card">
        <h2>Anexos do Processo</h2>
        <input type="file" (change)="onFile($event)" multiple style="margin-top:8px"/>
      </div>

      <div class="card" style="margin-top:16px">
        <h3>Arquivos</h3>
        <table class="grid">
          <thead><tr><th>Nome</th><th>Tipo</th><th>Tamanho</th><th>Data</th><th style="width:160px">Ações</th></tr></thead>
          <tbody>
            <tr *ngFor="let a of (list$ | async)">
              <td>{{a.nome}}</td>
              <td>{{a.mime}}</td>
              <td>{{a.tamanho | number}} bytes</td>
              <td>{{a.dataUpload | date:'short'}}</td>
              <td><button class="btn btn-danger" (click)="remover(a.id)">Excluir</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [
    `.content{padding:24px}`,
    `.grid{width:100%;border-collapse:collapse}`,
    `.grid th{background:var(--color-subtle-bg);color:var(--color-text);text-align:left;padding:10px;border-bottom:1px solid var(--color-border)}`,
    `.grid td{padding:10px;border-bottom:1px solid var(--color-border)}`,
  ]
})
export class AnexosComponent {
  private s = inject(AnexosService);
  list$ = this.s.list$();
  onFile(ev: Event){ const input = ev.target as HTMLInputElement; const files = input.files; if(!files) return; Array.from(files).forEach(f => this.s.addFile(f)); input.value = ''; }
  remover(id: string){ this.s.remove(id); }
}