import { Injectable } from '@angular/core';
import { Observable, of, map, tap, switchMap, catchError, EMPTY } from 'rxjs';
import { PortoOrigem } from '../models/porto-origem.models';
import { ApiClientService } from '../../../../../core/api/client/api-client.service';
import { PagedResult } from '../../../../../core/api/models/api-response.model';

interface PortoOrigemApiDto {
  id: number;
  nome: string;
  codigo: string;
  pais: string;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class PortoOrigemService {
  private readonly endpoint = 'portos-origem';
  private readonly allItems: PortoOrigem[] = [];
  private readonly activeItems: PortoOrigem[] = [];
  private cacheLoaded = false;

  constructor(private apiClient: ApiClientService) {  }

  getAll(): PortoOrigem[] {
    this.ensureCache();
    return this.allItems;
  }

  getAtivos(): PortoOrigem[] {
    this.ensureCache();
    return this.activeItems;
  }

  getPaged(page = 1, pageSize = 20): Observable<PagedResult<PortoOrigem>> {
    return this.apiClient
      .getList<PortoOrigemApiDto>(this.endpoint, { page, pageSize })
      .pipe(
        map(result => ({
          ...result,
          items: result.items.map((item: PortoOrigemApiDto) => this.mapDto(item))
        }))
      );
  }

  create(data: Omit<PortoOrigem, 'id'>): Observable<PortoOrigem> {
    return this.apiClient
      .post<PortoOrigemApiDto>(this.endpoint, {
        nome: data.nome,
        codigo: data.codigo,
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

  update(item: PortoOrigem): Observable<PortoOrigem> {
    return this.apiClient
      .put<PortoOrigemApiDto>(`${this.endpoint}/${this.toApiId(item.id)}`, {
        nome: item.nome,
        codigo: item.codigo,
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
      .getList<PortoOrigemApiDto>(this.endpoint, { page: 1, pageSize: 100 })
      .pipe(
        map(result => result.items.map((item: PortoOrigemApiDto) => this.mapDto(item))),
        tap(items => {
          this.replaceArray(this.allItems, items);
          this.replaceArray(this.activeItems, items.filter((item: PortoOrigem) => item.ativo));
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

  private mapDto(item: PortoOrigemApiDto): PortoOrigem {
    return {
      id: String(item.id),
      nome: item.nome,
      codigo: item.codigo,
      pais: item.pais,
      ativo: item.ativo
    };
  }

  private toApiId(id: string): number {
    return Number(id);
  }
}
