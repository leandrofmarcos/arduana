import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiClientService } from '../../../../../core/api/client/api-client.service';

export interface UsuarioVinculo {
  id: number;
  usuarioId: number;
  tipoVinculo: string;
  entidadeId: number;
  ativo: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

@Injectable({ providedIn: 'root' })
export class UsuarioVinculoService {
  private readonly endpoint = 'usuario-vinculos';

  constructor(private apiClient: ApiClientService) {}

  async getByUsuario(usuarioId: number): Promise<UsuarioVinculo[]> {
    const result = await firstValueFrom(
      this.apiClient.get<UsuarioVinculo[]>(`${this.endpoint}/usuario/${usuarioId}`)
    );
    return result ?? [];
  }

  async criar(usuarioId: number, tipoVinculo: string, entidadeId: number): Promise<void> {
    await firstValueFrom(
      this.apiClient.post<UsuarioVinculo>(this.endpoint, { usuarioId, tipoVinculo, entidadeId })
    );
  }

  async remover(vinculoId: number): Promise<void> {
    await firstValueFrom(this.apiClient.delete(`${this.endpoint}/${vinculoId}`));
  }

  async setAtivo(vinculoId: number, ativo: boolean): Promise<void> {
    await firstValueFrom(
      this.apiClient.patch<void>(`${this.endpoint}/${vinculoId}/ativo`, { ativo })
    );
  }
}
