export interface Premissas {
  fobUsd: number;
  freteUsd: number;
  seguroUsd: number;
  thcUsd: number;
  taxaUsd: number;
  quantidade: number;
  ncm: string;
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