import { Injectable, inject } from '@angular/core';
import { PLANILHA_REPOSITORY, PLANILHA_CATALOG_REPOSITORY } from '../../core/repository.tokens';
import { PlanilhaRepository } from '../../domain/planilha.repository';
import { Observable } from 'rxjs';
import { PlanilhaSnapshot, Premissas, Taxas, Despesa, CategoriaDespesa } from '../../domain/planilha.models';
import { PlanilhaCatalogRepository } from '../../domain/planilha.catalog';

@Injectable({ providedIn: 'root' })
export class PlanilhaService {
  private repo = inject<PlanilhaRepository>(PLANILHA_REPOSITORY);
  private catalog = inject<PlanilhaCatalogRepository>(PLANILHA_CATALOG_REPOSITORY);
  private lastSnapshot: PlanilhaSnapshot | null = null;
  constructor(){ this.snapshot$().subscribe(s => this.lastSnapshot = s); }
  snapshot$(): Observable<PlanilhaSnapshot> { return this.repo.snapshot$(); }
  atualizarPremissas(p: Partial<Premissas>) { this.repo.atualizarPremissas(p); }
  atualizarTaxas(t: Partial<Taxas>) { this.repo.atualizarTaxas(t); }
  atualizarNfSaida(n: any) { this.repo.atualizarNfSaida(n); }
  adicionarDespesa(categoria: CategoriaDespesa, item: string, valor: number, fornecedor?: string, observacao?: string) {
    const d: Omit<Despesa,'id'> = { categoria, item, valor, fornecedor, observacao };
    this.repo.adicionarDespesa(d);
  }
  editarDespesa(id: string, dados: Partial<Despesa>) { this.repo.editarDespesa(id, dados); }
  removerDespesa(id: string) { this.repo.removerDespesa(id); }
  salvar(meta?: Partial<{ produto: string; cliente: string; processo: string; origem: string }>) {
    const s = this.lastSnapshot; if(!s) return;
    const ls = (globalThis as any).localStorage as Storage | undefined;
    const currentId = ls?.getItem('import_costs_current_catalog_id') || null;
    let id = currentId;
    if(!id){ id = this.catalog.createNew({ produto: meta?.produto, cliente: meta?.cliente, processo: meta?.processo, origem: meta?.origem }); ls?.setItem('import_costs_current_catalog_id', id); }
    this.catalog.setSnapshot(id!, s);
    this.catalog.update(id!, { produto: meta?.produto, cliente: meta?.cliente, processo: meta?.processo, origem: meta?.origem, dataSimulacao: new Date().toISOString(), tributos: s.resumo.tributos, desembolsoTotal: s.resumo.desembolsoTotal, status: 'Ativo' });
  }
  finalizarImportacao(){
    const s = this.lastSnapshot; if(!s) return;
    const ls = (globalThis as any).localStorage as Storage | undefined;
    const id = ls?.getItem('import_costs_current_catalog_id');
    if(id){ this.catalog.setSnapshot(id, s); this.catalog.update(id, { dataSimulacao: new Date().toISOString(), tributos: s.resumo.tributos, desembolsoTotal: s.resumo.desembolsoTotal, status: 'Finalizado' }); }
    ls?.setItem('import_costs_locked', 'true');
  }

  salvarComoCopia(meta?: Partial<{ produto: string; cliente: string; processo: string; origem: string }>) {
    const s = this.lastSnapshot; if(!s) return;
    const id = this.catalog.createNew({ produto: meta?.produto, cliente: meta?.cliente, processo: meta?.processo, origem: meta?.origem });
    this.catalog.setSnapshot(id, s);
    this.catalog.update(id, { produto: meta?.produto, cliente: meta?.cliente, processo: meta?.processo, origem: meta?.origem, dataSimulacao: new Date().toISOString(), tributos: s.resumo.tributos, desembolsoTotal: s.resumo.desembolsoTotal, status: 'Rascunho' });
  }
}