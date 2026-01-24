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

export interface PlanilhaVenda {
  premissas: Premissas;
  taxas: Taxas;
}
