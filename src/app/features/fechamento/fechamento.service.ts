import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FECHAMENTO_REPOSITORY, PLANILHA_CATALOG_REPOSITORY } from '../../core/repository.tokens';
import { FechamentoRepository, FechamentoData } from '../../domain/fechamento.repository';
import { PlanilhaCatalogRepository } from '../../domain/planilha.catalog';

@Injectable({ providedIn: 'root' })
export class FechamentoService {
  private repo = inject<FechamentoRepository>(FECHAMENTO_REPOSITORY);
  private catalog = inject<PlanilhaCatalogRepository>(PLANILHA_CATALOG_REPOSITORY);

  get$(): Observable<FechamentoData | null> {
    const id = (globalThis as any).localStorage?.getItem('import_costs_current_catalog_id') || '';
    return this.repo.get$(id);
  }

  meta(){ const id = (globalThis as any).localStorage?.getItem('import_costs_current_catalog_id') || ''; return this.catalog.getMeta(id); }

  salvar(data: Omit<FechamentoData,'processoId'>){ const id = (globalThis as any).localStorage?.getItem('import_costs_current_catalog_id') || ''; this.repo.save({ processoId: id, ...data }); }
}