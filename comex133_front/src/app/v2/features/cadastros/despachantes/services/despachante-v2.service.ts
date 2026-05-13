import { Injectable } from '@angular/core';
import { DespachanteV2 } from '../models/despachante-v2.models';
import { ApiClientService } from '../../../../../core/api/client/api-client.service';

interface DespachanteApiDto {
  id: number;
  nome: string;
  crn?: string;
  email?: string;
  telefone?: string;
  prefixoReferencia?: string;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class DespachanteV2Service {
  private readonly endpoint = 'despachantes';
  private readonly items: DespachanteV2[] = [];
  private loaded = false;

  constructor(private apiClient: ApiClientService) {  }

  getAll(): DespachanteV2[] {
    this.ensureLoaded();
    return this.items;
  }

  getAtivos(): DespachanteV2[] {
    return this.getAll().filter(d => d.ativo);
  }

  create(data: Omit<DespachanteV2, 'id'>): void {
    this.apiClient
      .post<DespachanteApiDto>(this.endpoint, {
        nome: data.nome,
        crn: data.crn,
        email: data.email,
        telefone: data.telefone,
        prefixoReferencia: data.prefixoReferencia || null
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

  update(item: DespachanteV2): void {
    const id = Number(item.id);
    this.apiClient
      .put<DespachanteApiDto>(`${this.endpoint}/${id}`, {
        nome: item.nome,
        crn: item.crn,
        email: item.email,
        telefone: item.telefone,
        prefixoReferencia: item.prefixoReferencia || null
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
    this.apiClient.getList<DespachanteApiDto>(this.endpoint, { page: 1, pageSize: 100 }).subscribe({
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

  private mapDto(item: DespachanteApiDto): DespachanteV2 {
    return {
      id: String(item.id),
      nome: item.nome,
      crn: item.crn ?? '',
      email: item.email ?? '',
      telefone: item.telefone ?? '',
      prefixoReferencia: item.prefixoReferencia ?? '',
      ativo: item.ativo
    };
  }
}
