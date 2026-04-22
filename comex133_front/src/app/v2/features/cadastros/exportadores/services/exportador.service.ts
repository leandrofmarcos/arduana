import { Injectable } from '@angular/core';
import { Exportador } from '../models/exportador.models';
import { ApiClientService } from '../../../../../core/api/client/api-client.service';

interface ExportadorApiDto {
  id: number;
  nome: string;
  documento?: string;
  pais: string;
  cidade?: string;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class ExportadorService {
  private readonly endpoint = 'exportadores';
  private readonly items: Exportador[] = [];
  private loaded = false;

  constructor(private apiClient: ApiClientService) {
    this.refresh();
  }

  getAll(): Exportador[] {
    this.ensureLoaded();
    return this.items;
  }

  getAtivos(): Exportador[] {
    return this.getAll().filter(e => e.ativo);
  }

  create(data: Omit<Exportador, 'id'>): void {
    this.apiClient
      .post<ExportadorApiDto>(this.endpoint, {
        nome: data.nome,
        documento: data.documento,
        pais: data.pais,
        cidade: data.cidade
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

  update(item: Exportador): void {
    const id = Number(item.id);
    this.apiClient
      .put<ExportadorApiDto>(`${this.endpoint}/${id}`, {
        nome: item.nome,
        documento: item.documento,
        pais: item.pais,
        cidade: item.cidade
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
    this.apiClient.getList<ExportadorApiDto>(this.endpoint, { page: 1, pageSize: 100 }).subscribe({
      next: result => {
        this.items.splice(0, this.items.length, ...result.items.map(item => this.mapDto(item)));
        this.loaded = true;
      }
    });
  }

  private ensureLoaded(): void {
    if (!this.loaded) this.refresh();
  }

  private mapDto(item: ExportadorApiDto): Exportador {
    return {
      id: String(item.id),
      nome: item.nome,
      documento: item.documento ?? '',
      pais: item.pais,
      cidade: item.cidade ?? '',
      ativo: item.ativo
    };
  }
}
