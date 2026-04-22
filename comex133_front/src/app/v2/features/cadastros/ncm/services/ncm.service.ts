import { Injectable } from '@angular/core';
import { Ncm } from '../models/ncm.models';
import { ApiClientService } from '../../../../../core/api/client/api-client.service';

interface NcmApiDto {
  id: number;
  codigoNcm: string;
  descricao: string;
  aliqII: number;
  aliqIPI: number;
  aliqPIS: number;
  aliqCOFINS: number;
  aliqICMS: number;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class NcmService {
  private readonly endpoint = 'ncms';
  private readonly items: Ncm[] = [];
  private loaded = false;

  constructor(private apiClient: ApiClientService) {
    this.refresh();
  }

  getAll(): Ncm[] {
    this.ensureLoaded();
    return this.items;
  }

  getAtivos(): Ncm[] {
    return this.getAll().filter(n => n.ativo);
  }

  create(data: Omit<Ncm, 'id'>): void {
    this.apiClient
      .post<NcmApiDto>(this.endpoint, {
        codigoNcm: data.codigoNcm,
        descricao: data.descricao,
        aliqII: data.aliqII,
        aliqIPI: data.aliqIPI,
        aliqPIS: data.aliqPIS,
        aliqCOFINS: data.aliqCOFINS,
        aliqICMS: data.aliqICMS
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

  update(item: Ncm): void {
    const id = Number(item.id);
    this.apiClient
      .put<NcmApiDto>(`${this.endpoint}/${id}`, {
        codigoNcm: item.codigoNcm,
        descricao: item.descricao,
        aliqII: item.aliqII,
        aliqIPI: item.aliqIPI,
        aliqPIS: item.aliqPIS,
        aliqCOFINS: item.aliqCOFINS,
        aliqICMS: item.aliqICMS
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
    this.apiClient.getList<NcmApiDto>(this.endpoint, { page: 1, pageSize: 100 }).subscribe({
      next: result => {
        this.items.splice(0, this.items.length, ...result.items.map(item => this.mapDto(item)));
        this.loaded = true;
      }
    });
  }

  private ensureLoaded(): void {
    if (!this.loaded) this.refresh();
  }

  private mapDto(item: NcmApiDto): Ncm {
    return {
      id: String(item.id),
      codigoNcm: item.codigoNcm,
      descricao: item.descricao,
      aliqII: item.aliqII,
      aliqIPI: item.aliqIPI,
      aliqPIS: item.aliqPIS,
      aliqCOFINS: item.aliqCOFINS,
      aliqICMS: item.aliqICMS,
      ativo: item.ativo
    };
  }
}
