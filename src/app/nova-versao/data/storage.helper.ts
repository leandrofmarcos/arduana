export type KeyGen = (suffix?: string) => string;

export function readJSON<T>(key: string): T | null {
  try { const ls = (globalThis as any).localStorage as Storage | undefined; if (!ls) return null; const raw = ls.getItem(key); return raw ? JSON.parse(raw) as T : null; } catch { return null; }
}

export function writeJSON(key: string, value: any): void {
  try { const ls = (globalThis as any).localStorage as Storage | undefined; if (!ls) return; ls.setItem(key, JSON.stringify(value)); } catch { /* noop */ }
}

export function randomId(): string {
  const c = (globalThis as any).crypto; return typeof c?.randomUUID === 'function' ? c.randomUUID() : Math.random().toString(36).slice(2) + Date.now();
}

export const keys = {
  // Compatibilidade com nomenclatura antiga
  processo: (id: string) => `nova_orcamento_${id}`,
  processosIndex: () => `nova_orcamentos_index`,
  // Nova nomenclatura (Orçamento como core)
  orcamento: (id: string) => `nova_orcamento_${id}`,
  orcamentosIndex: () => `nova_orcamentos_index`,
  currentId: () => `nova_current_orcamento_id`,
  versions: (id: string) => `nova_versions_${id}`,
  packlist: (id: string) => `nova_packlist_${id}`,
  packlistMock: () => `nova_packlist_mock`,
  history: (id: string) => `nova_history_${id}`,
  custosIndex: () => `nova_custos_index`,
  custoSnapshot: (id: string) => `nova_custo_${id}`,
  vendasIndex: () => `nova_vendas_index`,
  vendaSnapshot: (id: string) => `nova_venda_${id}`,
  aduanaIndex: () => `nova_aduana_index`,
  aduanaSnapshot: (id: string) => `nova_aduana_${id}`
};