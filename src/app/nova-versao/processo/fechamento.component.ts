import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrcamentoService } from '../services/orcamento.service';

@Component({
  standalone: true,
  selector: 'app-fechamento-nova',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card">
      <h2>Fechamento</h2>
      <p>Consolidação final do processo e bloqueio de alterações</p>
      <div class="empty-state">
        <p>Nenhum processo em fase de fechamento no momento.</p>
      </div>
    </div>
  `,
  styles: [
    `.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:24px}`,
    `.empty-state{text-align:center;padding:40px 20px;color:var(--color-muted)}`,
    `.empty-state p{margin:0}`
  ]
})
export class FechamentoNovaComponent {
  constructor(private s: OrcamentoService){}
}
