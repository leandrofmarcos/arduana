import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton-wrapper" [attr.aria-busy]="true" aria-label="Carregando dados">
      <div class="skeleton-row" *ngFor="let r of rows">
        <span class="skeleton-cell skeleton-cell-lg shimmer"></span>
        <span class="skeleton-cell skeleton-cell-md shimmer" *ngIf="cols >= 2"></span>
        <span class="skeleton-cell skeleton-cell-sm shimmer" *ngIf="cols >= 3"></span>
        <span class="skeleton-cell skeleton-cell-xs shimmer" *ngIf="cols >= 4"></span>
      </div>
    </div>
  `,
  styles: [`
    .skeleton-wrapper { padding: 4px 0; }
    .skeleton-row {
      display: flex;
      gap: 16px;
      align-items: center;
      padding: 12px 12px;
      border-bottom: 1px solid var(--color-border-light, #f3f4f6);
    }
    .skeleton-row:last-child { border-bottom: none; }
    .skeleton-cell {
      display: block;
      height: 13px;
      border-radius: 6px;
      background: var(--color-border, #e5e7eb);
    }
    .skeleton-cell-lg { flex: 2; min-width: 80px; }
    .skeleton-cell-md { flex: 1.2; min-width: 60px; }
    .skeleton-cell-sm { flex: 0.8; min-width: 50px; }
    .skeleton-cell-xs { flex: 0.5; min-width: 40px; }
    .shimmer {
      background: linear-gradient(
        90deg,
        var(--color-border, #e5e7eb) 25%,
        var(--color-border-light, #f3f4f6) 50%,
        var(--color-border, #e5e7eb) 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }
    @keyframes shimmer {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `]
})
export class SkeletonListComponent {
  @Input() rowCount = 5;
  @Input() cols = 3;

  get rows(): number[] {
    return Array.from({ length: this.rowCount }, (_, i) => i);
  }
}
