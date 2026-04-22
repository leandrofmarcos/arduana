export type Fase = 'Orcamento' | 'Aduana';
export type TipoOrcamento = 'Aereo' | 'Maritimo';

export interface OrcamentoMeta {
  id: string;
  title?: string;
  faseAtual: Fase;
  tipoOrcamento: TipoOrcamento;
  aprovado?: boolean;
  aprovadoCliente?: boolean;
  oficializado?: boolean;
  createdAt: string;
  clienteId?: string;
  despachanteId?: string;
  portoDestinoId?: string;
  funcionarioId?: string;
  templatePacklistId?: string;
  dataSaida?: string;
  dataChegada?: string;
  descricao?: string;
  tipoImportacao?: string;
}

export interface OrcamentoListItem {
  id: string;
  cliente?: string;
  despachante?: string;
  portoDestino?: string;
  funcionario?: string;
  clienteId?: string;
  despachanteId?: string;
  portoDestinoId?: string;
  funcionarioId?: string;
  templatePacklistId?: string;
  dataSaida?: string;
  dataChegada?: string;
  descricao?: string;
  tipoImportacao?: string;
  tipoOrcamento: TipoOrcamento;
  codigo?: string;
  data: string;
  status: 'CRIADO' | 'Orçamento' | 'Em aprovação' | 'Aprovado' | 'Reprovado' | 'Aduana';
}

