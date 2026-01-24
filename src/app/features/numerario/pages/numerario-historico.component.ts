import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NumerarioService } from '../services/numerario.service';

@Component({
  standalone: true,
  selector: 'app-numerario-historico-nova',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card">
      <h2>Histórico de Numerário</h2>
      <p>Rastreamento das solicitações e pagamentos de numerário</p>
      <div class="empty-state">
        <p>Nenhum histórico de numerário registrado.</p>
      </div>
    </div>
  `,
  styles: [
    `.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:24px}`,
    `.empty-state{text-align:center;padding:40px 20px;color:var(--color-muted)}`,
    `.empty-state p{margin:0}`
  ]
})
export class NumerarioHistoricoNovaComponent {
  constructor(private s: NumerarioService){}
}
