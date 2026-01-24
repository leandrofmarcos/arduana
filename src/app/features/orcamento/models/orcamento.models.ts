export type Fase = 'Orcamento' | 'Aduana' | 'Numerario' | 'Fechamento';

export interface OrcamentoMeta {
  id: string;
  title?: string;
  faseAtual: Fase;
  aprovado?: boolean;
  aprovadoCliente?: boolean;
  oficializado?: boolean;
  numerarioPago?: boolean;
  fechado?: boolean;
  createdAt: string;
  clienteId?: string;
  despachanteId?: string;
}

export interface OrcamentoListItem {
  id: string;
  cliente?: string;
  despachante?: string;
  clienteId?: string;
  despachanteId?: string;
  codigo?: string;
  data: string;
  status: 'CRIADO' | 'Orçamento' | 'Em aprovação' | 'Aprovado' | 'Reprovado' | 'Aduana' | 'Numerário' | 'Fechamento' | 'Fechado';
}

export interface PacklistItem {
  codigo: string;
  descricao: string;
  quantidade: number;
  pesoKg: number;
  valorUSD: number;
  volumeM3?: number;
}

export interface PacklistSummary {
  id: string;
  cliente?: string;
  despachante?: string;
  codigo?: string;
  items: number;
}

export interface CustoListItem {
  id: string;
  orcamentoId: string;
  codigo?: string;
  cliente?: string;
  despachante?: string;
  createdAt: string;
}

export type CategoriaDespesa = 'Agência Marítima' | 'Despachante' | 'Tributos' | 'Porto' | 'Outros';

export interface Despesa {
  id: string;
  categoria: CategoriaDespesa;
  item: string;
  fornecedor?: string;
  valor: number;
  observacao?: string;
}

export interface Premissas {
  fobUsd: number;
  freteUsd: number;
  seguroUsd: number;
  thcUsd: number;
  taxaUsd: number;
  quantidade: number;
  ncm: string;
  taxaEur: number;
  pesoLiquido: number;
  quantProdutos: number;
  unidMedida: string;
  estatistica: string;
  volume: number;
  fcl: 'FCL' | 'LCL';
  incoterm: 'FOB' | 'CIF' | 'EXW';
  precoPeca: number;
  porto: string;
  beneficioFiscal: number;
}

export interface Taxas {
  ii: number;
  ipi: number;
  icms: number;
  pis: number;
  cofins: number;
}

export interface PlanilhaSnapshot {
  premissas: Premissas;
  taxas: Taxas;
  despesas: Despesa[];
  totalDespesas: number;
  resumo: {
    tributos: number;
    desembolsoDesembaraco: number;
    desembolsoTotal: number;
  };
  nfSaida?: {
    cfop: string;
    cst: string;
    baseIcms: number;
    icms: number;
  };
}
