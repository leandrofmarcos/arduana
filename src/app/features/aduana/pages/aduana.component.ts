import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AduanaService } from '../services/aduana.service';

@Component({
  standalone: true,
  selector: 'app-aduana-nova',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card">
      <h2>Aduana</h2>
      <p>Registros gerados ao aprovar venda</p>
      <table class="table">
        <thead>
          <tr>
            <th>Processo</th>
            <th>Cliente</th>
            <th>Despachante</th>
            <th>Criado em</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngIf="items.length === 0"><td colspan="4">Nenhum registro</td></tr>
          <tr *ngFor="let it of items">
            <td>{{it.codigo || it.orcamentoId}}</td>
            <td>{{it.cliente || '-'}} </td>
            <td>{{it.despachante || '-'}} </td>
            <td>{{it.createdAt | date:'short'}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:24px}`,
    `.btn{padding:10px 12px;border-radius:10px}`,
    `.table{width:100%;border-collapse:collapse;margin-top:12px}`,
    `.table th,.table td{border-bottom:1px solid var(--color-border);padding:10px;text-align:left}`
  ]
})
export class AduanaNovaComponent {
  items: any[] = [];
  constructor(private s: AduanaService){
    this.items = this.s.listAduanas();
  }
}