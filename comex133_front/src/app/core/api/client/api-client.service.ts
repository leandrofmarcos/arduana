import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse, PagedResult, PaginationParams } from '../models/api-response.model';
import { ApiErrorMapper } from '../error-handler/api-error.mapper';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../features/auth/services/auth.service';

/**
 * Serviço centralizado para todas as chamadas HTTP da aplicação
 * Responsável por:
 * - Normalizar envelopes de resposta
 * - Adicionar headers comuns (Content-Type, Authorization)
 * - Tratar erros de forma padronizada
 * - Log de requisições e erros
 */
@Injectable({
  providedIn: 'root'
})
export class ApiClientService {
  private readonly baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * GET genérico com tratamento de envelope
   */
  get<T>(endpoint: string, options?: { params?: PaginationParams | any }): Observable<T> {
    const url = this.buildUrl(endpoint);
    const params = this.buildHttpParams(options?.params);
    const headers = this.buildAuthHeaders();

    return this.http.get<ApiResponse<T>>(url, { params, headers }).pipe(
      map(response => this.unwrapResponse<T>(response)),
      catchError(error => this.handleError(endpoint, error))
    );
  }

  /**
   * GET de lista paginada
   */
  getList<T>(endpoint: string, pagination?: PaginationParams): Observable<PagedResult<T>> {
    const url = this.buildUrl(endpoint);
    const params = this.buildHttpParams(pagination);
    const headers = this.buildAuthHeaders();

    return this.http.get<ApiResponse<PagedResult<T>>>(url, { params, headers }).pipe(
      map(response => this.unwrapResponse<PagedResult<T>>(response)),
      catchError(error => this.handleError(endpoint, error))
    );
  }

  /**
   * POST com corpo JSON
   */
  post<T>(endpoint: string, payload: any): Observable<T> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildAuthHeaders();

    return this.http.post<ApiResponse<T>>(url, payload, { headers }).pipe(
      map(response => this.unwrapResponse<T>(response)),
      catchError(error => this.handleError(endpoint, error, payload))
    );
  }

  /**
   * PUT completo (substitui recurso)
   */
  put<T>(endpoint: string, payload: any): Observable<T> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildAuthHeaders();

    return this.http.put<ApiResponse<T>>(url, payload, { headers }).pipe(
      map(response => this.unwrapResponse<T>(response)),
      catchError(error => this.handleError(endpoint, error, payload))
    );
  }

  /**
   * PATCH parcial (atualiza apenas campos fornecidos)
   */
  patch<T>(endpoint: string, payload: any): Observable<T> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildAuthHeaders();

    return this.http.patch<ApiResponse<T>>(url, payload, { headers }).pipe(
      map(response => this.unwrapResponse<T>(response)),
      catchError(error => this.handleError(endpoint, error, payload))
    );
  }

  /**
   * DELETE
   */
  delete<T = void>(endpoint: string): Observable<T> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildAuthHeaders();

    return this.http.delete<ApiResponse<T>>(url, { headers }).pipe(
      map(response => this.unwrapResponse<T>(response)),
      catchError(error => this.handleError(endpoint, error))
    );
  }

  private buildAuthHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  /**
   * Construir URL completa
   */
  private buildUrl(endpoint: string): string {
    // Remove "/" inicial se existir para evitar duplicação
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseUrl}/${normalizedEndpoint}`;
  }

  /**
   * Construir HttpParams a partir de um objeto
   */
  private buildHttpParams(params?: any): HttpParams {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        // Ignora valores undefined e null
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return httpParams;
  }

  /**
   * Desembrulha o envelope de resposta
   */
  private unwrapResponse<T>(response: ApiResponse<T>): T {
    if (!response) {
      throw new Error('Resposta vazia da API');
    }

    // Se a API retorna sucesso: true, retorna os dados
    if (response.success && response.data !== undefined) {
      return response.data;
    }

    // Se não tem sucesso mas tem mensagem, lança erro
    if (!response.success) {
      const error = new Error(response.message || 'Erro na API');
      throw error;
    }

    return response.data as T;
  }

  /**
   * Tratamento centralizado de erros
   */
  private handleError(
    endpoint: string,
    error: HttpErrorResponse,
    payload?: any
  ): Observable<never> {
    const mappedError = ApiErrorMapper.mapError(error);

    // Log sanitizado
    ApiErrorMapper.logError(
      endpoint,
      error,
      this.sanitizePayload(payload)
    );

    // Retorna erro traduzido para consumidor
    return throwError(() => ({
      code: mappedError.code,
      message: mappedError.message,
      details: mappedError.details,
      originalError: error
    }));
  }

  /**
   * Sanitizar payload para log (remove dados sensíveis)
   */
  private sanitizePayload(payload: any): any {
    if (!payload) return undefined;

    const sanitized = { ...payload };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];

    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '***';
      }
    });

    return sanitized;
  }
}
