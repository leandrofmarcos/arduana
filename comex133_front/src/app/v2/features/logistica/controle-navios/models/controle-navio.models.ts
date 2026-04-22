export interface ControleNavio {
  id: string;
  numeroViagem: string;
  nomeNavio: string;
  observacao?: string;
  ativo: boolean;
}

export interface EmbarqueResumo {
  id: string;
  codigoInterno: string;
  status: string;
  numeroViagem?: string;
  clienteNome?: string;
  containerBl?: string;
  eta?: string;
}

export interface ControleNavioTrajeto {
  id: string;
  controleNavioId: string;
  sequencia?: number;
  portoOrigemId: string;
  portoDestinoId: string;
  portoOrigemNome?: string;
  portoDestinoNome?: string;
  etd: string;            // ISO date string (YYYY-MM-DD)
  eta: string;            // ISO date string (YYYY-MM-DD)
  statusPerna?: 'Previsto' | 'EmTransito' | 'Atracado' | 'Concluido';
  trajetoDescricao?: string;
  embarques: EmbarqueResumo[];
}
