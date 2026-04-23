import { Injectable } from '@angular/core';
import { ClienteV2 } from '../models/cliente-v2.models';
import { ApiClientService } from '../../../../../core/api/client/api-client.service';

interface ClienteApiDto {
  id: number;
  razaoSocial: string;
  cnpj?: string;
  email?: string;
  telefone?: string;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class ClienteV2Service {
  private readonly endpoint = 'clientes';
  private readonly items: ClienteV2[] = [];
  private loaded = false;

  constructor(private apiClient: ApiClientService) {  }

  getAll(): ClienteV2[] {
    this.ensureLoaded();
    return this.items;
  }

  getAtivos(): ClienteV2[] {
    return this.getAll().filter(c => c.ativo);
  }

  create(data: Omit<ClienteV2, 'id'>): void {
    this.apiClient
      .post<ClienteApiDto>(this.endpoint, {
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

  update(item: ClienteV2): void {
    const id = Number(item.id);
    this.apiClient
      .put<ClienteApiDto>(`${this.endpoint}/${id}`, {
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
    this.apiClient.getList<ClienteApiDto>(this.endpoint, { page: 1, pageSize: 100 }).subscribe({
      next: result => {
        this.items.splice(0, this.items.length, ...result.items.map(item => this.mapDto(item)));
        this.loaded = true;
      },
      error: () => {
        // Mantém cache anterior para não quebrar telas operacionais em caso de falha pontual.
        this.loaded = this.items.length > 0;
      }
    });
  }

  private ensureLoaded(): void {
    if (!this.loaded) this.refresh();
  }

  private mapDto(item: ClienteApiDto): ClienteV2 {
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
