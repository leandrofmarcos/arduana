import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { VENDA_REPOSITORY, PLANILHA_CATALOG_REPOSITORY } from '../../core/repository.tokens';
import { VendaRepository } from '../../domain/venda.repository';
import { VendaData } from '../../domain/venda.models';
import { PlanilhaCatalogRepository } from '../../domain/planilha.catalog';
import { PlanilhaSnapshot } from '../../domain/planilha.models';

@Injectable({ providedIn: 'root' })
export class VendaService {
  private repo = inject<VendaRepository>(VENDA_REPOSITORY);
  private catalog = inject<PlanilhaCatalogRepository>(PLANILHA_CATALOG_REPOSITORY);

  get$(): Observable<VendaData | null> {
    const id = (globalThis as any).localStorage?.getItem('import_costs_current_catalog_id') || '';
    return this.repo.get$(id);
  }

  meta(){ const id = (globalThis as any).localStorage?.getItem('import_costs_current_catalog_id') || ''; return this.catalog.getMeta(id); }
  snapshot(){ const id = (globalThis as any).localStorage?.getItem('import_costs_current_catalog_id') || ''; return this.catalog.getSnapshot(id) as PlanilhaSnapshot | null; }

  calcularPrecoBase(){
    const s = this.snapshot(); if(!s) return { comIPI: 0, semIPI: 0 };
    const base = s.resumo.desembolsoTotal;
    // Aproximação do IPI pela taxa definida
    const ipiPerc = s.taxas.ipi || 0;
    const ipiValor = (s.premissas.fobUsd + s.premissas.freteUsd + s.premissas.seguroUsd + s.premissas.thcUsd) * s.premissas.taxaUsd * (ipiPerc/100);
    return { comIPI: base, semIPI: Math.max(0, base - ipiValor) };
  }

  salvar(margemPerc: number, descontoPerc: number, observacao?: string){
    const id = (globalThis as any).localStorage?.getItem('import_costs_current_catalog_id') || '';
    const base = this.calcularPrecoBase();
    const precoBase = base.comIPI;
    const precoComMargem = precoBase * (1 + margemPerc/100);
    const precoFinal = precoComMargem * (1 - descontoPerc/100);
    const data: VendaData = { processoId: id, margemPerc, descontoPerc, precoComIPI: precoFinal, precoSemIPI: base.semIPI, data: new Date().toISOString(), observacao };
    this.repo.save(data);
  }
}