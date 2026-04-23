import { Injectable } from '@angular/core';
import { AgenteCarga } from '../models/agente-carga.models';
import { ApiClientService } from '../../../../../core/api/client/api-client.service';

interface AgenteCargaApiDto {
  id: number;
  nome: string;
  documento?: string;
  pais: string;
  contato?: string;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class AgenteCargaService {
  private readonly endpoint = 'agentes-carga';
  private readonly items: AgenteCarga[] = [];
  private loaded = false;

  constructor(private apiClient: ApiClientService) {  }

  getAll(): AgenteCarga[] {
    this.ensureLoaded();
    return this.items;
  }

  getAtivos(): AgenteCarga[] {
    return this.getAll().filter(a => a.ativo);
  }

  create(data: Omit<AgenteCarga, 'id'>): void {
    this.apiClient
      .post<AgenteCargaApiDto>(this.endpoint, {
        nome: data.nome,
        documento: data.documento,
        pais: data.pais,
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

  update(item: AgenteCarga): void {
    const id = Number(item.id);
    this.apiClient
      .put<AgenteCargaApiDto>(`${this.endpoint}/${id}`, {
        nome: item.nome,
        documento: item.documento,
        pais: item.pais,
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
    this.apiClient.getList<AgenteCargaApiDto>(this.endpoint, { page: 1, pageSize: 100 }).subscribe({
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

  private mapDto(item: AgenteCargaApiDto): AgenteCarga {
    return {
      id: String(item.id),
      nome: item.nome,
      documento: item.documento ?? '',
      pais: item.pais,
      contato: item.contato ?? '',
      ativo: item.ativo
    };
  }
}
