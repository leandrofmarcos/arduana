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
  orcamento: (id: string) => `orcamento_${id}`,
  orcamentosIndex: () => `orcamentos_index`,
  currentId: () => `current_orcamento_id`,
  versions: (id: string) => `versions_${id}`,
  packlist: (id: string) => `packlist_${id}`,
  packlistMock: () => `packlist_mock`,
  history: (id: string) => `history_${id}`,
  custosIndex: () => `custos_index`,
  custoSnapshot: (id: string) => `custo_${id}`,
  vendasIndex: () => `vendas_index`,
  vendaSnapshot: (id: string) => `venda_${id}`,
  aduanaIndex: () => `aduana_index`,
  aduanaSnapshot: (id: string) => `aduana_${id}`
};
