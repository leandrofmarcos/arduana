import { Injectable } from '@angular/core';
import { Observable, of, map, switchMap, tap } from 'rxjs';
import { ModeloDespesa, ModeloDespesaItem } from '../models/modelo-despesa.models';
import { ApiClientService } from '../../../../../core/api/client/api-client.service';

interface ModeloDespesaApiDto {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

interface ModeloDespesaItemApiDto {
  despesaCatalogoId: number;
}

@Injectable({ providedIn: 'root' })
export class ModeloDespesaService {
  private readonly endpoint = 'modelos-despesa';
  private readonly modelos: ModeloDespesa[] = [];
  private readonly itens: ModeloDespesaItem[] = [];
  private loaded = false;

  constructor(private apiClient: ApiClientService) {
    this.refresh();
  }

  getAll(): ModeloDespesa[] {
    this.ensureLoaded();
    return this.modelos;
  }

  create(data: Omit<ModeloDespesa, 'id'>): Observable<ModeloDespesa> {
    return this.apiClient
      .post<ModeloDespesaApiDto>(this.endpoint, {
        nome: data.nome,
        descricao: data.descricao
      })
      .pipe(
        switchMap(created => {
          const mapped: ModeloDespesa = {
            id: String(created.id),
            nome: created.nome,
            descricao: created.descricao,
            ativo: created.ativo
          };

          if (!data.ativo) {
            return this.apiClient
              .patch<void>(`${this.endpoint}/${created.id}/ativo`, { ativo: false })
              .pipe(map(() => ({ ...mapped, ativo: false })));
          }

          return of(mapped);
        }),
        tap(() => this.refresh())
      );
  }

  update(item: ModeloDespesa): void {
    const id = Number(item.id);
    this.apiClient
      .put<ModeloDespesaApiDto>(`${this.endpoint}/${id}`, {
        nome: item.nome,
        descricao: item.descricao
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

  getAllItens(): ModeloDespesaItem[] {
    this.ensureLoaded();
    return this.itens;
  }

  getItensByModelo(modeloId: string): ModeloDespesaItem[] {
    this.ensureLoaded();
    return this.itens.filter(i => i.modeloDespesaId === modeloId);
  }

  addItem(modeloId: string, despesaCadastroId: string): ModeloDespesaItem {
    const item: ModeloDespesaItem = {
      id: `${modeloId}-${despesaCadastroId}`,
      modeloDespesaId: modeloId,
      despesaCadastroId
    };

    this.apiClient
      .post<void>(`${this.endpoint}/${Number(modeloId)}/itens`, { despesaCatalogoId: Number(despesaCadastroId) })
      .subscribe({ next: () => this.refresh() });

    return item;
  }

  removeItem(itemId: string): void {
    const item = this.itens.find(i => i.id === itemId);
    if (!item) return;
    this.apiClient
      .delete<void>(`${this.endpoint}/${Number(item.modeloDespesaId)}/itens/${Number(item.despesaCadastroId)}`)
      .subscribe({ next: () => this.refresh() });
  }

  replaceItens(modeloId: string, despesaIds: string[]): void {
    const atual = this.getItensByModelo(modeloId).map(i => i.despesaCadastroId);
    const toRemove = atual.filter(id => !despesaIds.includes(id));
    const toAdd = despesaIds.filter(id => !atual.includes(id));

    toRemove.forEach(id => {
      this.apiClient.delete<void>(`${this.endpoint}/${Number(modeloId)}/itens/${Number(id)}`).subscribe({ next: () => this.refresh() });
    });

    toAdd.forEach(id => {
      this.apiClient.post<void>(`${this.endpoint}/${Number(modeloId)}/itens`, { despesaCatalogoId: Number(id) }).subscribe({ next: () => this.refresh() });
    });
  }

  private refresh(): void {
    this.apiClient.getList<ModeloDespesaApiDto>(this.endpoint, { page: 1, pageSize: 100 }).subscribe({
      next: result => {
        this.modelos.splice(0, this.modelos.length, ...result.items.map(item => ({
          id: String(item.id),
          nome: item.nome,
          descricao: item.descricao,
          ativo: item.ativo
        })));
        this.rebuildItens();
        this.loaded = true;
      }
    });
  }

  private rebuildItens(): void {
    this.itens.splice(0, this.itens.length);
    this.modelos.forEach(modelo => {
      this.apiClient.getList<ModeloDespesaItemApiDto>(`${this.endpoint}/${Number(modelo.id)}/itens`, { page: 1, pageSize: 200 }).subscribe({
        next: result => {
          const mapped = result.items.map(item => ({
            id: `${modelo.id}-${item.despesaCatalogoId}`,
            modeloDespesaId: modelo.id,
            despesaCadastroId: String(item.despesaCatalogoId)
          }));
          this.itens.push(...mapped);
        }
      });
    });
  }

  private ensureLoaded(): void {
    if (!this.loaded) this.refresh();
  }
}
