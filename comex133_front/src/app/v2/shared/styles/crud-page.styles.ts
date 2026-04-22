/**
 * Shared inline styles for all V2 CRUD pages.
 * Use as: styles: CRUD_STYLES
 */
export const CRUD_STYLES = [`
  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .search {
    flex: 1;
    padding: 10px 14px;
    border: 2px solid var(--color-border);
    border-radius: 8px;
    font-size: 14px;
    transition: .2s;
    background: var(--color-surface);
    color: var(--color-text);
  }
  .search:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(102,126,234,.12);
  }
  .empty-state {
    text-align: center;
    padding: 48px 24px;
    color: var(--color-text-muted, #6b7280);
    font-style: italic;
  }
  .row-actions {
    display: flex;
    gap: 4px;
    justify-content: flex-end;
    align-items: center;
  }
  .btn-icon.danger { color: var(--color-danger); }
  .badge-active {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    background: var(--color-success-light, #d1fae5);
    color: #065f46;
  }
  .badge-inactive {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    background: var(--color-danger-light, #fee2e2);
    color: #7f1d1d;
  }
  /* Form panel */
  .detail-header { margin-bottom: 24px; }
  .detail-header h2 { font-size: 20px; margin: 0 0 6px; color: var(--color-text); }
  .detail-header p  { margin: 0; font-size: 14px; color: var(--color-text-muted, #6b7280); }
  .card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: 12px;
    padding: 24px;
  }
  .form-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px 20px;
    margin-bottom: 24px;
  }
  .field { display: flex; flex-direction: column; }
  .field.w2 { grid-column: span 2; }
  .field.w3 { grid-column: span 3; }
  .field label {
    font-size: 13px;
    color: var(--color-text-muted, #6b7280);
    font-weight: 600;
    margin-bottom: 6px;
  }
  .field input, .field select {
    padding: 10px 12px;
    border: 2px solid var(--color-border);
    border-radius: 8px;
    font-size: 14px;
    transition: .2s;
    background: var(--color-surface);
    color: var(--color-text);
  }
  .field input:focus, .field select:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(102,126,234,.12);
  }
  .field input.err { border-color: var(--color-danger); }
  .field select.err { border-color: var(--color-danger); }
  .err-msg { font-size: 12px; color: var(--color-danger); margin-top: 4px; }
  .required { color: var(--color-danger); }
  .actions {
    display: flex;
    gap: 12px;
    padding-top: 16px;
    border-top: 1px solid var(--color-border);
  }

  /* ===== RESPONSIVE: TABLET (≤768px) ===== */
  @media (max-width: 768px) {
    .toolbar {
      flex-wrap: wrap;
      gap: 8px;
    }
    .search {
      width: 100%;
      flex: unset;
      order: 2;
    }
    .toolbar-actions {
      order: 1;
      margin-left: auto;
    }
    .form-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .field.w3 { grid-column: span 2; }
    .card { padding: 16px; }
    .actions { flex-wrap: wrap; }
  }

  /* ===== RESPONSIVE: MOBILE (≤480px) ===== */
  @media (max-width: 480px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
    .field.w2 { grid-column: 1; }
    .field.w3 { grid-column: 1; }
    .card { padding: 12px; }
    .detail-header h2 { font-size: 17px; }
    .row-actions button,
    .row-actions a {
      min-height: 36px;
      min-width: 36px;
    }
    .actions { gap: 8px; }
    .actions button { flex: 1; }
  }
`];
