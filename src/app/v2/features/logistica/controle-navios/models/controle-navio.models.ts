export interface ControleNavio {
  id: string;
  numeroViagem: string;
  nomeNavio: string;
  observacao?: string;
  ativo: boolean;
}

export interface ControleNavioTrajeto {
  id: string;
  controleNavioId: string;
  portoOrigemId: string;
  portoDestinoId: string;
  etd: string;            // ISO date string (YYYY-MM-DD)
  eta: string;            // ISO date string (YYYY-MM-DD)
  trajetoDescricao?: string;
}
