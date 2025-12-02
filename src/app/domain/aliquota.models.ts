export interface AliquotaPerfil {
  id: string;
  nome: string;
  descricao?: string;
  ii: number;
  ipi: number;
  icms: number;
  pis: number;
  cofins: number;
  padrao: boolean;
}