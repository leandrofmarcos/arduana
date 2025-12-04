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
  fcl: 'FCL'|'LCL';
  incoterm: 'FOB'|'CIF'|'EXW';
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

export type CategoriaDespesa = 'Agência Marítima' | 'Despachante' | 'Tributos' | 'Porto' | 'Outros';

export interface Despesa {
  id: string;
  categoria: CategoriaDespesa;
  item: string;
  fornecedor?: string;
  valor: number;
  observacao?: string;
}

import { NumerarioLancamento } from './numerario.models';

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
  numerario?: NumerarioLancamento[];
}