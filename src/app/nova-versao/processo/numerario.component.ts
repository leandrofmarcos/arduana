import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrcamentoService } from '../services/orcamento.service';

@Component({
  standalone: true,
  selector: 'app-numerario-nova',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card">
      <h2>Numerário</h2>
      <p>Solicitação e acompanhamento de provisões para execução das despesas</p>
      <div class="empty-state">
        <p>Nenhum processo na fase de Numerário no momento.</p>
      </div>
    </div>
  `,
  styles: [
    `.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:24px}`,
    `.empty-state{text-align:center;padding:40px 20px;color:var(--color-muted)}`,
    `.empty-state p{margin:0}`
  ]
})
export class NumerarioNovaComponent {
  constructor(private s: OrcamentoService){}
}
