import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Despesa, PlanilhaSnapshot, Premissas, Taxas } from '../../domain/planilha.models';
import { NumerarioLancamento, NumerarioStatus } from '../../domain/numerario.models';
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

@Injectable({ providedIn: 'root' })
export class StaticPlanilhaRepository implements PlanilhaRepository {
  private subject = new BehaviorSubject<PlanilhaSnapshot>({
    premissas: { fobUsd: 46110, freteUsd: 2450, seguroUsd: 0, thcUsd: 0, taxaUsd: 5.55, quantidade: 1, ncm: '8423', taxaEur: 0, pesoLiquido: 20043.67, quantProdutos: 13417, unidMedida: '1X40HC', estatistica: '', volume: 210.5997, fcl: 'FCL', incoterm: 'FOB', precoPeca: 0, porto: '', beneficioFiscal: 0 },
    taxas: { ii: 14.4, ipi: 7.43, icms: 4, pis: 2.1, cofins: 10.65 },
    despesas: [
      { id: '1', categoria: 'Porto', item: 'THC - V3', valor: 1280 },
      { id: '2', categoria: 'Agência Marítima', item: 'Liberação de B/L - V3', valor: 900 },
      { id: '3', categoria: 'Agência Marítima', item: 'Frete Marítimo - V3', valor: 1450 }
    ],
    totalDespesas: 0,
    resumo: { tributos: 0, desembolsoDesembaraco: 0, desembolsoTotal: 0 },
    numerario: []
  });

  constructor() {
    this.emit();
  }

  private emit() {
    const snap = this.subject.value;
    const r = calcResumo(snap.premissas, snap.taxas, snap.despesas);
    this.subject.next({ ...snap, totalDespesas: r.totalDespesas, resumo: {
      tributos: r.tributos, desembolsoDesembaraco: r.desembolsoDesembaraco, desembolsoTotal: r.desembolsoTotal
    }});
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
    const id = String(Date.now());
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
  adicionarNumerario(d: { valor: number; moeda: 'BRL'|'USD'|'EUR'; responsavel: string; observacao?: string }){
    const snap = this.subject.value;
    const id = String(Date.now());
    const novo: NumerarioLancamento = { id, processoId: '', valor: d.valor, moeda: d.moeda, responsavel: d.responsavel, observacao: d.observacao, data: new Date().toISOString(), status: 'Solicitado', trilha: [{ evento: 'Solicitado', data: new Date().toISOString() }] };
    const arr = [...(snap.numerario ?? [])];
    arr.unshift(novo);
    this.subject.next({ ...snap, numerario: arr });
    this.emit();
  }
  atualizarStatusNumerario(id: string, status: NumerarioStatus){
    const snap = this.subject.value;
    const arr = [...(snap.numerario ?? [])];
    const idx = arr.findIndex(x => x.id === id);
    if(idx < 0) return;
    const item = { ...arr[idx] } as NumerarioLancamento;
    item.status = status;
    item.trilha = [...item.trilha, { evento: status, data: new Date().toISOString() }];
    arr[idx] = item;
    this.subject.next({ ...snap, numerario: arr });
    this.emit();
  }
  removerNumerario(id: string){
    const snap = this.subject.value;
    const arr = (snap.numerario ?? []).filter(x => x.id !== id);
    this.subject.next({ ...snap, numerario: arr });
    this.emit();
  }
}