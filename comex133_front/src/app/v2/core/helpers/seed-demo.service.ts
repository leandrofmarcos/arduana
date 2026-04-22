import { Injectable } from '@angular/core';

/**
 * Serviço legado de seed demo.
 * A partir da migração API-first, permanece como no-op para evitar
 * qualquer escrita/leitura local de dados no frontend.
 */
@Injectable({ providedIn: 'root' })
export class SeedDemoService {
  isDemoCarregado(): boolean {
    return false;
  }

  carregarSeedDemo(): void {
    // Desativado.
  }

  limparSeedDemo(): void {
    // Desativado.
  }
}
