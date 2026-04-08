export type CategoriaDespesa =
  | 'Agência Marítima'
  | 'Despachante'
  | 'Tributos'
  | 'Portos'
  | 'Outras Despesas';

export const CATEGORIAS_DESPESA: CategoriaDespesa[] = [
  'Agência Marítima',
  'Despachante',
  'Tributos',
  'Portos',
  'Outras Despesas',
];

export interface DespesaCadastro {
  id: string;
  descricao: string;
  valor: number;
  categoria: CategoriaDespesa;
  ativo: boolean;
}
