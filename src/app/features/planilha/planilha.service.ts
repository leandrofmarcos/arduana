import { Injectable, inject } from '@angular/core';
import { PLANILHA_REPOSITORY, PLANILHA_CATALOG_REPOSITORY } from '../../core/repository.tokens';
import { PlanilhaRepository } from '../../domain/planilha.repository';
import { Observable } from 'rxjs';
import { PlanilhaSnapshot, Premissas, Taxas, Despesa, CategoriaDespesa } from '../../domain/planilha.models';
import { PlanilhaCatalogRepository } from '../../domain/planilha.catalog';
import { NumerarioStatus } from '../../domain/numerario.models';

@Injectable({ providedIn: 'root' })
export class PlanilhaService {
  private repo = inject<PlanilhaRepository>(PLANILHA_REPOSITORY);
  private catalog = inject<PlanilhaCatalogRepository>(PLANILHA_CATALOG_REPOSITORY);
  private lastSnapshot: PlanilhaSnapshot | null = null;
  constructor(){ this.snapshot$().subscribe(s => { this.lastSnapshot = s; try { const ls = (globalThis as any).localStorage as Storage | undefined; const id = ls?.getItem('import_costs_current_catalog_id'); if(id){ this.catalog.setSnapshot(id, s); } } catch {} }); }
  snapshot$(): Observable<PlanilhaSnapshot> { return this.repo.snapshot$(); }
  atualizarPremissas(p: Partial<Premissas>) { this.repo.atualizarPremissas(p); }
  atualizarTaxas(t: Partial<Taxas>) { this.repo.atualizarTaxas(t); }
  atualizarNfSaida(n: any) { this.repo.atualizarNfSaida(n); }
  premissasValid(){ const s = this.lastSnapshot; if(!s) return false; const p = s.premissas as any; return !!p && !!p.ncm && (p.taxaUsd||0) > 0 && (p.quantidade||0) > 0; }
  adicionarDespesa(categoria: CategoriaDespesa, item: string, valor: number, fornecedor?: string, observacao?: string) {
    const d: Omit<Despesa,'id'> = { categoria, item, valor, fornecedor, observacao };
    this.repo.adicionarDespesa(d);
  }
  editarDespesa(id: string, dados: Partial<Despesa>) { this.repo.editarDespesa(id, dados); }
  removerDespesa(id: string) { this.repo.removerDespesa(id); }
  adicionarNumerario(valor: number, moeda: 'BRL'|'USD'|'EUR', responsavel: string, observacao?: string){ this.repo.adicionarNumerario({ valor, moeda, responsavel, observacao }); }
  atualizarStatusNumerario(id: string, status: NumerarioStatus){ this.repo.atualizarStatusNumerario(id, status); }
  removerNumerario(id: string){ this.repo.removerNumerario(id); }
  salvar(meta?: Partial<{ produto: string; cliente: string; processo: string; origem: string }>): string | null {
    const s = this.lastSnapshot; if(!s) return null;
    const ls = (globalThis as any).localStorage as Storage | undefined;
    const currentId = ls?.getItem('import_costs_current_catalog_id') || null;
    let id = currentId;
    if(!id){ id = this.catalog.createNew({ produto: meta?.produto, cliente: meta?.cliente, processo: meta?.processo, origem: meta?.origem }); ls?.setItem('import_costs_current_catalog_id', id); }
    this.catalog.setSnapshot(id!, s);
    this.catalog.update(id!, { produto: meta?.produto, cliente: meta?.cliente, processo: meta?.processo, origem: meta?.origem, dataSimulacao: new Date().toISOString(), tributos: s.resumo.tributos, desembolsoTotal: s.resumo.desembolsoTotal, status: 'Ativo' });
    return id!;
  }
  finalizarImportacao(){
    const s = this.lastSnapshot; if(!s) return;
    const ls = (globalThis as any).localStorage as Storage | undefined;
    const id = ls?.getItem('import_costs_current_catalog_id');
    if(id){ this.catalog.setSnapshot(id, s); this.catalog.update(id, { dataSimulacao: new Date().toISOString(), tributos: s.resumo.tributos, desembolsoTotal: s.resumo.desembolsoTotal, status: 'Finalizado', faseAtual: 'Fechamento', faseDates: { Fechamento: { start: new Date().toISOString() } } }); }
    ls?.setItem('import_costs_locked', 'true');
  }

  aprovarOrcamento(){
    const s = this.lastSnapshot; if(!s) return;
    const ls = (globalThis as any).localStorage as Storage | undefined;
    const id = ls?.getItem('import_costs_current_catalog_id');
    if(id){ const now = new Date().toISOString(); this.catalog.setSnapshot(id, s); this.catalog.update(id, { dataSimulacao: now, tributos: s.resumo.tributos, desembolsoTotal: s.resumo.desembolsoTotal, status: 'Ativo', faseAtual: 'Aduana', faseDates: { Orcamento: { start: now, end: now }, Aduana: { start: now } } }); }
    ls?.setItem('import_costs_locked', 'true');
  }

  desaprovarOrcamento(){
    const s = this.lastSnapshot; if(!s) return;
    const ls = (globalThis as any).localStorage as Storage | undefined;
    const id = ls?.getItem('import_costs_current_catalog_id');
    if(id){ const now = new Date().toISOString(); this.catalog.setSnapshot(id, s); this.catalog.update(id, { dataSimulacao: now, tributos: s.resumo.tributos, desembolsoTotal: s.resumo.desembolsoTotal, status: 'Ativo', faseAtual: 'Orcamento', faseDates: { Orcamento: { start: now } } }); }
    ls?.setItem('import_costs_locked', 'false');
  }

  novaVersao(){
    const ls = (globalThis as any).localStorage as Storage | undefined;
    ls?.setItem('import_costs_locked', 'false');
  }

  salvarComoCopia(meta?: Partial<{ produto: string; cliente: string; processo: string; origem: string }>) {
    const s = this.lastSnapshot; if(!s) return;
    const id = this.catalog.createNew({ produto: meta?.produto, cliente: meta?.cliente, processo: meta?.processo, origem: meta?.origem });
    this.catalog.setSnapshot(id, s);
    this.catalog.update(id, { produto: meta?.produto, cliente: meta?.cliente, processo: meta?.processo, origem: meta?.origem, dataSimulacao: new Date().toISOString(), tributos: s.resumo.tributos, desembolsoTotal: s.resumo.desembolsoTotal, status: 'Rascunho' });
  }
}