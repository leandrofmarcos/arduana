import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Despesa, PlanilhaSnapshot, Premissas, Taxas } from '../../domain/planilha.models';
import { PlanilhaRepository } from '../../domain/planilha.repository';

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
  private subject = new BehaviorSubject<PlanilhaSnapshot>(
    readStorage() ?? {
      premissas: { fobUsd: 46110, freteUsd: 2450, seguroUsd: 0, thcUsd: 0, taxaUsd: 5.55, quantidade: 1, ncm: '8423' },
      taxas: { ii: 14.4, ipi: 7.43, icms: 4, pis: 2.1, cofins: 10.65 },
      despesas: [
        { id: '1', categoria: 'Porto', item: 'THC - V3', valor: 1280 },
        { id: '2', categoria: 'Agência Marítima', item: 'Liberação de B/L - V3', valor: 900 },
        { id: '3', categoria: 'Agência Marítima', item: 'Frete Marítimo - V3', valor: 1450 }
      ],
      totalDespesas: 0,
      resumo: { tributos: 0, desembolsoDesembaraco: 0, desembolsoTotal: 0 }
    }
  );

  constructor() {
    this.emit();
  }

  private emit() {
    const snap = this.subject.value;
    const r = calcResumo(snap.premissas, snap.taxas, snap.despesas);
    const next = { ...snap, totalDespesas: r.totalDespesas, resumo: {
      tributos: r.tributos, desembolsoDesembaraco: r.desembolsoDesembaraco, desembolsoTotal: r.desembolsoTotal
    }};
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
}