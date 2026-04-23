import { Injectable } from '@angular/core';
import { Observable, of, map, tap, switchMap, catchError, EMPTY } from 'rxjs';
import { PortoDestino } from '../models/porto-destino.models';
import { ApiClientService } from '../../../../../core/api/client/api-client.service';
import { PagedResult } from '../../../../../core/api/models/api-response.model';

interface PortoDestinoApiDto {
  id: number;
  nome: string;
  codigo: string;
  estado?: string;
  pais: string;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class PortoDestinoService {
  private readonly endpoint = 'portos-destino';
  private readonly allItems: PortoDestino[] = [];
  private readonly activeItems: PortoDestino[] = [];
  private cacheLoaded = false;

  constructor(private apiClient: ApiClientService) {  }

  getAll(): PortoDestino[] {
    this.ensureCache();
    return this.allItems;
  }

  getAtivos(): PortoDestino[] {
    this.ensureCache();
    return this.activeItems;
  }

  getPaged(page = 1, pageSize = 20): Observable<PagedResult<PortoDestino>> {
    return this.apiClient
      .getList<PortoDestinoApiDto>(this.endpoint, { page, pageSize })
      .pipe(
        map(result => ({
          ...result,
          items: result.items.map((item: PortoDestinoApiDto) => this.mapDto(item))
        }))
      );
  }

  create(data: Omit<PortoDestino, 'id'>): Observable<PortoDestino> {
    return this.apiClient
      .post<PortoDestinoApiDto>(this.endpoint, {
        nome: data.nome,
        codigo: data.codigo,
        estado: data.estado,
        pais: data.pais
      })
      .pipe(
        map(item => this.mapDto(item)),
        switchMap(created => {
          if (data.ativo) return of(created);
          return this.setAtivo(created.id, false).pipe(map(() => ({ ...created, ativo: false })));
        }),
        tap(() => this.refreshCache().subscribe())
      );
  }

  update(item: PortoDestino): Observable<PortoDestino> {
    return this.apiClient
      .put<PortoDestinoApiDto>(`${this.endpoint}/${this.toApiId(item.id)}`, {
        nome: item.nome,
        codigo: item.codigo,
        estado: item.estado,
        pais: item.pais
      })
      .pipe(
        map(updated => this.mapDto(updated)),
        switchMap(updated =>
          this.setAtivo(updated.id, item.ativo).pipe(map(() => ({ ...updated, ativo: item.ativo })))
        ),
        tap(() => this.refreshCache().subscribe())
      );
  }

  remove(id: string): Observable<void> {
    return this.apiClient
      .delete<void>(`${this.endpoint}/${this.toApiId(id)}`)
      .pipe(tap(() => this.refreshCache().subscribe()));
  }

  private setAtivo(id: string, ativo: boolean): Observable<void> {
    return this.apiClient.patch<void>(`${this.endpoint}/${this.toApiId(id)}/ativo`, { ativo });
  }

  private refreshCache(): Observable<void> {
    return this.apiClient
      .getList<PortoDestinoApiDto>(this.endpoint, { page: 1, pageSize: 100 })
      .pipe(
        map(result => result.items.map((item: PortoDestinoApiDto) => this.mapDto(item))),
        tap(items => {
          this.replaceArray(this.allItems, items);
          this.replaceArray(this.activeItems, items.filter((item: PortoDestino) => item.ativo));
          this.cacheLoaded = true;
        }),
        map(() => void 0),
        catchError((err: { status?: number }) => { if (err?.status === 403) { this.cacheLoaded = true; } return EMPTY; })
      );
  }

  private ensureCache(): void {
    if (this.cacheLoaded) return;
    this.refreshCache().subscribe();
  }

  private replaceArray<T>(target: T[], source: T[]): void {
    target.splice(0, target.length, ...source);
  }

  private mapDto(item: PortoDestinoApiDto): PortoDestino {
    return {
      id: String(item.id),
      nome: item.nome,
      codigo: item.codigo,
      estado: item.estado,
      pais: item.pais,
      ativo: item.ativo
    };
  }

  private toApiId(id: string): number {
    return Number(id);
  }
}
