import { Injectable } from '@angular/core';
import { ListaPrecoLcl } from '../models/lista-preco-lcl.models';
import { ApiClientService } from '../../../../../core/api/client/api-client.service';

interface ListaPrecoLclApiDto {
  id: number;
  categoria: string;
  descricao: string;
  nomeChines?: string;
  precoUsdPorCbm: number;
  precoUsdPorKg: number;
  dataVigencia: string;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class ListaPrecoLclService {
  private readonly endpoint = 'lista-preco-lcl';
  private readonly items: ListaPrecoLcl[] = [];
  private loaded = false;

  constructor(private apiClient: ApiClientService) {
    this.refresh();
  }

  getAll(): ListaPrecoLcl[] {
    this.ensureLoaded();
    return this.items;
  }

  getAtivos(): ListaPrecoLcl[] {
    return this.getAll().filter(l => l.ativo);
  }

  create(data: Omit<ListaPrecoLcl, 'id'>): void {
    this.apiClient
      .post<ListaPrecoLclApiDto>(this.endpoint, {
        categoria: data.categoria,
        descricao: data.descricao,
        nomeChines: data.nomeChines,
        precoUsdPorCbm: data.precoUsdPorCbm,
        precoUsdPorKg: data.precoUsdPorKg,
        dataVigencia: data.dataVigencia
      })
      .subscribe({
        next: created => {
          if (!data.ativo) {
            this.apiClient.patch<void>(`${this.endpoint}/${created.id}/ativo`, { ativo: false }).subscribe({ next: () => this.refresh() });
            return;
          }
          this.refresh();
        }
      });
  }

  update(item: ListaPrecoLcl): void {
    const id = Number(item.id);
    this.apiClient
      .put<ListaPrecoLclApiDto>(`${this.endpoint}/${id}`, {
        categoria: item.categoria,
        descricao: item.descricao,
        nomeChines: item.nomeChines,
        precoUsdPorCbm: item.precoUsdPorCbm,
        precoUsdPorKg: item.precoUsdPorKg,
        dataVigencia: item.dataVigencia
      })
      .subscribe({
        next: () => {
          this.apiClient.patch<void>(`${this.endpoint}/${id}/ativo`, { ativo: item.ativo }).subscribe({ next: () => this.refresh() });
        }
      });
  }

  remove(id: string): void {
    this.apiClient.delete<void>(`${this.endpoint}/${Number(id)}`).subscribe({ next: () => this.refresh() });
  }

  private refresh(): void {
    this.apiClient.getList<ListaPrecoLclApiDto>(this.endpoint, { page: 1, pageSize: 100 }).subscribe({
      next: result => {
        this.items.splice(0, this.items.length, ...result.items.map(item => this.mapDto(item)));
        this.loaded = true;
      }
    });
  }

  private ensureLoaded(): void {
    if (!this.loaded) this.refresh();
  }

  private mapDto(item: ListaPrecoLclApiDto): ListaPrecoLcl {
    return {
      id: String(item.id),
      categoria: item.categoria,
      descricao: item.descricao,
      nomeChines: item.nomeChines,
      precoUsdPorCbm: item.precoUsdPorCbm,
      precoUsdPorKg: item.precoUsdPorKg,
      dataVigencia: item.dataVigencia,
      ativo: item.ativo
    };
  }
}
