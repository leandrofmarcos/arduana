import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AduanaService } from '../services/aduana.service';

@Component({
  standalone: true,
  selector: 'app-aduana-atualizar-nova',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card">
      <h2>Atualização de Custos (Aduana)</h2>
      <p>Atualização de valores e despesas da fase aduaneira</p>
      <div class="empty-state">
        <p>Selecione um processo para visualizar e atualizar os custos da aduana.</p>
      </div>
    </div>
  `,
  styles: [
    `.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:24px}`,
    `.empty-state{text-align:center;padding:40px 20px;color:var(--color-muted)}`,
    `.empty-state p{margin:0}`
  ]
})
export class AduanaAtualizarNovaComponent {
  constructor(private s: AduanaService){}
}
