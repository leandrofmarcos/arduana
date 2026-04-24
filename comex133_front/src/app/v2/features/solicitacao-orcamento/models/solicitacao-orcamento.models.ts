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
