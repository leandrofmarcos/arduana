import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-fechamento-nova',
  imports: [CommonModule, RouterModule],
  template: `
    <div class="card">
      <h2>Fechamento</h2>
      <p>Esqueleto de conteúdo</p>
    </div>
  `,
  styles: [
    `.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:12px;padding:24px}`,
    `.btn{padding:10px 12px;border-radius:10px}`
  ]
})
export class FechamentoNovaComponent {}