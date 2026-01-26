export type PacklistStatus = 'concluido' | 'em-andamento' | 'pendente';

export interface PacklistItem {
  codigo: string;
  descricao: string;
  quantidade: number;
  pesoKg: number;
  valorUSD: number;
  volumeM3?: number;
}

export interface PacklistFileInfo {
  arquivoNome: string;
  arquivoCaminho: string;
  enviadoEm: string;
  enviadoPor?: string;
  status: PacklistStatus;
}

export interface PacklistRecord extends PacklistFileInfo {
  id: string;             // packlist identifier (mirrors orçamento id)
  orcamentoId: string;    // referência do orçamento
  codigo?: string;
  cliente?: string;
  despachante?: string;
  itens?: PacklistItem[];
  previewItems?: any[];   // items no formato importado para reexibir preview
  mappingConfig?: any;    // configuração usada na importação
}

export interface PacklistSummary {
  id: string;
  orcamentoId: string;
  cliente?: string;
  despachante?: string;
  codigo?: string;
  status: PacklistStatus;
  enviadoEm: string;
  arquivoNome?: string;
  arquivoCaminho?: string;
  items: number;
}
