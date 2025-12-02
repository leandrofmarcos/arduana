import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Despesa, PlanilhaSnapshot, Premissas, Taxas } from '../../domain/planilha.models';
import { PlanilhaRepository } from '../../domain/planilha.repository';
import { PlanilhaTemplateService } from '../../core/templates/planilha.template.service';

function calcResumo(p: Premissas, t: Taxas, despesas: Despesa[]) {
  const fobBrl = p.fobUsd * p.taxaUsd;
  const freteBrl = p.freteUsd * p.taxaUsd;
  const seguroBrl = p.seguroUsd * p.taxaUsd;
  const thcBrl = p.thcUsd * p.taxaUsd;
  const base = fobBrl + freteBrl + seguroBrl + thcBrl;
  const ii = base * (t.ii / 100);
  const ipi = (base + ii) * (t.ipi / 100);
  const pis = base * (t.pis / 100);
  const cofins = base * (t.cofins / 100);
  const tributos = ii + ipi + pis + cofins;
  const totalDespesas = despesas.reduce((s, d) => s + (d.valor || 0), 0);
  const desembolsoDesembaraco = totalDespesas;
  const desembolsoTotal = base + tributos + totalDespesas;
  return { tributos, totalDespesas, desembolsoDesembaraco, desembolsoTotal };
}

function readStorage(): PlanilhaSnapshot | null {
  try {
    const ls = (globalThis as any).localStorage as Storage | undefined;
    if (!ls) return null;
    const raw = ls.getItem('import_costs_snapshot');
    return raw ? JSON.parse(raw) as PlanilhaSnapshot : null;
  } catch {
    return null;
  }
}

function writeStorage(snap: PlanilhaSnapshot) {
  try {
    const ls = (globalThis as any).localStorage as Storage | undefined;
    if (!ls) return;
    ls.setItem('import_costs_snapshot', JSON.stringify(snap));
  } catch {}
}

@Injectable({ providedIn: 'root' })
export class LocalStoragePlanilhaRepository implements PlanilhaRepository {
  private subject: BehaviorSubject<PlanilhaSnapshot>;

  constructor(private templates: PlanilhaTemplateService) {
    const initial = readStorage() ?? this.templates.defaultSnapshot();
    this.subject = new BehaviorSubject<PlanilhaSnapshot>(initial);
    this.emit();
  }

  private emit() {
    const snap = this.subject.value;
    const r = calcResumo(snap.premissas, snap.taxas, snap.despesas);
    const baseIcms = snap.nfSaida?.baseIcms ?? 0;
    const icmsSaida = baseIcms * ((snap.taxas.icms || 0) / 100);
    const next = { ...snap, totalDespesas: r.totalDespesas, resumo: {
      tributos: r.tributos, desembolsoDesembaraco: r.desembolsoDesembaraco, desembolsoTotal: r.desembolsoTotal
    }, nfSaida: { ...(snap.nfSaida ?? { cfop: '', cst: '', baseIcms: 0, icms: 0 }), icms: icmsSaida }};
    this.subject.next(next);
    writeStorage(next);
  }

  snapshot$() { return this.subject.asObservable(); }

  atualizarPremissas(p: Partial<Premissas>) {
    const snap = this.subject.value;
    this.subject.next({ ...snap, premissas: { ...snap.premissas, ...p } });
    this.emit();
  }
  atualizarTaxas(t: Partial<Taxas>) {
    const snap = this.subject.value;
    this.subject.next({ ...snap, taxas: { ...snap.taxas, ...t } });
    this.emit();
  }
  adicionarDespesa(d: Omit<Despesa, 'id'>) {
    const snap = this.subject.value;
    const id = typeof (globalThis as any).crypto?.randomUUID === 'function' ? (globalThis as any).crypto.randomUUID() : String(Date.now());
    this.subject.next({ ...snap, despesas: [...snap.despesas, { ...d, id }] });
    this.emit();
  }
  editarDespesa(id: string, d: Partial<Despesa>) {
    const snap = this.subject.value;
    this.subject.next({ ...snap, despesas: snap.despesas.map(x => x.id === id ? { ...x, ...d } : x) });
    this.emit();
  }
  removerDespesa(id: string) {
    const snap = this.subject.value;
    this.subject.next({ ...snap, despesas: snap.despesas.filter(x => x.id !== id) });
    this.emit();
  }
  carregarSnapshot(snap: PlanilhaSnapshot){
    this.subject.next(snap);
    this.emit();
  }
  atualizarNfSaida(n: Partial<NonNullable<PlanilhaSnapshot['nfSaida']>>){
    const snap = this.subject.value;
    const merged = { ...(snap.nfSaida ?? { cfop: '', cst: '', baseIcms: 0, icms: 0 }), ...n };
    this.subject.next({ ...snap, nfSaida: merged });
    this.emit();
  }
}