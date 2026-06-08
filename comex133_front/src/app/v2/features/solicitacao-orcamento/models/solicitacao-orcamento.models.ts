export type StatusSolicitacao =
  | 'AguardandoDespachante'
  | 'AguardandoReabertura'
  | 'AguardandoOrcamentoVenda'
  | 'AguardandoAprovacaoCliente'
  | 'Aprovada'
  | 'Cancelada';
export interface SolicitacaoOrcamento {
  id: string;
  codigoInterno: string;          // SOL-AAAA-NNN
  clienteId?: string;
  importadorId?: string;
  portoOrigemId: string;
  portoDestinoId: string;
  responsavel: string;            // nome livre (mesmo padrão de CustoDespachante)
  tamContainer: '20' | '40' | 'LCL';
  peso: number;
  observacao?: string;
  status: StatusSolicitacao;
  data: string;                   // ISO YYYY-MM-DD
}

export interface SolicitacaoOrcamentoDespachante {
  id: string;
  solicitacaoOrcamentoId: string;
  despachanteId: string;
  dataEnvio: string;              // ISO YYYY-MM-DD
}

export interface SolicitacaoOrcamentoDocumento {
  id: string;
  solicitacaoOrcamentoId: string;
  nomeArquivo: string;
  linkDocumento: string;          // URL ou referência ao storage
  dataUpload: string;             // ISO YYYY-MM-DD
  observacao?: string;
}

// ── Packlist ──────────────────────────────────────────────────────────────────

export interface PacklistArquivoParsed {
  nomeArquivo: string;
  extensao: 'csv' | 'xlsx';
  colunas: string[];
  linhas: Record<string, any>[];
  temCelulasMescladas: boolean;
}

export interface PacklistMapeamento {
  colunaNCM?: string;
  colunaDescricao?: string;
  colunaPreco?: string;
}

export interface PacklistItem {
  id: string;
  numeroLinha: number;
  dadosOriginais: Record<string, any>;
  ncm?: string;
  descricao?: string;
  preco?: number;
}

export interface PacklistUploadResult {
  solicitacaoOrcamentoId: string;
  nomeArquivoOriginal: string;
  mapeamento: PacklistMapeamento;
  itens: PacklistItem[];
  totalLinhas: number;
  dataUpload: string;
  arquivoBlob?: Blob;
  temCelulasMescladas?: boolean;
}

// ── API DTOs (retornados pelo backend) ────────────────────────────────────────

export interface PacklistDto {
  id: number;
  solicitacaoOrcamentoId: number;
  nomeArquivo: string;
  extensaoArquivo: string;
  totalLinhas: number;
  colunaNCM: string | null;
  colunaDescricao: string | null;
  colunaPreco: string | null;
  temCelulasMescladas: boolean;
  dataUpload: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface PacklistItemDto {
  id: number;
  numeroLinha: number;
  dadosJson: string;
  ncm: string | null;
  descricao: string | null;
  preco: number | null;
}

export interface UploadPacklistApiResponse {
  packlistId: number;
  nomeArquivo: string;
  temCelulasMescladas: boolean;
  colunas: string[];
  totalLinhas: number;
}

export interface PendingPacklist {
  blob: Blob;
  nomeArquivo: string;
  colunaNCM: string | null;
  colunaDescricao: string | null;
  colunaPreco: string | null;
  temCelulasMescladas: boolean;
  totalLinhas: number;
}
