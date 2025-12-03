import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { NumerarioRepository } from '../../domain/numerario.repository';
import { NumerarioLancamento, NumerarioStatus } from '../../domain/numerario.models';
import { NUMERARIO_REPOSITORY, PLANILHA_CATALOG_REPOSITORY } from '../../core/repository.tokens';
import { PlanilhaCatalogRepository } from '../../domain/planilha.catalog';

@Injectable({ providedIn: 'root' })
export class NumerarioService {
  private repo = inject<NumerarioRepository>(NUMERARIO_REPOSITORY);
  private catalog = inject<PlanilhaCatalogRepository>(PLANILHA_CATALOG_REPOSITORY);

  list$(): Observable<NumerarioLancamento[]> {
    const id = (globalThis as any).localStorage?.getItem('import_costs_current_catalog_id') || '';
    return this.repo.list$(id);
  }

  meta(){ const id = (globalThis as any).localStorage?.getItem('import_costs_current_catalog_id') || ''; return this.catalog.getMeta(id); }

  novo(valor: number, moeda: 'BRL'|'USD'|'EUR', responsavel: string, observacao?: string){ this.repo.add({ processoId: '', valor, moeda, responsavel, observacao }); }
  atualizar(id: string, status: NumerarioStatus){ this.repo.updateStatus(id, status); }
  remover(id: string){ this.repo.remove(id); }
}