import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiClientService } from '../api/client/api-client.service';

interface ParametroDto {
  id: number;
  chave: string;
  valor: string;
  descricao?: string;
}

@Injectable({ providedIn: 'root' })
export class ParametroSistemaService {
  private cache = new Map<string, string>();

  constructor(private apiClient: ApiClientService) {}

  async getValor(chave: string, fallback: string): Promise<string> {
    if (this.cache.has(chave)) return this.cache.get(chave)!;
    try {
      const result = await firstValueFrom(
        this.apiClient.get<ParametroDto>(`parametros/chave/${encodeURIComponent(chave)}`)
      );
      this.cache.set(chave, result.valor);
      return result.valor;
    } catch {
      return fallback;
    }
  }
}
