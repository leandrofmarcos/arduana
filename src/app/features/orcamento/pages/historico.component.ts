import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrcamentoService } from '../services/orcamento.service';

@Component({
  standalone: true,
  selector: 'app-historico-nova',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card">
      <h2>Histórico do Processo</h2>
      <p>Rastreamento completo das alterações e versões de cada orçamento</p>
      <div class="empty-state">
        <p>Selecione um processo para visualizar o histórico de alterações.</p>
      </div>
    </div>
  `,
  styles: [
    `.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:24px}`,
    `.empty-state{text-align:center;padding:40px 20px;color:var(--color-muted)}`,
    `.empty-state p{margin:0}`
  ]
})
export class HistoricoNovaComponent {
  constructor(private s: OrcamentoService){}
}
