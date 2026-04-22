import { Injectable } from '@angular/core';
import { ApiClientService } from '../../../../core/api/client/api-client.service';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface EmbarqueNavioVinculoDto {
  id: number;
  embarqueAduanaId: number;
  navioId: number;
  nomeNavio: string;
  navioTrajetoId?: number;
  numeroViagem?: string;
  ativo: boolean;
  vinculadoEm: string;
  desvinculadoEm?: string;
  observacao?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface CreateEmbarqueNavioVinculoRequest {
  navioId: number;
  navioTrajetoId?: number;
  numeroViagem?: string;
  observacao?: string;
}

export interface UpdateEmbarqueNavioVinculoRequest {
  navioTrajetoId?: number;
  numeroViagem?: string;
  observacao?: string;
}

export interface NavioTrajetoListItem {
  id: number;
  numeroViagem: string;
  sequencia: number;
  portoOrigemNome: string;
  portoDestinoNome: string;
  etd: string;
  eta: string;
  statusPerna: string;
}

@Injectable({ providedIn: 'root' })
export class EmbarqueNavioVinculoService {
  private vinculoCache$ = new BehaviorSubject<EmbarqueNavioVinculoDto | null>(null);

  constructor(private apiClient: ApiClientService) {}

  /**
   * Get active vinculo for embarque
   */
  getVinculo(embarqueId: string | number): Observable<EmbarqueNavioVinculoDto | null> {
    const id = this.toApiId(embarqueId);
    if (id === null) {
      return throwError(() => ({ message: `ID de embarque inválido para API: ${String(embarqueId)}` }));
    }
    return this.apiClient.get<EmbarqueNavioVinculoDto>(`/embarques/${id}/navio-vinculo`).pipe(
      tap((v: any) => this.vinculoCache$.next(v as EmbarqueNavioVinculoDto)),
      map(() => this.vinculoCache$.value)
    );
  }

  /**
   * Create new vinculo
   */
  createVinculo(embarqueId: string | number, request: CreateEmbarqueNavioVinculoRequest): Observable<EmbarqueNavioVinculoDto> {
    const id = this.toApiId(embarqueId);
    if (id === null) {
      return throwError(() => ({ message: `ID de embarque inválido para API: ${String(embarqueId)}` }));
    }
    return this.apiClient.post<EmbarqueNavioVinculoDto>(
      `/embarques/${id}/navio-vinculo`,
      request
    ).pipe(
      tap((v: any) => this.vinculoCache$.next(v as EmbarqueNavioVinculoDto))
    );
  }

  /**
   * Update existing vinculo
   */
  updateVinculo(embarqueId: string | number, request: UpdateEmbarqueNavioVinculoRequest): Observable<EmbarqueNavioVinculoDto> {
    const id = this.toApiId(embarqueId);
    if (id === null) {
      return throwError(() => ({ message: `ID de embarque inválido para API: ${String(embarqueId)}` }));
    }
    return this.apiClient.patch<EmbarqueNavioVinculoDto>(
      `/embarques/${id}/navio-vinculo`,
      request
    ).pipe(
      tap((v: any) => this.vinculoCache$.next(v as EmbarqueNavioVinculoDto))
    );
  }

  /**
   * Delete (deactivate) vinculo
   */
  deleteVinculo(embarqueId: string | number): Observable<void> {
    const id = this.toApiId(embarqueId);
    if (id === null) {
      return throwError(() => ({ message: `ID de embarque inválido para API: ${String(embarqueId)}` }));
    }
    return this.apiClient.delete<void>(`/embarques/${id}/navio-vinculo`).pipe(
      tap(() => this.vinculoCache$.next(null))
    );
  }

  /**
   * Get list of active navios (for dropdown)
   */
  getNaviosAtivos(): Observable<{ id: number; nomeNavio: string; numeroViagem?: string }[]> {
    return this.apiClient.getList<{ id: number; nomeNavio: string }>(
      '/navios',
      { page: 1, pageSize: 200 }
    ).pipe(
      map((result: any) => result.items
        .filter((n: any) => n.ativo)
        .map((n: any) => ({
          id: n.id,
          nomeNavio: n.nomeNavio,
          numeroViagem: ''
        })))
    );
  }

  /**
   * Get trajetos (pernas) do navio
   */
  getTrajetos(navioId: number): Observable<NavioTrajetoListItem[]> {
    return this.apiClient.getList<NavioTrajetoListItem>(
      `/navios/${navioId}/trajetos`,
      { page: 1, pageSize: 200 }
    ).pipe(
      map((result: any) => result.items)
    );
  }

  private toApiId(value: string | number): number | null {
    const id = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(id) ? id : null;
  }

  currentVinculo$ = this.vinculoCache$.asObservable();
}
