export interface ModeloDespesa {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export interface ModeloDespesaItem {
  id: string;
  modeloDespesaId: string;
  despesaCadastroId: string;
}
