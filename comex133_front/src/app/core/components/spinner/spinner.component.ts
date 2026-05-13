import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="spinner"
      [class.spinner-sm]="size === 'sm'"
      [class.spinner-md]="size === 'md'"
      [class.spinner-lg]="size === 'lg'"
      [style.--spinner-color]="color"
      role="status"
      aria-label="Carregando"
    ></span>
  `,
  styles: [`
    .spinner {
      display: inline-block;
      border-radius: 50%;
      border: 2px solid transparent;
      border-top-color: var(--spinner-color, var(--color-primary, #667eea));
      animation: spin 0.65s linear infinite;
      flex-shrink: 0;
    }
    .spinner-sm { width: 14px; height: 14px; border-width: 2px; }
    .spinner-md { width: 20px; height: 20px; border-width: 2px; }
    .spinner-lg { width: 32px; height: 32px; border-width: 3px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class SpinnerComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() color?: string;
}
