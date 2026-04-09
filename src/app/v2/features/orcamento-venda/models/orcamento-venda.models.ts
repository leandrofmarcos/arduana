export interface OrcamentoVenda {
  id: string;
  codigoInterno: string;          // OV-AAAA-NNN
  clienteId: string;
  custoDespachanteId?: string;    // mantido por retrocompatibilidade (seed antigo)
  data: string;                   // ISO YYYY-MM-DD
  tamContainer: string;
  pesoBruto: number;
  pesoLiquido: number;
  freteInternacional: number;
  cifReais: number;
  cifUsd: number;
  fobReais: number;
  fobUsd: number;
  taxaUsd: number;
  honorarios: number;
  totalImpostos: number;
  totalDespesas: number;
  totalExtras: number;
  totalGeral: number;
  observacao?: string;
}

export interface OrcamentoVendaDespesa {
  id: string;
  orcamentoVendaId: string;
  descricao: string;
  valor: number;
}

export interface OrcamentoVendaDespesaExtra {
  id: string;
  orcamentoVendaId: string;
  descricao: string;
  valor: number;
}

export interface OrcamentoVendaCusto {
  id: string;
  orcamentoVendaId: string;
  custoDespachanteId: string;
}
