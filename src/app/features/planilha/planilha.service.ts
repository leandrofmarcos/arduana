import { Injectable, inject } from '@angular/core';
import { PLANILHA_REPOSITORY } from '../../core/repository.tokens';
import { PlanilhaRepository } from '../../domain/planilha.repository';
import { Observable } from 'rxjs';
import { PlanilhaSnapshot, Premissas, Taxas, Despesa, CategoriaDespesa } from '../../domain/planilha.models';

@Injectable({ providedIn: 'root' })
export class PlanilhaService {
  private repo = inject<PlanilhaRepository>(PLANILHA_REPOSITORY);
  snapshot$(): Observable<PlanilhaSnapshot> { return this.repo.snapshot$(); }
  atualizarPremissas(p: Partial<Premissas>) { this.repo.atualizarPremissas(p); }
  atualizarTaxas(t: Partial<Taxas>) { this.repo.atualizarTaxas(t); }
  adicionarDespesa(categoria: CategoriaDespesa, item: string, valor: number, fornecedor?: string, observacao?: string) {
    const d: Omit<Despesa,'id'> = { categoria, item, valor, fornecedor, observacao };
    this.repo.adicionarDespesa(d);
  }
  editarDespesa(id: string, dados: Partial<Despesa>) { this.repo.editarDespesa(id, dados); }
  removerDespesa(id: string) { this.repo.removerDespesa(id); }
}