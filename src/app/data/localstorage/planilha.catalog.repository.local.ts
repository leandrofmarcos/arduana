import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { PlanilhaCatalogRepository, PlanilhaListItem } from '../../domain/planilha.catalog';
import { PlanilhaSnapshot, Premissas, Taxas, Despesa } from '../../domain/planilha.models';
import { PlanilhaTemplateService } from '../../core/templates/planilha.template.service';

const INDEX_KEY = 'import_costs_catalog_index';
const SNAP_KEY = (id: string) => `import_costs_planilha_${id}`;
const VERSIONS_KEY = (id: string) => `import_costs_versions_${id}`;
const SNAP_VER_KEY = (id: string, vid: string) => `import_costs_planilha_${id}_${vid}`;

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

  constructor(private templates: PlanilhaTemplateService){
    const index = readJSON<PlanilhaListItem[]>(INDEX_KEY);
    if(index && index.length){
      const migrated = index.map(i => ({ ...i, status: i.status ?? 'Ativo', versionsCount: i.versionsCount ?? (readJSON<any[]>(VERSIONS_KEY(i.id))?.length || 0) }));
      this.subject.next(migrated);
      writeJSON(INDEX_KEY, migrated);
    }
    else {
      const defaults: PlanilhaSnapshot = this.templates.defaultSnapshot();
      const seed = ['Processo 2024/001','Processo 2024/002','Processo 2024/003'].map((proc, i) => {
        const id = typeof (globalThis as any).crypto?.randomUUID === 'function' ? (globalThis as any).crypto.randomUUID() : String(Date.now()+i);
        writeJSON(SNAP_KEY(id), defaults);
        const vid = String(Date.now());
        writeJSON(VERSIONS_KEY(id), [{ id: vid, fase: 'Orcamento', createdAt: new Date().toISOString() }]);
        writeJSON(SNAP_VER_KEY(id, vid), defaults);
        const r = calcResumo(defaults.premissas, defaults.taxas, defaults.despesas);
        const statuses: PlanilhaListItem['status'][] = ['Ativo','Finalizado','Rascunho'];
        return { id, produto: 'Balança de Pesagem', cliente: `Cliente ${i+1}`, processo: proc, origem: 'China', dataSimulacao: new Date().toISOString(), tributos: r.tributos, desembolsoTotal: r.desembolsoTotal, status: statuses[i % statuses.length], faseAtual: 'Orcamento', faseDates: { Orcamento: { start: new Date().toISOString() } }, versionsCount: 1 } as PlanilhaListItem;
      });
      this.subject.next(seed);
      writeJSON(INDEX_KEY, seed);
    }
  }

  list$(){ return this.subject.asObservable(); }

  getSnapshot(id: string): PlanilhaSnapshot | null {
    return readJSON<PlanilhaSnapshot>(SNAP_KEY(id));
  }

  getMeta(id: string): PlanilhaListItem | null {
    const list = readJSON<PlanilhaListItem[]>(INDEX_KEY) || [];
    return list.find(x => x.id === id) || null;
  }

  getVersions(id: string){
    return readJSON<Array<{ id: string; fase: string; createdAt: string }>>(VERSIONS_KEY(id)) || [];
  }

  getVersionSnapshot(id: string, versionId: string){
    return readJSON<PlanilhaSnapshot>(`import_costs_planilha_${id}_${versionId}`);
  }

  createNew(meta?: Partial<Omit<PlanilhaListItem,'id'|'tributos'|'desembolsoTotal'>>): string {
    const id = typeof (globalThis as any).crypto?.randomUUID === 'function' ? (globalThis as any).crypto.randomUUID() : String(Date.now());
    const snap: PlanilhaSnapshot = this.templates.defaultSnapshot();
    writeJSON(SNAP_KEY(id), snap);
    const vid = String(Date.now());
    writeJSON(VERSIONS_KEY(id), [{ id: vid, fase: 'Orcamento', createdAt: new Date().toISOString() }]);
    writeJSON(SNAP_VER_KEY(id, vid), snap);
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
      status: 'Rascunho',
      faseAtual: 'Orcamento',
      faseDates: { Orcamento: { start: new Date().toISOString() } },
      versionsCount: 1,
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
    const versions = readJSON<any[]>(VERSIONS_KEY(id)) || [];
    writeJSON(VERSIONS_KEY(newId), versions);
    versions.forEach(v => { const snapv = readJSON<PlanilhaSnapshot>(SNAP_VER_KEY(id, v.id)); if(snapv){ writeJSON(SNAP_VER_KEY(newId, v.id), snapv); } });
    const list = this.subject.value.slice();
    const src = list.find(x => x.id === id);
    if(!src) return null;
    const r = calcResumo(snap.premissas, snap.taxas, snap.despesas);
    const dup: PlanilhaListItem = { ...src, id: newId, processo: `${src.processo} • cópia`, dataSimulacao: new Date().toISOString(), tributos: r.tributos, desembolsoTotal: r.desembolsoTotal, status: 'Rascunho', versionsCount: versions.length };
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

  update(id: string, data: Partial<Omit<PlanilhaListItem,'id'>>): void {
    const list = this.subject.value.slice();
    const idx = list.findIndex(x => x.id === id);
    if (idx < 0) return;
    const merged = { ...list[idx], ...data } as PlanilhaListItem;
    list[idx] = merged;
    this.subject.next(list);
    writeJSON(INDEX_KEY, list);
  }

  setSnapshot(id: string, snap: PlanilhaSnapshot): void {
    writeJSON(SNAP_KEY(id), snap);
    const versions = readJSON<any[]>(VERSIONS_KEY(id)) || [];
    const fase = this.subject.value.find(x => x.id === id)?.faseAtual || 'Orcamento';
    const entry = { id: typeof (globalThis as any).crypto?.randomUUID === 'function' ? (globalThis as any).crypto.randomUUID() : String(Date.now()), fase, createdAt: new Date().toISOString() };
    versions.push(entry);
    writeJSON(VERSIONS_KEY(id), versions);
    writeJSON(SNAP_VER_KEY(id, entry.id), snap);
    const list = this.subject.value.slice();
    const idx = list.findIndex(x => x.id === id);
    if(idx >= 0){ list[idx] = { ...list[idx], versionsCount: versions.length } as PlanilhaListItem; this.subject.next(list); writeJSON(INDEX_KEY, list); }
  }
}