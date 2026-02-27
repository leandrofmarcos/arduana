import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { readJSON, writeJSON, randomId, keys, clearOrcamentos, deleteJSON } from '../data/storage.helper';
import { OrcamentoMeta, OrcamentoListItem } from '../models/orcamento.models';

@Injectable({ providedIn: 'root' })
export class OrcamentoService {
  private subj = new BehaviorSubject<OrcamentoListItem[]>(this.loadIndex());

  list$(): Observable<OrcamentoListItem[]> { return this.subj.asObservable(); }

  private loadIndex(): OrcamentoListItem[] {
    return readJSON<OrcamentoListItem[]>(keys.orcamentosIndex()) || [];
  }
  private saveIndex(items: OrcamentoListItem[]){ writeJSON(keys.orcamentosIndex(), items); }

  /**
   * Cria um orçamento, já garantindo entidades relacionadas (custo, venda, aduana) e importando packlist/template se fornecido.
   * @param clienteId ID do cliente
   * @param cliente Nome do cliente
   * @param codigo Código do orçamento
   * @param data Data de criação
   * @param templatePacklistId (Opcional) Template packlist associado ao cliente
   * @param packlistTemplate (Opcional) Array de itens do packlist/template
   * @param aliquotaPadrao (Opcional) Aliquota padrão para cálculo automático
   * @param tipoOrcamento (Opcional) Tipo do orçamento (Aéreo ou Marítimo)
   * @param despachanteId (Opcional) ID do despachante
   * @param despachante (Opcional) Nome do despachante
   */
  criar(
    clienteId: string,
    cliente?: string,
    codigo?: string,
    data?: string,
    templatePacklistId?: string,
    packlistTemplate?: any[],
    aliquotaPadrao?: number,
    tipoOrcamento: 'Aereo' | 'Maritimo' = 'Maritimo',
    despachanteId?: string,
    despachante?: string
  ) {
    const id = randomId();
    const createdAt = data ? new Date(data).toISOString() : new Date().toISOString();
    const codigoFinal = codigo || this.gerarCodigoOrcamento();
    const meta: OrcamentoMeta = {
      id,
      title: cliente ? `${cliente} • ${codigoFinal}`.trim() : 'Novo Orçamento',
      faseAtual: 'Orcamento',
      tipoOrcamento,
      createdAt,
      aprovado: false,
      oficializado: false,
      clienteId,
      despachanteId,
      templatePacklistId
    };
    writeJSON(keys.orcamento(id), meta);
    const item: OrcamentoListItem = {
      id,
      cliente,
      despachante,
      clienteId,
      despachanteId,
      tipoOrcamento,
      codigo: codigoFinal,
      data: meta.createdAt,
      status: 'CRIADO' as const,
      templatePacklistId
    };
    const next = [item, ...this.loadIndex()];
    this.saveIndex(next);
    this.subj.next(next);
    this.logHistory(id, { meta: null, item: null }, { meta, item });
    (globalThis as any).localStorage?.setItem(keys.currentId(), id);

    // Garante entidades relacionadas
    this.ensureCustoForOrcamento(id);
    this.ensureVendaForOrcamento(id);
    this.ensureAduanaForOrcamento(id);

    // Se houver packlist/template, importar e preencher custos automaticamente
    if (packlistTemplate && Array.isArray(packlistTemplate) && packlistTemplate.length > 0) {
      this.savePacklist(id, packlistTemplate);
      // Preencher custos automaticamente
      const despesas = packlistTemplate.map(item => ({
        codigo: item.codigo,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valorUnitario: item.valorUSD || 0,
        valorTotal: (item.quantidade || 0) * (item.valorUSD || 0),
        aliquota: aliquotaPadrao || 0,
        valorComAliquota: ((item.quantidade || 0) * (item.valorUSD || 0)) * (1 + (aliquotaPadrao || 0) / 100)
      }));
      this.saveCustoSnapshot(id, { premissas: {}, despesas });
      // Venda pode ser pré-calculada (exemplo: soma dos valores com aliquota)
      const vendaDespesas = despesas.map(d => ({ ...d }));
      this.saveVendaSnapshot(id, { premissas: {}, despesas: vendaDespesas });
    }
    return id;
  }

  private gerarCodigoOrcamento(): string {
    // Gera código no formato: ORC-DDMMYY-XXXX
    // Exemplo: ORC-250125-A7F2
    const hoje = new Date();
    const dd = String(hoje.getDate()).padStart(2, '0');
    const mm = String(hoje.getMonth() + 1).padStart(2, '0');
    const yy = String(hoje.getFullYear()).slice(-2);
    const sufixo = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORC-${dd}${mm}${yy}-${sufixo}`;
  }

  remover(id: string){
    const list = this.loadIndex().filter(x => x.id !== id);
    this.saveIndex(list);
    this.subj.next(list);
  }

  abrir(id: string){
    (globalThis as any).localStorage?.setItem(keys.currentId(), id);
  }

  getMeta(id: string): OrcamentoMeta | null {
    return readJSON<OrcamentoMeta>(keys.orcamento(id)) || null;
  }

  getListItem(id: string): OrcamentoListItem | null {
    const list = this.loadIndex();
    return list.find(x => x.id === id) || null;
  }

  update(id: string, data: Partial<OrcamentoMeta & OrcamentoListItem>): void {
    const meta = this.getMeta(id);
    if(meta){
      const nextMeta: OrcamentoMeta = { ...meta, ...data, id };
      writeJSON(keys.orcamento(id), nextMeta);
      this.logHistory(id, { meta, item: this.getListItem(id) }, { meta: nextMeta, item: { ...(this.getListItem(id) || {}), ...data, id } as any });
    }
    const list = this.loadIndex();
    const nextList = list.map(it => it.id === id ? { ...it, ...data, id } : it);
    this.saveIndex(nextList);
    this.subj.next(nextList);
  }

  private logHistory(id: string, before: { meta: OrcamentoMeta | null; item: OrcamentoListItem | null }, after: { meta: OrcamentoMeta | null; item: OrcamentoListItem | null }){
    const arr = readJSON<any[]>(keys.history(id)) || [];
    arr.push({ at: new Date().toISOString(), before, after });
    writeJSON(keys.history(id), arr);
  }

  getPacklist(id: string): any[] {
    return readJSON<any[]>(keys.packlist(id)) || [];
  }

  savePacklist(id: string, items: any[]): void {
    writeJSON(keys.packlist(id), items);
    const hasItems = items && items.length > 0;
    if(hasItems){
      const list = this.loadIndex();
      const before = this.getListItem(id);
      const nextList = list.map(it => it.id === id ? { ...it, status: 'Orçamento' as const } : it);
      this.saveIndex(nextList);
      this.subj.next(nextList);
      const meta = this.getMeta(id);
      if(meta){ this.logHistory(id, { meta, item: before || null }, { meta, item: this.getListItem(id) }); }
      this.ensureCustoForOrcamento(id);
    }
  }

  loadMockPacklist(): any[] {
    const existing = readJSON<any[]>(keys.packlistMock());
    if (existing && existing.length) return existing;
    const def: any[] = [
      { codigo: 'PROD-001', descricao: 'Produto A', quantidade: 10, pesoKg: 120, valorUSD: 2500, volumeM3: 1.2 },
      { codigo: 'PROD-002', descricao: 'Produto B', quantidade: 5, pesoKg: 80, valorUSD: 1800, volumeM3: 0.8 },
      { codigo: 'PROD-003', descricao: 'Produto C', quantidade: 20, pesoKg: 200, valorUSD: 3200, volumeM3: 1.8 }
    ];
    writeJSON(keys.packlistMock(), def);
    return def;
  }

  importMockToOrcamento(id: string): void {
    const items = this.loadMockPacklist();
    this.savePacklist(id, items);
  }

  listPacklists(): any[] {
    const list = readJSON<OrcamentoListItem[]>(keys.orcamentosIndex()) || [];
    return list
      .map((it: OrcamentoListItem) => ({ ...it, items: this.getPacklist(it.id).length }))
      .filter((it: any) => it.items > 0)
      .map((it: any) => ({ id: it.id, cliente: it.cliente, despachante: it.despachante, codigo: it.codigo, items: it.items }));
  }

  ensureCustoForOrcamento(id: string): void {
    const idx = (readJSON<any[]>(keys.custosIndex()) || []) as any[];
    if(idx.some(x => x.orcamentoId === id)) return;
    const proc = this.getListItem(id);
    const createdAt = new Date().toISOString();
    const novo = { id: randomId(), orcamentoId: id, codigo: proc?.codigo, cliente: proc?.cliente, despachante: proc?.despachante, createdAt };
    const next = [novo, ...idx];
    writeJSON(keys.custosIndex(), next);
  }

  listCustos(): { orcamentoId: string; codigo?: string; cliente?: string; despachante?: string; createdAt: string }[] {
    return (readJSON<any[]>(keys.custosIndex()) || []) as any[];
  }

  getCustoSnapshot(id: string): { premissas: any; despesas: any[] } | null {
    return readJSON<{ premissas: any; despesas: any[] }>(keys.custoSnapshot(id)) || null;
  }

  saveCustoSnapshot(id: string, data: { premissas: any; despesas: any[] }): void {
    const before = this.getCustoSnapshot(id);
    writeJSON(keys.custoSnapshot(id), data);
    const list = this.loadIndex();
    const beforeItem = this.getListItem(id);
    const nextList = list.map(it => it.id === id ? { ...it, status: 'Orçamento' as const } : it);
    this.saveIndex(nextList);
    this.subj.next(nextList);
    const arr = readJSON<any[]>(keys.history(id)) || [];
    arr.push({ at: new Date().toISOString(), type: 'CUSTO', before: { item: beforeItem, snapshot: before }, after: { item: this.getListItem(id), snapshot: data } });
    writeJSON(keys.history(id), arr);
  }

  ensureVendaForOrcamento(id: string): void {
    const idx = (readJSON<any[]>(keys.vendasIndex()) || []) as Array<{ id: string; orcamentoId: string; codigo?: string; cliente?: string; despachante?: string; createdAt: string }>;
    if(idx.some(x => x.orcamentoId === id)) return;
    const proc = this.getListItem(id);
    const createdAt = new Date().toISOString();
    const novo = { id: randomId(), orcamentoId: id, codigo: proc?.codigo, cliente: proc?.cliente, despachante: proc?.despachante, createdAt };
    const next = [novo, ...idx];
    writeJSON(keys.vendasIndex(), next);
  }

  listVendas(): { orcamentoId: string; codigo?: string; cliente?: string; despachante?: string; createdAt: string }[] {
    return (readJSON<any[]>(keys.vendasIndex()) || []) as any[];
  }

  getVendaSnapshot(id: string): { premissas: any; despesas: any[] } | null {
    return readJSON<{ premissas: any; despesas: any[] }>(keys.vendaSnapshot(id)) || null;
  }

  saveVendaSnapshot(id: string, data: { premissas: any; despesas: any[] }): void {
    const before = this.getVendaSnapshot(id);
    writeJSON(keys.vendaSnapshot(id), data);
    const list = this.loadIndex();
    const beforeItem = this.getListItem(id);
    const nextList = list.map(it => it.id === id ? { ...it, status: 'Em aprovação' as const } : it);
    this.saveIndex(nextList);
    this.subj.next(nextList);
    const arr = readJSON<any[]>(keys.history(id)) || [];
    arr.push({ at: new Date().toISOString(), type: 'VENDA', before: { item: beforeItem, snapshot: before }, after: { item: this.getListItem(id), snapshot: data } });
    writeJSON(keys.history(id), arr);
    this.ensureVendaForOrcamento(id);
  }

  ensureAduanaForOrcamento(id: string): void {
    const idx = (readJSON<any[]>(keys.aduanaIndex()) || []) as Array<{ id: string; orcamentoId: string; codigo?: string; cliente?: string; despachante?: string; createdAt: string }>;
    if(idx.some(x => x.orcamentoId === id)) return;
    const proc = this.getListItem(id);
    const createdAt = new Date().toISOString();
    const novo = { id: randomId(), orcamentoId: id, codigo: proc?.codigo, cliente: proc?.cliente, despachante: proc?.despachante, createdAt };
    const next = [novo, ...idx];
    writeJSON(keys.aduanaIndex(), next);
  }

  listAduanas(): Array<{ orcamentoId: string; codigo?: string; cliente?: string; despachante?: string; createdAt: string }>{
    return (readJSON<any[]>(keys.aduanaIndex()) || []) as any[];
  }

  limparTodos(): void {
    clearOrcamentos();
    this.subj.next([]);
  }
}
