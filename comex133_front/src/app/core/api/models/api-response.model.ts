/**
 * Envelope padrão de resposta da API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiError[];
  timestamp?: string;
}

/**
 * Detalhe de erro da API
 */
export interface ApiError {
  field?: string;
  code: string;
  message: string;
}

/**
 * Resposta paginada
 */
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Query params para paginação
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  search?: string;
}
