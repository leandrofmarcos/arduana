import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiClientService } from '../../../../core/api/client/api-client.service';
import { AuthService } from '../../../../features/auth/services/auth.service';
import {
  PacklistDto,
  PacklistItemDto,
  UploadPacklistApiResponse,
} from '../models/solicitacao-orcamento.models';
import { environment } from '../../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PacklistApiService {
  private bysolicitacao = new Map<string, PacklistDto | null>();
  private itemsById     = new Map<number, PacklistItemDto[]>();

  constructor(
    private apiClient:   ApiClientService,
    private authService: AuthService
  ) {}

  async upload(file: File, solicitacaoId: number): Promise<UploadPacklistApiResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(
      this.apiClient.uploadFile<UploadPacklistApiResponse>(
        `packlist/upload?solicitacaoId=${solicitacaoId}`,
        formData
      )
    );
  }

  async saveMapeamento(
    packlistId:       number,
    colunaNCM:        string | null,
    colunaDescricao:  string | null,
    colunaPreco:      string | null
  ): Promise<PacklistDto> {
    const result = await firstValueFrom(
      this.apiClient.post<PacklistDto>(`packlist/${packlistId}/mapeamento`, {
        colunaNCM:       colunaNCM       || null,
        colunaDescricao: colunaDescricao || null,
        colunaPreco:     colunaPreco     || null,
      })
    );
    this.bysolicitacao.set(String(result.solicitacaoOrcamentoId), result);
    return result;
  }

  async loadBySolicitacao(solicitacaoId: string): Promise<PacklistDto | null> {
    try {
      const result = await firstValueFrom(
        this.apiClient.get<PacklistDto | null>(`packlist/solicitacao/${solicitacaoId}`)
      );
      const dto = result ?? null;
      this.bysolicitacao.set(solicitacaoId, dto);
      return dto;
    } catch {
      this.bysolicitacao.set(solicitacaoId, null);
      return null;
    }
  }

  getBySolicitacao(solicitacaoId: string): PacklistDto | null | undefined {
    return this.bysolicitacao.get(solicitacaoId);
  }

  async preloadForSolicitacoes(ids: string[]): Promise<void> {
    const missing = ids.filter(id => id && !this.bysolicitacao.has(id));
    if (missing.length === 0) return;
    await Promise.all(missing.map(id => this.loadBySolicitacao(id)));
  }

  async loadItems(packlistId: number): Promise<PacklistItemDto[]> {
    try {
      const paged = await firstValueFrom(
        this.apiClient.getList<PacklistItemDto>(`packlist/${packlistId}/itens`, { page: 1, pageSize: 500 })
      );
      const items = paged.items ?? [];
      this.itemsById.set(packlistId, items);
      return items;
    } catch {
      this.itemsById.set(packlistId, []);
      return [];
    }
  }

  getItems(packlistId: number): PacklistItemDto[] | undefined {
    return this.itemsById.get(packlistId);
  }

  async delete(packlistId: number): Promise<void> {
    await firstValueFrom(this.apiClient.delete(`packlist/${packlistId}`));
  }

  invalidate(solicitacaoId: string): void {
    const dto = this.bysolicitacao.get(solicitacaoId);
    if (dto) this.itemsById.delete(dto.id);
    this.bysolicitacao.delete(solicitacaoId);
  }

  downloadArquivo(packlistId: number, nomeArquivo: string): void {
    const token = this.authService.getAccessToken();
    const url   = `${environment.apiUrl}/packlist/${packlistId}/arquivo`;
    const headers: HeadersInit = token ? { Authorization: `Bearer ${token}` } : {};

    fetch(url, { headers })
      .then(r => r.blob())
      .then(blob => {
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href     = objectUrl;
        a.download = nomeArquivo;
        a.click();
        URL.revokeObjectURL(objectUrl);
      });
  }
}
