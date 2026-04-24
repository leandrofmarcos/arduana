import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiClientService } from '../../../../core/api/client/api-client.service';
import {
  OrcamentoVenda, OrcamentoVendaDespesa, OrcamentoVendaDespesaExtra, OrcamentoVendaCusto
} from '../models/orcamento-venda.models';

// ── DTO interfaces ────────────────────────────────────────────────────────────

interface OrcamentoVendaListApiDto {
  id: number;
  codigoInterno: string;
  clienteId: number | null;
  solicitacaoOrcamentoId: number | null;
  data: string;
  tamContainer: string;
  pesoBruto: number;
  pesoLiquido: number;
  totalGeral: number;
  status: string;
  versao: number;
  versaoAnteriorId?: number | null;
  imutavel: boolean;
  criadoEm: string;
  atualizadoEm: string;
}

interface OrcamentoVendaApiDto extends OrcamentoVendaListApiDto {
  freteInternacional: number;
  cifReais: number;
  cifUsd: number;
  fobReais: number;
  fobUsd: number;
  taxaUsd: number;
  honorarios: number;
  totalImpostos: number;
  totalDespesas: number;
  totalExtras: number;
  observacao: string | null;
  despesas: OrcamentoVendaDespesaApiDto[];
  extras: OrcamentoVendaDespesaApiDto[];
  custos: OrcamentoVendaCustoApiDto[];
}

interface OrcamentoVendaDespesaApiDto {
  id: number;
  orcamentoVendaId: number;
  descricao: string;
  valor: number;
  criadoEm: string;
  atualizadoEm: string;
}

interface OrcamentoVendaCustoApiDto {
  id: number;
  orcamentoVendaId: number;
  custoDespachanteId: number;
  custoCodigoInterno: string;
  custoStatus: string;
  criadoEm: string;
  atualizadoEm: string;
}

@Injectable({ providedIn: 'root' })
export class OrcamentoVendaService {

  private orcamentos: OrcamentoVenda[] = [];
  private despesasMap: Record<string, OrcamentoVendaDespesa[]> = {};
  private extrasMap: Record<string, OrcamentoVendaDespesaExtra[]> = {};
  private custosMap: Record<string, OrcamentoVendaCusto[]> = {};

  private _loadPromise: Promise<void>;

  constructor(private apiClient: ApiClientService) {
    this._loadPromise = this.refresh();
  }

  async ensureLoaded(): Promise<void> {
    return this._loadPromise;
  }

  async refresh(): Promise<void> {
    const page = await firstValueFrom(
      this.apiClient.getList<OrcamentoVendaListApiDto>('orcamentos-venda', { page: 1, pageSize: 500 })
    );
    const arr: OrcamentoVendaListApiDto[] = page.items ?? [];

    this.orcamentos = arr.map(dto => this._mapOrcamento(dto));

    // Load full detail for each to populate sub-collections
    await Promise.all(this.orcamentos.map(o => this._loadDetail(Number(o.id))));
  }

  private async _loadDetail(id: number): Promise<void> {
    const dto = await firstValueFrom(
      this.apiClient.get<OrcamentoVendaApiDto>(`orcamentos-venda/${id}`)
    );
    const strId = String(dto.id);

    // Update full orcamento in list
    const idx = this.orcamentos.findIndex(o => o.id === strId);
    const full = this._mapOrcamentoFull(dto);
    if (idx >= 0) this.orcamentos[idx] = full;
    else this.orcamentos.push(full);

    this.despesasMap[strId] = (dto.despesas ?? []).map(d => this._mapDespesa(d));
    this.extrasMap[strId]   = (dto.extras ?? []).map(e => this._mapExtra(e));
    this.custosMap[strId]   = (dto.custos ?? []).map(c => this._mapCusto(c));
  }

  // ── Sync getters ──────────────────────────────────────────────────────

  getAll(): OrcamentoVenda[] { return [...this.orcamentos]; }

  getAllCurrent(): OrcamentoVenda[] {
    const previousIds = new Set(
      this.orcamentos
        .map(o => o.versaoAnteriorId != null ? String(o.versaoAnteriorId) : '')
        .filter(Boolean)
    );
    return this.orcamentos.filter(o => !previousIds.has(o.id));
  }

  isCurrentVersion(orcamentoId: string): boolean {
    const previousIds = new Set(
      this.orcamentos
        .map(o => o.versaoAnteriorId != null ? String(o.versaoAnteriorId) : '')
        .filter(Boolean)
    );
    return !previousIds.has(orcamentoId);
  }

  getCurrentVersion(id: string): OrcamentoVenda | undefined {
    let current = this.getById(id);
    if (!current) return undefined;

    while (true) {
      const next = this.orcamentos.find(o => String(o.versaoAnteriorId ?? '') === current!.id);
      if (!next) return current;
      current = next;
    }
  }

  getVersionChain(id: string): OrcamentoVenda[] {
    const all = this.orcamentos;
    const start = all.find(o => o.id === id);
    if (!start) return [];

    let root = start;
    while (root.versaoAnteriorId != null) {
      const prev = all.find(o => o.id === String(root.versaoAnteriorId));
      if (!prev) break;
      root = prev;
    }

    const chain: OrcamentoVenda[] = [];
    let cursor: OrcamentoVenda | undefined = root;
    while (cursor) {
      chain.push(cursor);
      cursor = all.find(o => String(o.versaoAnteriorId ?? '') === cursor!.id);
    }

    return [...chain].sort((a, b) => b.versao - a.versao);
  }

  getVersionCount(id: string): number {
    return this.getVersionChain(id).length;
  }

  getById(id: string): OrcamentoVenda | undefined {
    return this.orcamentos.find(o => o.id === id);
  }

  getBySolicitacao(solicitacaoId: string): OrcamentoVenda[] {
    return this.orcamentos.filter(o => o.solicitacaoOrcamentoId === solicitacaoId);
  }

  getDespesas(orcamentoVendaId: string): OrcamentoVendaDespesa[] {
    return this.despesasMap[orcamentoVendaId] ?? [];
  }

  getExtras(orcamentoVendaId: string): OrcamentoVendaDespesaExtra[] {
    return this.extrasMap[orcamentoVendaId] ?? [];
  }

  getOrcCustos(orcamentoVendaId: string): OrcamentoVendaCusto[] {
    return this.custosMap[orcamentoVendaId] ?? [];
  }

  // ── CRUD async ────────────────────────────────────────────────────────

  async create(data: {
    clienteId?: string;
    solicitacaoOrcamentoId?: string;
    data: string;
    tamContainer: string;
    pesoBruto: number;
    pesoLiquido: number;
    freteInternacional: number;
    cifReais: number;
    cifUsd: number;
    fobReais: number;
    fobUsd: number;
    taxaUsd: number;
    honorarios: number;
    totalImpostos: number;
    totalDespesas: number;
    totalExtras: number;
    totalGeral: number;
    observacao?: string;
  }): Promise<OrcamentoVenda> {
    const dto = await firstValueFrom(
      this.apiClient.post<OrcamentoVendaApiDto>('orcamentos-venda', {
      clienteId:              data.clienteId ? Number(data.clienteId) : null,
      solicitacaoOrcamentoId: data.solicitacaoOrcamentoId ? Number(data.solicitacaoOrcamentoId) : null,
      data:                   data.data,
      tamContainer:           data.tamContainer,
      pesoBruto:              data.pesoBruto,
      pesoLiquido:            data.pesoLiquido,
      freteInternacional:     data.freteInternacional,
      cifReais:               data.cifReais,
      cifUsd:                 data.cifUsd,
      fobReais:               data.fobReais,
      fobUsd:                 data.fobUsd,
      taxaUsd:                data.taxaUsd,
      honorarios:             data.honorarios,
      totalImpostos:          data.totalImpostos,
      totalDespesas:          data.totalDespesas,
      totalExtras:            data.totalExtras,
      totalGeral:             data.totalGeral,
      observacao:             data.observacao ?? null,
    }));
    await this._loadDetail(dto.id);
    return this.getById(String(dto.id))!;
  }

  async update(item: OrcamentoVenda): Promise<OrcamentoVenda> {
    const dto = await firstValueFrom(
      this.apiClient.put<OrcamentoVendaApiDto>(`orcamentos-venda/${Number(item.id)}`, {
      clienteId:          item.clienteId ? Number(item.clienteId) : null,
      data:               item.data,
      tamContainer:       item.tamContainer,
      pesoBruto:          item.pesoBruto,
      pesoLiquido:        item.pesoLiquido,
      freteInternacional: item.freteInternacional,
      cifReais:           item.cifReais,
      cifUsd:             item.cifUsd,
      fobReais:           item.fobReais,
      fobUsd:             item.fobUsd,
      taxaUsd:            item.taxaUsd,
      honorarios:         item.honorarios,
      totalImpostos:      item.totalImpostos,
      totalDespesas:      item.totalDespesas,
      totalExtras:        item.totalExtras,
      totalGeral:         item.totalGeral,
      observacao:         item.observacao ?? null,
    }));
    await this._loadDetail(dto.id);
    return this.getById(String(dto.id))!;
  }

  async finalizar(id: string): Promise<OrcamentoVenda> {
    const dto = await firstValueFrom(
      this.apiClient.patch<OrcamentoVendaApiDto>(`orcamentos-venda/${Number(id)}/finalizar`, {})
    );
    await this._loadDetail(dto.id);
    return this.getById(String(dto.id))!;
  }

  async cancelar(id: string): Promise<OrcamentoVenda> {
    const dto = await firstValueFrom(
      this.apiClient.patch<OrcamentoVendaApiDto>(`orcamentos-venda/${Number(id)}/cancelar`, {})
    );
    await this._loadDetail(dto.id);
    return this.getById(String(dto.id))!;
  }

  async reabrir(id: string): Promise<OrcamentoVenda> {
    const dto = await firstValueFrom(
      this.apiClient.patch<OrcamentoVendaApiDto>(`orcamentos-venda/${Number(id)}/reabrir`, {})
    );
    await this.refresh();
    return this.getById(String(dto.id))!;
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.apiClient.delete<void>(`orcamentos-venda/${Number(id)}`));
    this.orcamentos = this.orcamentos.filter(o => o.id !== id);
    delete this.despesasMap[id];
    delete this.extrasMap[id];
    delete this.custosMap[id];
  }

  // ── Despesas ──────────────────────────────────────────────────────────

  async replaceDespesas(ovId: string, lista: { descricao: string; valor: number }[]): Promise<OrcamentoVendaDespesa[]> {
    const existing = this.getDespesas(ovId);
    for (const d of existing) {
      await firstValueFrom(this.apiClient.delete<void>(`orcamentos-venda/${Number(ovId)}/despesas/${Number(d.id)}`));
    }
    const result: OrcamentoVendaDespesa[] = [];
    for (const item of lista) {
      const dto = await firstValueFrom(
        this.apiClient.post<OrcamentoVendaDespesaApiDto>(`orcamentos-venda/${Number(ovId)}/despesas`, {
          descricao: item.descricao,
          valor:     item.valor,
        })
      );
      result.push(this._mapDespesa(dto));
    }
    this.despesasMap[ovId] = result;
    return result;
  }

  // ── Extras ────────────────────────────────────────────────────────────

  async replaceExtras(ovId: string, lista: { descricao: string; valor: number }[]): Promise<OrcamentoVendaDespesaExtra[]> {
    const existing = this.getExtras(ovId);
    for (const e of existing) {
      await firstValueFrom(this.apiClient.delete<void>(`orcamentos-venda/${Number(ovId)}/extras/${Number(e.id)}`));
    }
    const result: OrcamentoVendaDespesaExtra[] = [];
    for (const item of lista) {
      const dto = await firstValueFrom(
        this.apiClient.post<OrcamentoVendaDespesaApiDto>(`orcamentos-venda/${Number(ovId)}/extras`, {
          descricao: item.descricao,
          valor:     item.valor,
        })
      );
      result.push(this._mapExtra(dto));
    }
    this.extrasMap[ovId] = result;
    return result;
  }

  // ── Custos vinculados ─────────────────────────────────────────────────

  async replaceOrcCustos(ovId: string, custoIds: string[]): Promise<OrcamentoVendaCusto[]> {
    const existing = this.getOrcCustos(ovId);
    for (const c of existing) {
      await firstValueFrom(this.apiClient.delete<void>(`orcamentos-venda/${Number(ovId)}/custos/${Number(c.id)}`));
    }
    const result: OrcamentoVendaCusto[] = [];
    for (const custoId of custoIds) {
      const dto = await firstValueFrom(
        this.apiClient.post<OrcamentoVendaCustoApiDto>(`orcamentos-venda/${Number(ovId)}/custos`, {
          custoDespachanteId: Number(custoId),
        })
      );
      result.push(this._mapCusto(dto));
    }
    this.custosMap[ovId] = result;
    return result;
  }

  // ── Mappers ───────────────────────────────────────────────────────────

  private _mapOrcamento(dto: OrcamentoVendaListApiDto): OrcamentoVenda {
    return {
      id:                     String(dto.id),
      codigoInterno:          dto.codigoInterno,
      clienteId:              dto.clienteId ? String(dto.clienteId) : '',
      solicitacaoOrcamentoId: dto.solicitacaoOrcamentoId ? String(dto.solicitacaoOrcamentoId) : undefined,
      data:                   typeof dto.data === 'string' ? dto.data.split('T')[0] : dto.data,
      tamContainer:           dto.tamContainer,
      pesoBruto:              dto.pesoBruto,
      pesoLiquido:            dto.pesoLiquido,
      freteInternacional:     0,
      cifReais:               0,
      cifUsd:                 0,
      fobReais:               0,
      fobUsd:                 0,
      taxaUsd:                0,
      honorarios:             0,
      totalImpostos:          0,
      totalDespesas:          0,
      totalExtras:            0,
      totalGeral:             dto.totalGeral,
      status:                 (dto.status as any),
      versao:                 dto.versao,
      versaoAnteriorId:       dto.versaoAnteriorId ?? undefined,
      imutavel:               dto.imutavel,
    };
  }

  private _mapOrcamentoFull(dto: OrcamentoVendaApiDto): OrcamentoVenda {
    return {
      id:                     String(dto.id),
      codigoInterno:          dto.codigoInterno,
      clienteId:              dto.clienteId ? String(dto.clienteId) : '',
      solicitacaoOrcamentoId: dto.solicitacaoOrcamentoId ? String(dto.solicitacaoOrcamentoId) : undefined,
      data:                   typeof dto.data === 'string' ? dto.data.split('T')[0] : dto.data,
      tamContainer:           dto.tamContainer,
      pesoBruto:              dto.pesoBruto,
      pesoLiquido:            dto.pesoLiquido,
      freteInternacional:     dto.freteInternacional,
      cifReais:               dto.cifReais,
      cifUsd:                 dto.cifUsd,
      fobReais:               dto.fobReais,
      fobUsd:                 dto.fobUsd,
      taxaUsd:                dto.taxaUsd,
      honorarios:             dto.honorarios,
      totalImpostos:          dto.totalImpostos,
      totalDespesas:          dto.totalDespesas,
      totalExtras:            dto.totalExtras,
      totalGeral:             dto.totalGeral,
      observacao:             dto.observacao ?? undefined,
      status:                 (dto.status as any),
      versao:                 dto.versao,
      versaoAnteriorId:       dto.versaoAnteriorId ?? undefined,
      imutavel:               dto.imutavel,
    };
  }

  private _mapDespesa(dto: OrcamentoVendaDespesaApiDto): OrcamentoVendaDespesa {
    return {
      id:               String(dto.id),
      orcamentoVendaId: String(dto.orcamentoVendaId),
      descricao:        dto.descricao,
      valor:            dto.valor,
    };
  }

  private _mapExtra(dto: OrcamentoVendaDespesaApiDto): OrcamentoVendaDespesaExtra {
    return {
      id:               String(dto.id),
      orcamentoVendaId: String(dto.orcamentoVendaId),
      descricao:        dto.descricao,
      valor:            dto.valor,
    };
  }

  private _mapCusto(dto: OrcamentoVendaCustoApiDto): OrcamentoVendaCusto {
    return {
      id:                 String(dto.id),
      orcamentoVendaId:   String(dto.orcamentoVendaId),
      custoDespachanteId: String(dto.custoDespachanteId),
    };
  }
}
