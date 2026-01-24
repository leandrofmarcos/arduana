export interface PacklistItem {
  codigo: string;
  descricao: string;
  quantidade: number;
  pesoKg: number;
  valorUSD: number;
  volumeM3?: number;
}

export interface PacklistSummary {
  id: string;
  cliente?: string;
  despachante?: string;
  codigo?: string;
  items: number;
}
