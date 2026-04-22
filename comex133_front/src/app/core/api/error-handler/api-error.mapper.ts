import { HttpErrorResponse } from '@angular/common/http';
import { ApiError, ApiResponse } from '../models/api-response.model';

export interface MappedApiError {
  code: string;
  message: string;
  status: number;
  details?: ApiError[];
  fieldErrors: Record<string, string[]>;
  isValidation: boolean;
  severity: 'error' | 'warning' | 'info';
}

/**
 * Classe para mapeamento e tratamento de erros da API
 */
export class ApiErrorMapper {
  private static readonly DEFAULT_MESSAGES: Record<number, string> = {
    400: 'Dados invalidos. Revise os campos e tente novamente.',
    401: 'Sessao expirada. Por favor, faca login novamente.',
    403: 'Voce nao tem permissao para realizar esta acao.',
    404: 'Recurso nao encontrado.',
    409: 'Conflito de dados. Atualize a tela e tente novamente.',
    422: 'Nao foi possivel processar os dados informados.',
    429: 'Limite de requisicoes atingido. Aguarde alguns instantes e tente novamente.'
  };

  /**
   * Mapeia erros HTTP para mensagens amigáveis
   */
  static mapError(error: any): MappedApiError {
    const status = this.extractStatus(error);
    const payload = this.extractPayload(error);
    const details = this.extractDetails(payload);
    const fieldErrors = this.groupFieldErrors(details);
    const hasValidation = (status === 400 || status === 422) && details.length > 0;

    // Erro de conexão
    if (status === 0) {
      return {
        code: 'CONNECTION_ERROR',
        status,
        message: 'Falha de conexao com o servidor. Verifique sua internet e tente novamente.',
        details,
        fieldErrors,
        isValidation: false,
        severity: 'error'
      };
    }

    if (hasValidation) {
      const validationMessage = this.buildValidationMessage(payload, fieldErrors);
      return {
        code: 'VALIDATION_ERROR',
        status,
        message: validationMessage,
        details,
        fieldErrors,
        isValidation: true,
        severity: 'warning'
      };
    }

    if (status >= 500) {
      return {
        code: 'SERVER_ERROR',
        status,
        message: 'Erro no servidor. Tente novamente em instantes.',
        details,
        fieldErrors,
        isValidation: false,
        severity: 'error'
      };
    }

    if (status === 409) {
      return {
        code: 'CONFLICT',
        status,
        message: this.extractMessage(payload) || this.DEFAULT_MESSAGES[409],
        details,
        fieldErrors,
        isValidation: false,
        severity: 'warning'
      };
    }

    if (status === 429) {
      return {
        code: 'TOO_MANY_REQUESTS',
        status,
        message: this.extractMessage(payload) || this.DEFAULT_MESSAGES[429],
        details,
        fieldErrors,
        isValidation: false,
        severity: 'warning'
      };
    }

    if (status === 401) {
      return {
        code: 'UNAUTHORIZED',
        status,
        message: this.DEFAULT_MESSAGES[401],
        details,
        fieldErrors,
        isValidation: false,
        severity: 'info'
      };
    }

    if (status === 403) {
      return {
        code: 'FORBIDDEN',
        status,
        message: this.extractMessage(payload) || this.DEFAULT_MESSAGES[403],
        details,
        fieldErrors,
        isValidation: false,
        severity: 'error'
      };
    }

    if (status === 404) {
      return {
        code: 'NOT_FOUND',
        status,
        message: this.extractMessage(payload) || this.DEFAULT_MESSAGES[404],
        details,
        fieldErrors,
        isValidation: false,
        severity: 'warning'
      };
    }

    const fallbackMessage =
      this.extractMessage(payload)
      || (this.DEFAULT_MESSAGES[status] ?? 'Ocorreu um erro inesperado.');

    return {
      code: 'UNKNOWN_ERROR',
      status,
      message: fallbackMessage,
      details,
      fieldErrors,
      isValidation: false,
      severity: 'error'
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
      status: mappedError.status,
      code: mappedError.code,
      message: mappedError.message,
      payload: sanitizedPayload,
      details: mappedError.details,
      fieldErrors: mappedError.fieldErrors
    };

    // Envia para console em desenvolvimento
    console.error('[API Error]', logEntry);

    // TODO: Integrar com serviço de logging centralizado (AppInsights, etc)
  }

  private static extractStatus(error: any): number {
    if (typeof error?.status === 'number') {
      return error.status;
    }
    if (typeof error?.statusCode === 'number') {
      return error.statusCode;
    }
    if (typeof error?.error?.statusCode === 'number') {
      return error.error.statusCode;
    }
    return -1;
  }

  private static extractPayload(error: any): ApiResponse<any> | any {
    if (error instanceof HttpErrorResponse) {
      return error.error;
    }
    return error?.error ?? error;
  }

  private static extractMessage(payload: any): string {
    if (!payload) return '';
    if (typeof payload === 'string') return payload;
    return (
      payload.message
      || payload.title
      || payload.detail
      || payload.error_description
      || payload.error
      || ''
    );
  }

  private static extractDetails(payload: any): ApiError[] {
    if (!payload) {
      return [];
    }

    if (Array.isArray(payload?.errors)) {
      return payload.errors
        .filter((item: any) => !!item)
        .map((item: any) => ({
          field: item.field || item.path || item.propertyName,
          code: item.code || item.errorCode || 'VALIDATION_ERROR',
          message: item.message || item.errorMessage || item.description || 'Valor invalido.'
        }));
    }

    if (payload?.errors && typeof payload.errors === 'object') {
      const details: ApiError[] = [];
      Object.entries(payload.errors).forEach(([field, raw]) => {
        const values = Array.isArray(raw) ? raw : [raw];
        values.forEach((value) => {
          if (!value) return;
          details.push({
            field,
            code: 'VALIDATION_ERROR',
            message: String(value)
          });
        });
      });
      return details;
    }

    return [];
  }

  private static groupFieldErrors(details: ApiError[]): Record<string, string[]> {
    const fieldErrors: Record<string, string[]> = {};
    details.forEach((detail) => {
      if (!detail.field) return;
      const key = detail.field.toLowerCase();
      if (!fieldErrors[key]) {
        fieldErrors[key] = [];
      }
      if (!fieldErrors[key].includes(detail.message)) {
        fieldErrors[key].push(detail.message);
      }
    });
    return fieldErrors;
  }

  private static buildValidationMessage(
    payload: any,
    fieldErrors: Record<string, string[]>
  ): string {
    const baseMessage = this.extractMessage(payload)
      || this.DEFAULT_MESSAGES[400];
    const fields = Object.keys(fieldErrors);
    if (!fields.length) {
      return baseMessage;
    }
    const preview = fields.slice(0, 3).join(', ');
    const suffix = fields.length > 3 ? ` e mais ${fields.length - 3}` : '';
    return `${baseMessage} Campos: ${preview}${suffix}.`;
  }
}
