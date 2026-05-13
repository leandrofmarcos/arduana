import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'app-empty-loading',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  template: `
    <div class="empty-loading" role="status" [attr.aria-label]="mensagem">
      <app-spinner size="lg"></app-spinner>
      <span class="empty-loading-msg">{{ mensagem }}</span>
    </div>
  `,
  styles: [`
    .empty-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      padding: 48px 24px;
      color: var(--color-text-muted, #6b7280);
    }
    .empty-loading-msg {
      font-size: 14px;
      font-style: italic;
    }
  `]
})
export class EmptyLoadingComponent {
  @Input() mensagem = 'Carregando...';
}
