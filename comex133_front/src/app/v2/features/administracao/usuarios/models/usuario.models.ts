export interface Usuario {
  id: string;
  email: string;
  nomeCompleto: string;
  ativo: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
  ultimoLoginEm?: string;
  roles: string[];
}

export interface CreateUsuarioInput {
  email: string;
  nomeCompleto: string;
  senha: string;
  roleIds?: string[];
}
