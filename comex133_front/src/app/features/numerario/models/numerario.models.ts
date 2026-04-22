export interface NumerarioItem {
  id: string;
  orcamentoId: string;
  tipo: string;
  valor: number;
  status?: string;
  createdAt?: string;
}

export interface NumerarioLancamento {
  id: string;
  numerarioId: string;
  descricao: string;
  valor: number;
  data: string;
}

export interface NumerarioStatus {
  pago: boolean;
  dataLancamento?: string;
}
