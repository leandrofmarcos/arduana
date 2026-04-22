export const keysV2 = {
  // Cadastros
  portosOrigem:      'v2_portos_origem',
  portosDestino:     'v2_portos_destino',
  clientes:          'v2_clientes',
  importadores:      'v2_importadores',
  exportadores:      'v2_exportadores',
  agentesCarga:      'v2_agentes_carga',
  fabricantes:       'v2_fabricantes',
  ncms:              'v2_ncms',
  listaPrecoLcl:     'v2_lista_preco_lcl',
  despachantes:      'v2_despachantes',
  cargos:            'v2_cargos',
  niveisAcesso:      'v2_niveis_acesso',
  // Logística
  controleNavios:    'v2_controle_navios',
  navioTrajetos:     'v2_navio_trajetos',
  // Custo interno
  custos:            'v2_custos_despachante',
  custosLi:          'v2_custos_li',
  custosDespesas:    'v2_custos_despesas',
  ncmsVinculados:    'v2_ncms_vinculados',
  valoresImposto:    'v2_valores_imposto',
  // Comercial
  orcamentosVenda:   'v2_orcamentos_venda',
  orcDespesas:       'v2_orc_despesas',
  orcExtras:         'v2_orc_extras',
  // Operação
  embarques:         'v2_embarques',
  statusEmbarque:    'v2_status_embarque',
  historicoStatus:   'v2_historico_status',
  freeTimes:         'v2_free_times',
  pagamentos:        'v2_pagamentos',
  // Documentos
  tiposDocumento:    'v2_tipos_documento',
  documentos:        'v2_documentos',
  documentoVinculos: 'v2_documento_vinculos',
  // Despesas e Modelos
  despesasCadastro:     'v2_despesas_cadastro',
  modelosDespesa:       'v2_modelos_despesa',
  modelosDespesaItens:  'v2_modelos_despesa_itens',
  // Solicitação de Orçamento — Etapa 12
  solicitacoes:             'v2_solicitacoes_orcamento',
  solicitacaoDespachantes:  'v2_solicitacao_despachantes',
  solicitacaoDocumentos:    'v2_solicitacao_documentos',
  // Junction OrcamentoVenda ↔ CustoDespachante
  orcCustos:                'v2_orc_custos',
} as const;

const memoryStore = new Map<string, unknown[]>();

function isBrowserStorageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function loadFromLocalStorage<T>(key: string): T[] {
  if (!isBrowserStorageAvailable()) return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function saveToLocalStorage<T>(key: string, data: T[]): void {
  if (!isBrowserStorageAvailable()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // Ignora falhas de quota/serializacao para nao quebrar fluxo da UI.
  }
}

export function readV2<T>(key: string): T[] {
  const data = memoryStore.get(key);
  if (data) return [...(data as T[])];

  const persisted = loadFromLocalStorage<T>(key);
  memoryStore.set(key, [...persisted]);
  return [...persisted];
}

export function writeV2<T>(key: string, data: T[]): void {
  memoryStore.set(key, [...data]);
  saveToLocalStorage(key, data);
}

export function addV2<T extends { id: string }>(key: string, item: T): void {
  const items = readV2<T>(key);
  items.push(item);
  writeV2(key, items);
}

export function updateV2<T extends { id: string }>(key: string, updated: T): void {
  const items = readV2<T>(key);
  const idx = items.findIndex(i => i.id === updated.id);
  if (idx !== -1) items[idx] = updated;
  writeV2(key, items);
}

export function deleteV2<T extends { id: string }>(key: string, id: string): void {
  const items = readV2<T>(key).filter(i => i.id !== id);
  writeV2(key, items);
}

export function generateV2Id(): string {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function generateCode(prefix: string, existingCount: number): string {
  const year = new Date().getFullYear();
  const seq = String(existingCount + 1).padStart(3, '0');
  return `${prefix}-${year}-${seq}`;
}
