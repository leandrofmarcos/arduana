export type UserRole = 'admin' | 'cliente' | 'despachante' | 'maritimo';

export interface User {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  permissions: Permission[];
  createdAt?: Date;
  lastLogin?: Date;
}

export interface Credentials {
  username: string;
  password: string;
  remember?: boolean;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface AuthSession {
  user: User;
  token: AuthToken;
  issuedAt: Date;
  expiresAt: Date;
}

export type Permission = 
  | 'orcamento:read' 
  | 'orcamento:write' 
  | 'orcamento:delete'
  | 'packlist:read' 
  | 'packlist:write'
  | 'custo:read' 
  | 'custo:write'
  | 'venda:read' 
  | 'venda:write'
  | 'aduana:read' 
  | 'aduana:write'
  | 'historico:read'
  | 'clientes:read' 
  | 'clientes:write'
  | 'despachantes:read' 
  | 'despachantes:write'
  | 'portos:read' 
  | 'portos:write'
  | 'aliquotas:read' 
  | 'aliquotas:write'
  | 'admin:all';

export const ADMIN_PERMISSIONS: Permission[] = ['admin:all'];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: ADMIN_PERMISSIONS,
  cliente: [
    'orcamento:read',
    'packlist:read',
    'custo:read',
    'venda:read',
    'historico:read'
  ],
  despachante: [
    'orcamento:read',
    'orcamento:write',
    'packlist:read',
    'packlist:write',
    'custo:read',
    'custo:write',
    'aduana:read',
    'aduana:write',
    'despachantes:read'
  ],
  maritimo: [
    'orcamento:read',
    'packlist:read',
    
  ]
};
