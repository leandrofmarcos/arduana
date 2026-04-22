import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PagedResult, PaginationParams } from '../../api/models/api-response.model';

/**
 * Componente de paginação reutilizável
 * Emite eventos quando página ou tamanho muda
 */
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pagination-container" *ngIf="pagedResult && pagedResult.totalPages > 1">
      <div class="pagination-info">
        <span class="total-items">
          Total: {{ pagedResult.totalCount }} item(ns)
        </span>
        <span class="current-page">
          Página {{ pagedResult.page }} de {{ pagedResult.totalPages }}
        </span>
      </div>

      <div class="pagination-controls">
        <!-- Botão Anterior -->
        <button
          [disabled]="!pagedResult.hasPreviousPage"
          (click)="onPreviousPage()"
          class="btn-nav"
          [attr.aria-label]="'Página anterior'"
        >
          ← Anterior
        </button>

        <!-- Seletor de página -->
        <select
          [value]="pagedResult.page"
          (change)="onPageChange($event)"
          class="page-select"
          [attr.aria-label]="'Selecionar página'"
        >
          <option *ngFor="let p of pagesArray" [value]="p">
            Página {{ p }}
          </option>
        </select>

        <!-- Botão Próxima -->
        <button
          [disabled]="!pagedResult.hasNextPage"
          (click)="onNextPage()"
          class="btn-nav"
          [attr.aria-label]="'Próxima página'"
        >
          Próxima →
        </button>

        <!-- Seletor de tamanho da página -->
        <select
          [value]="pageSize"
          (change)="onPageSizeChange($event)"
          class="page-size-select"
          [attr.aria-label]="'Itens por página'"
        >
          <option value="10">10 por página</option>
          <option value="25">25 por página</option>
          <option value="50">50 por página</option>
          <option value="100">100 por página</option>
        </select>
      </div>
    </div>
  `,
  styles: [`
    .pagination-container {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      background: #f5f5f5;
      border-top: 1px solid #e0e0e0;
      border-radius: 0 0 8px 8px;
      margin-top: 16px;
      gap: 20px;
      flex-wrap: wrap;
    }

    .pagination-info {
      display: flex;
      gap: 16px;
      font-size: 12px;
      color: #666;
      flex: 1;
      min-width: 200px;
    }

    .pagination-controls {
      display: flex;
      gap: 8px;
      align-items: center;
      flex: 1;
      min-width: 300px;
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    .btn-nav {
      padding: 8px 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-nav:hover:not(:disabled) {
      background: #5568d3;
      transform: translateY(-1px);
    }

    .btn-nav:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .page-select,
    .page-size-select {
      padding: 8px 12px;
      border: 1px solid #d0d0d0;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
    }

    .page-select:hover,
    .page-size-select:hover {
      border-color: #667eea;
    }

    @media (max-width: 768px) {
      .pagination-container {
        flex-direction: column;
        align-items: stretch;
      }

      .pagination-info,
      .pagination-controls {
        justify-content: center;
      }
    }
  `]
})
export class PaginationComponent {
  @Input() pagedResult: PagedResult<any> | null = null;
  @Output() pageChanged = new EventEmitter<PaginationParams>();

  pageSize = 10;

  get pagesArray(): number[] {
    const pages = [];
    const total = this.pagedResult?.totalPages || 1;
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
    return pages;
  }

  onPreviousPage(): void {
    if (this.pagedResult?.hasPreviousPage) {
      this.pageChanged.emit({
        page: this.pagedResult.page - 1,
        pageSize: this.pagedResult.pageSize
      });
    }
  }

  onNextPage(): void {
    if (this.pagedResult?.hasNextPage) {
      this.pageChanged.emit({
        page: this.pagedResult.page + 1,
        pageSize: this.pagedResult.pageSize
      });
    }
  }

  onPageChange(event: Event): void {
    const page = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pageChanged.emit({
      page,
      pageSize: this.pagedResult?.pageSize || this.pageSize
    });
  }

  onPageSizeChange(event: Event): void {
    const newPageSize = parseInt((event.target as HTMLSelectElement).value, 10);
    this.pageSize = newPageSize;
    this.pageChanged.emit({
      page: 1,
      pageSize: newPageSize
    });
  }
}
