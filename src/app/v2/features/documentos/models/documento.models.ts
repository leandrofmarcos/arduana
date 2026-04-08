export type CategoriaDocumento = 'Embarque' | 'Fiscal' | 'Aduana' | 'Contrato' | 'Outro';

export interface TipoDocumento {
  id: string;
  nome: string;
  codigo: string;
  categoria: CategoriaDocumento;
  ativo: boolean;
}

export interface Documento {
  id: string;
  tipoDocumentoId: string;
  usuarioUploadId: string;
  nomeOriginal: string;
  nomeSalvo: string;
  caminhoArquivo: string; // base64 data URL
  extensao: string;
  contentType: string;
  tamanhoBytes: number;
  dataUpload: string; // ISO string
  observacao?: string;
}

export interface DocumentoVinculo {
  id: string;
  documentoId: string;
  entidade: string;   // 'EmbarqueAduana' | 'OrcamentoVenda' | etc.
  entidadeId: string;
  papel?: string;
  dataVinculo: string; // ISO string
}

export interface DocumentoComVinculo extends Documento {
  vinculoId: string;
  tipoDocumentoNome: string;
  tipoDocumentoCodigo: string;
  tipoDocumentoCategoria: CategoriaDocumento;
}
