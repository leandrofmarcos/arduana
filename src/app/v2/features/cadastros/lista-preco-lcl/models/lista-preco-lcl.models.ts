export interface ListaPrecoLcl {
  id: string;
  categoria: string;
  descricao: string;
  nomeChines?: string;
  precoUsdPorCbm: number;
  precoUsdPorKg: number;
  dataVigencia: string;   // ISO date string
  ativo: boolean;
}
