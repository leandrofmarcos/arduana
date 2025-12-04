import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { NumerarioLancamento, NumerarioStatus } from '../../domain/numerario.models';
import { PLANILHA_CATALOG_REPOSITORY, PLANILHA_REPOSITORY } from '../../core/repository.tokens';
import { PlanilhaCatalogRepository } from '../../domain/planilha.catalog';
import { PlanilhaRepository } from '../../domain/planilha.repository';

@Injectable({ providedIn: 'root' })
export class NumerarioService {
  private planilha = inject<PlanilhaRepository>(PLANILHA_REPOSITORY);
  private catalog = inject<PlanilhaCatalogRepository>(PLANILHA_CATALOG_REPOSITORY);

  list$(): Observable<NumerarioLancamento[]> {
    return this.planilha.snapshot$().pipe(map(s => (s.numerario ?? [])));
  }

  meta(){ const id = (globalThis as any).localStorage?.getItem('import_costs_current_catalog_id') || ''; return this.catalog.getMeta(id); }

  novo(valor: number, moeda: 'BRL'|'USD'|'EUR', responsavel: string, observacao?: string){ this.planilha.adicionarNumerario({ valor, moeda, responsavel, observacao }); }
  atualizar(id: string, status: NumerarioStatus){ this.planilha.atualizarStatusNumerario(id, status); }
  remover(id: string){ this.planilha.removerNumerario(id); }
}