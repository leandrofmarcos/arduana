export type CategoriaDespesa = 'Agência Marítima' | 'Despachante' | 'Tributos' | 'Porto' | 'Outros';

export interface Despesa {
  id: string;
  categoria: CategoriaDespesa;
  item: string;
  fornecedor?: string;
  valor: number;
  observacao?: string;
}

export interface CustoListItem {
  id: string;
  orcamentoId: string;
  codigo?: string;
  cliente?: string;
  despachante?: string;
  createdAt: string;
}
