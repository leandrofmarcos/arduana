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
import { ToastService } from '../../services/toast.service';
import { ConfirmDialogService } from '../../services/confirm-dialog.service';
import { Router } from '@angular/router';

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
  private readonly lastDialogByStatus = new Map<number, number>();
  private dialogOpen = false;
  private readonly dialogCooldownMs = 2500;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toast: ToastService,
    private confirmDialog: ConfirmDialogService,
    private router: Router
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
   * Upload multipart/form-data — não define Content-Type; o browser injeta o boundary correto.
   */
  uploadFile<T>(endpoint: string, formData: FormData): Observable<T> {
    const url = this.buildUrl(endpoint);
    const token = this.authService.getAccessToken();
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
    return this.http.post<ApiResponse<T>>(url, formData, { headers }).pipe(
      map(response => this.unwrapResponse<T>(response)),
      catchError(error => this.handleError(endpoint, error))
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

    this.notifyError(mappedError);

    // Log sanitizado
    ApiErrorMapper.logError(
      endpoint,
      error,
      this.sanitizePayload(payload)
    );

    // Retorna erro traduzido para consumidor
    return throwError(() => ({
      code: mappedError.code,
      status: mappedError.status,
      message: mappedError.message,
      details: mappedError.details,
      fieldErrors: mappedError.fieldErrors,
      isValidation: mappedError.isValidation,
      originalError: error
    }));
  }

  private notifyError(mappedError: ReturnType<typeof ApiErrorMapper.mapError>): void {
    if (!mappedError.message) {
      return;
    }

    // 403 é comportamento esperado em sistema RBAC — sem toast; componentes tratam inline
    if (mappedError.status === 403) {
      return;
    }

    if (this.shouldOpenInteractiveDialog(mappedError.status)) {
      void this.openStatusDialog(mappedError.status, mappedError.message);
      return;
    }

    if (mappedError.severity === 'warning') {
      this.toast.warning(mappedError.message);
      return;
    }

    if (mappedError.severity === 'info') {
      this.toast.info(mappedError.message);
      return;
    }

    this.toast.error(mappedError.message);
  }

  private shouldOpenInteractiveDialog(status: number): boolean {
    return status === 401 || status === 409 || status === 429 || status === 500 || status === 502 || status === 503;
  }

  private canOpenDialog(status: number): boolean {
    if (this.dialogOpen) {
      return false;
    }

    const now = Date.now();
    const last = this.lastDialogByStatus.get(status) ?? 0;
    if (now - last < this.dialogCooldownMs) {
      return false;
    }

    this.lastDialogByStatus.set(status, now);
    return true;
  }

  private async openStatusDialog(status: number, message: string): Promise<void> {
    if (!this.canOpenDialog(status)) {
      return;
    }

    this.dialogOpen = true;

    try {
      if (status === 401) {
        const shouldLogin = await this.confirmDialog.confirm({
          title: 'Sessao expirada',
          message: `${message}\n\nDeseja ir para a tela de login agora?`,
          confirmText: 'Fazer login',
          cancelText: 'Cancelar',
          danger: false
        });

        if (shouldLogin) {
          this.authService.logout().subscribe({
            complete: () => {
              void this.router.navigate(['/login']);
            }
          });
        }
        return;
      }

      if (status === 409) {
        const shouldReload = await this.confirmDialog.confirm({
          title: 'Conflito de atualizacao',
          message: `${message}\n\nDeseja recarregar os dados para sincronizar a tela?`,
          confirmText: 'Recarregar dados',
          cancelText: 'Manter edicao',
          danger: false
        });

        if (shouldReload) {
          this.safeReload();
        }
        return;
      }

      if (status === 429) {
        const shouldRetry = await this.confirmDialog.confirm({
          title: 'Muitas requisicoes',
          message: `${message}\n\nDeseja atualizar a tela para tentar novamente?`,
          confirmText: 'Tentar novamente',
          cancelText: 'Fechar',
          danger: false
        });

        if (shouldRetry) {
          this.safeReload();
        }
        return;
      }

      const shouldRetry = await this.confirmDialog.confirm({
        title: 'Instabilidade temporaria',
        message: `${message}\n\nDeseja tentar novamente agora?`,
        confirmText: 'Tentar novamente',
        cancelText: 'Cancelar',
        danger: false
      });

      if (shouldRetry) {
        this.safeReload();
      }
    } finally {
      this.dialogOpen = false;
    }
  }

  private safeReload(): void {
    if (typeof window !== 'undefined' && window.location) {
      window.location.reload();
    }
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
