import { Injectable } from '@angular/core';
import { DespesaCadastro, CategoriaDespesa } from '../models/despesa-cadastro.models';
import { ApiClientService } from '../../../../../core/api/client/api-client.service';

interface DespesaCatalogoApiDto {
  id: number;
  descricao: string;
  valor: number;
  categoria: string;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class DespesaCadastroService {
  private readonly endpoint = 'despesas-catalogo';
  private readonly items: DespesaCadastro[] = [];
  private loaded = false;

  constructor(private apiClient: ApiClientService) {
    this.refresh();
  }

  getAll(): DespesaCadastro[] {
    this.ensureLoaded();
    return this.items;
  }

  getAtivos(): DespesaCadastro[] {
    return this.getAll().filter(d => d.ativo);
  }

  getByCategoria(cat: CategoriaDespesa): DespesaCadastro[] {
    return this.getAtivos().filter(d => d.categoria === cat);
  }

  create(data: Omit<DespesaCadastro, 'id'>): void {
    this.apiClient
      .post<DespesaCatalogoApiDto>(this.endpoint, {
        descricao: data.descricao,
        valor: data.valor,
        categoria: data.categoria
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

  update(item: DespesaCadastro): void {
    const id = Number(item.id);
    this.apiClient
      .put<DespesaCatalogoApiDto>(`${this.endpoint}/${id}`, {
        descricao: item.descricao,
        valor: item.valor,
        categoria: item.categoria
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
    this.apiClient.getList<DespesaCatalogoApiDto>(this.endpoint, { page: 1, pageSize: 100 }).subscribe({
      next: result => {
        this.items.splice(0, this.items.length, ...result.items.map(item => this.mapDto(item)));
        this.loaded = true;
      }
    });
  }

  private ensureLoaded(): void {
    if (!this.loaded) this.refresh();
  }

  private mapDto(item: DespesaCatalogoApiDto): DespesaCadastro {
    return {
      id: String(item.id),
      descricao: item.descricao,
      valor: Number(item.valor),
      categoria: item.categoria as CategoriaDespesa,
      ativo: item.ativo
    };
  }
}
