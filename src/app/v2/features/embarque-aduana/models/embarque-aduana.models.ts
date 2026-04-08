export type StatusEmbarqueNome =
  | 'Previsto' | 'Aguardando' | 'Atracado'
  | 'Registrado' | 'Desembaraçado' | 'Entregue' | 'Finalizado';

export type TipoPagamento =
  | 'CobrancaSinal' | 'SinalPago' | 'FechamentoPago' | 'Honorario' | 'Outro';

export const TIPO_PAGAMENTO_LABELS: Record<TipoPagamento, string> = {
  CobrancaSinal:   'Cobrança Sinal',
  SinalPago:       'Sinal Pago',
  FechamentoPago:  'Fechamento Pago',
  Honorario:       'Honorário',
  Outro:           'Outro',
};

export interface StatusEmbarque {
  id: string;
  nome: StatusEmbarqueNome;
  codigo: string;   // 'PREV', 'AGRD', 'ATRC', 'RGTD', 'DSMB', 'ENTG', 'FNLZ'
  ordem: number;
  ativo: boolean;
}

export interface EmbarqueAduana {
  id: string;
  codigoInterno: string;        // EMB-AAAA-NNN
  refOminium: string;
  portoOrigemId: string;
  portoDestinoId: string;
  agenteCargaId: string;
  clienteId: string;
  usuarioResponsavelId: string;
  controleNavioId: string;
  despachanteId: string;
  exportadorId?: string;
  statusEmbarqueId: string;     // status ATUAL
  custoDespachanteId?: string;
  orcamentoVendaId?: string;
  imp: string;
  bl: string;
  container: string;
  kg: number;
  etd: string;                  // ISO date YYYY-MM-DD
  eta: string;
  avisoPrevisao?: string;
  avisoChegada?: string;
  dataRegistro?: string;
  desemb?: string;
  entrega?: string;
  li: string;
  registro?: string;
  refAg?: string;
  observacao?: string;
}

export interface HistoricoStatusEmbarque {
  id: string;
  embarqueAduanaId: string;
  statusEmbarqueId: string;
  dataStatus: string;           // ISO datetime
  observacao?: string;
  usuarioId: string;
}

export interface FreeTimeEmbarque {
  id: string;
  embarqueAduanaId: string;
  quantidadeDias: number;
  dataInicio: string;           // ISO date
  dataFim: string;              // dataInicio + quantidadeDias
  observacao?: string;
}

export interface PagamentoProcesso {
  id: string;
  embarqueAduanaId: string;
  tipoPagamento: TipoPagamento;
  dataPrevista: string;         // ISO date
  dataPagamento?: string;       // preenchido quando efetivado
  valor: number;
  despachanteId: string;
  observacao?: string;
}
