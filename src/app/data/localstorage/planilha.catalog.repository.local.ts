import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlanilhaCatalogRepository, PlanilhaListItem } from '../../domain/planilha.catalog';
import { PlanilhaSnapshot, Premissas, Taxas, Despesa } from '../../domain/planilha.models';

const INDEX_KEY = 'import_costs_catalog_index';
const SNAP_KEY = (id: string) => `import_costs_planilha_${id}`;

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
  const desembolsoTotal = base + tributos + totalDespesas;
  return { tributos, desembolsoTotal };
}

function readJSON<T>(key: string): T | null {
  try { const ls = (globalThis as any).localStorage as Storage | undefined; if (!ls) return null; const raw = ls.getItem(key); return raw ? JSON.parse(raw) as T : null; } catch { return null; }
}
function writeJSON(key: string, value: any) {
  try { const ls = (globalThis as any).localStorage as Storage | undefined; if (!ls) return; ls.setItem(key, JSON.stringify(value)); } catch {}
}

@Injectable({ providedIn: 'root' })
export class LocalStoragePlanilhaCatalogRepository implements PlanilhaCatalogRepository {
  private subject = new BehaviorSubject<PlanilhaListItem[]>([]);

  constructor(){
    const index = readJSON<PlanilhaListItem[]>(INDEX_KEY);
    if(index && index.length){ this.subject.next(index); }
    else {
      const defaults: PlanilhaSnapshot = {
        premissas: { fobUsd: 46110, freteUsd: 2450, seguroUsd: 0, thcUsd: 0, taxaUsd: 5.55, quantidade: 1, ncm: '8423' },
        taxas: { ii: 14.4, ipi: 7.43, icms: 4, pis: 2.1, cofins: 10.65 },
        despesas: [
          { id: '1', categoria: 'Porto', item: 'THC - V3', valor: 1280 },
          { id: '2', categoria: 'Agência Marítima', item: 'Liberação de B/L - V3', valor: 900 },
          { id: '3', categoria: 'Agência Marítima', item: 'Frete Marítimo - V3', valor: 1450 }
        ],
        totalDespesas: 0,
        resumo: { tributos: 0, desembolsoDesembaraco: 0, desembolsoTotal: 0 }
      };
      const seed = ['Processo 2024/001','Processo 2024/002','Processo 2024/003'].map((proc, i) => {
        const id = typeof (globalThis as any).crypto?.randomUUID === 'function' ? (globalThis as any).crypto.randomUUID() : String(Date.now()+i);
        writeJSON(SNAP_KEY(id), defaults);
        const r = calcResumo(defaults.premissas, defaults.taxas, defaults.despesas);
        return { id, produto: 'Balança de Pesagem', cliente: `Cliente ${i+1}`, processo: proc, origem: 'China', dataSimulacao: new Date().toISOString(), tributos: r.tributos, desembolsoTotal: r.desembolsoTotal } as PlanilhaListItem;
      });
      this.subject.next(seed);
      writeJSON(INDEX_KEY, seed);
    }
  }

  list$(){ return this.subject.asObservable(); }

  getSnapshot(id: string): PlanilhaSnapshot | null {
    return readJSON<PlanilhaSnapshot>(SNAP_KEY(id));
  }

  createNew(meta?: Partial<Omit<PlanilhaListItem,'id'|'tributos'|'desembolsoTotal'>>): string {
    const id = typeof (globalThis as any).crypto?.randomUUID === 'function' ? (globalThis as any).crypto.randomUUID() : String(Date.now());
    const snap: PlanilhaSnapshot = {
      premissas: { fobUsd: 0, freteUsd: 0, seguroUsd: 0, thcUsd: 0, taxaUsd: 5.00, quantidade: 1, ncm: '' },
      taxas: { ii: 0, ipi: 0, icms: 0, pis: 0, cofins: 0 },
      despesas: [],
      totalDespesas: 0,
      resumo: { tributos: 0, desembolsoDesembaraco: 0, desembolsoTotal: 0 }
    };
    writeJSON(SNAP_KEY(id), snap);
    const list = this.subject.value.slice();
    const item: PlanilhaListItem = {
      id,
      produto: meta?.produto ?? 'Nova Simulação',
      cliente: meta?.cliente ?? '—',
      processo: meta?.processo ?? '—',
      origem: meta?.origem ?? 'China',
      dataSimulacao: new Date().toISOString(),
      tributos: 0,
      desembolsoTotal: 0,
    };
    list.unshift(item);
    this.subject.next(list);
    writeJSON(INDEX_KEY, list);
    return id;
  }

  duplicate(id: string): string | null {
    const snap = this.getSnapshot(id);
    if(!snap) return null;
    const newId = typeof (globalThis as any).crypto?.randomUUID === 'function' ? (globalThis as any).crypto.randomUUID() : String(Date.now());
    writeJSON(SNAP_KEY(newId), snap);
    const list = this.subject.value.slice();
    const src = list.find(x => x.id === id);
    if(!src) return null;
    const r = calcResumo(snap.premissas, snap.taxas, snap.despesas);
    const dup: PlanilhaListItem = { ...src, id: newId, processo: `${src.processo} • cópia`, dataSimulacao: new Date().toISOString(), tributos: r.tributos, desembolsoTotal: r.desembolsoTotal };
    list.unshift(dup);
    this.subject.next(list);
    writeJSON(INDEX_KEY, list);
    return newId;
  }

  remove(id: string): void {
    const list = this.subject.value.filter(x => x.id !== id);
    this.subject.next(list);
    writeJSON(INDEX_KEY, list);
    try { const ls = (globalThis as any).localStorage as Storage | undefined; ls?.removeItem(SNAP_KEY(id)); } catch {}
  }
}