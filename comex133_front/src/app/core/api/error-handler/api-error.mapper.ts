import { HttpErrorResponse } from '@angular/common/http';
import { ApiError, ApiResponse } from '../models/api-response.model';

/**
 * Classe para mapeamento e tratamento de erros da API
 */
export class ApiErrorMapper {
  /**
   * Mapeia erros HTTP para mensagens amigáveis
   */
  static mapError(error: any): { code: string; message: string; details?: ApiError[] } {
    // Erro de conexão
    if (error.status === 0) {
      return {
        code: 'CONNECTION_ERROR',
        message: 'Falha de conexão com o servidor. Verifique sua conexão de internet.'
      };
    }

    // Erro 400 — Validação
    if (error.status === 400) {
      const apiResponse: ApiResponse<any> = error.error;
      if (apiResponse?.errors && Array.isArray(apiResponse.errors)) {
        return {
          code: 'VALIDATION_ERROR',
          message: apiResponse.message || 'Dados inválidos. Verifique os campos destacados.',
          details: apiResponse.errors
        };
      }
      return {
        code: 'BAD_REQUEST',
        message: apiResponse?.message || 'Requisição inválida.'
      };
    }

    // Erro 401 — Não autenticado
    if (error.status === 401) {
      return {
        code: 'UNAUTHORIZED',
        message: 'Sessão expirada. Por favor, faça login novamente.'
      };
    }

    // Erro 403 — Não autorizado
    if (error.status === 403) {
      return {
        code: 'FORBIDDEN',
        message: 'Você não tem permissão para realizar esta ação.'
      };
    }

    // Erro 404 — Não encontrado
    if (error.status === 404) {
      return {
        code: 'NOT_FOUND',
        message: 'Recurso não encontrado.'
      };
    }

    // Erro 422 — Entidade não processável
    if (error.status === 422) {
      const apiResponse: ApiResponse<any> = error.error;
      if (apiResponse?.errors && Array.isArray(apiResponse.errors)) {
        return {
          code: 'VALIDATION_ERROR',
          message: apiResponse.message || 'Dados inválidos para esta operação.',
          details: apiResponse.errors
        };
      }
      return {
        code: 'UNPROCESSABLE_ENTITY',
        message: apiResponse?.message || 'Não foi possível processar os dados.'
      };
    }

    // Erro 500+ — Servidor
    if (error.status >= 500) {
      return {
        code: 'SERVER_ERROR',
        message: 'Erro no servidor. Por favor, tente novamente mais tarde.'
      };
    }

    // Erro genérico
    return {
      code: 'UNKNOWN_ERROR',
      message: error.error?.message || 'Ocorreu um erro inesperado.'
    };
  }

  /**
   * Log sanitizado de erro para observabilidade
   */
  static logError(
    endpoint: string,
    error: any,
    sanitizedPayload?: any
  ): void {
    const mappedError = this.mapError(error);
    const logEntry = {
      timestamp: new Date().toISOString(),
      endpoint,
      status: error.status,
      code: mappedError.code,
      message: mappedError.message,
      payload: sanitizedPayload,
      details: mappedError.details
    };

    // Envia para console em desenvolvimento
    console.error('[API Error]', logEntry);

    // TODO: Integrar com serviço de logging centralizado (AppInsights, etc)
  }
}
