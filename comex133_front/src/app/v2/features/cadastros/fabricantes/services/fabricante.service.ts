import { Injectable } from '@angular/core';
import { Fabricante } from '../models/fabricante.models';
import { ApiClientService } from '../../../../../core/api/client/api-client.service';

interface FabricanteApiDto {
  id: number;
  nome: string;
  pais: string;
  cidade?: string;
  contato?: string;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class FabricanteService {
  private readonly endpoint = 'fabricantes';
  private readonly items: Fabricante[] = [];
  private loaded = false;

  constructor(private apiClient: ApiClientService) {  }

  getAll(): Fabricante[] {
    this.ensureLoaded();
    return this.items;
  }

  getAtivos(): Fabricante[] {
    return this.getAll().filter(f => f.ativo);
  }

  create(data: Omit<Fabricante, 'id'>): void {
    this.apiClient
      .post<FabricanteApiDto>(this.endpoint, {
        nome: data.nome,
        pais: data.pais,
        cidade: data.cidade,
        contato: data.contato
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

  update(item: Fabricante): void {
    const id = Number(item.id);
    this.apiClient
      .put<FabricanteApiDto>(`${this.endpoint}/${id}`, {
        nome: item.nome,
        pais: item.pais,
        cidade: item.cidade,
        contato: item.contato
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
    this.apiClient.getList<FabricanteApiDto>(this.endpoint, { page: 1, pageSize: 100 }).subscribe({
      next: result => {
        this.items.splice(0, this.items.length, ...result.items.map(item => this.mapDto(item)));
        this.loaded = true;
      },
      error: (err: { status?: number }) => {
        this.loaded = err?.status === 403 ? true : this.items.length > 0;
      }
    });
  }

  private ensureLoaded(): void {
    if (!this.loaded) this.refresh();
  }

  private mapDto(item: FabricanteApiDto): Fabricante {
    return {
      id: String(item.id),
      nome: item.nome,
      pais: item.pais,
      cidade: item.cidade ?? '',
      contato: item.contato ?? '',
      ativo: item.ativo
    };
  }
}
