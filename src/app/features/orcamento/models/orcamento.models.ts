export type Fase = 'Orcamento' | 'Aduana';

export interface OrcamentoMeta {
  id: string;
  title?: string;
  faseAtual: Fase;
  aprovado?: boolean;
  aprovadoCliente?: boolean;
  oficializado?: boolean;
  createdAt: string;
  clienteId?: string;
  despachanteId?: string;
  templatePacklistId?: string;
}

export interface OrcamentoListItem {
  id: string;
  cliente?: string;
  despachante?: string;
  clienteId?: string;
  despachanteId?: string;
  templatePacklistId?: string;
  codigo?: string;
  data: string;
  status: 'CRIADO' | 'Orçamento' | 'Em aprovação' | 'Aprovado' | 'Reprovado' | 'Aduana';
}

