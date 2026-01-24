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

