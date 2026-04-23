import { Injectable } from '@angular/core';
import { Importador } from '../models/importador.models';
import { ApiClientService } from '../../../../../core/api/client/api-client.service';

interface ImportadorApiDto {
  id: number;
  razaoSocial: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class ImportadorService {
  private readonly endpoint = 'importadores';
  private readonly items: Importador[] = [];
  private loaded = false;

  constructor(private apiClient: ApiClientService) {  }

  getAll(): Importador[] {
    this.ensureLoaded();
    return this.items;
  }

  getAtivos(): Importador[] {
    return this.getAll().filter(i => i.ativo);
  }

  create(data: Omit<Importador, 'id'>): void {
    this.apiClient
      .post<ImportadorApiDto>(this.endpoint, {
        razaoSocial: data.razaoSocial,
        cnpj: data.cnpj,
        email: data.email,
        telefone: data.telefone
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

  update(item: Importador): void {
    const id = Number(item.id);
    this.apiClient
      .put<ImportadorApiDto>(`${this.endpoint}/${id}`, {
        razaoSocial: item.razaoSocial,
        cnpj: item.cnpj,
        email: item.email,
        telefone: item.telefone
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
    this.apiClient.getList<ImportadorApiDto>(this.endpoint, { page: 1, pageSize: 100 }).subscribe({
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

  private mapDto(item: ImportadorApiDto): Importador {
    return {
      id: String(item.id),
      razaoSocial: item.razaoSocial,
      cnpj: item.cnpj ?? '',
      email: item.email ?? '',
      telefone: item.telefone ?? '',
      ativo: item.ativo
    };
  }
}
