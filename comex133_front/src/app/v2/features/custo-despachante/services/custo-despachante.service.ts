import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiClientService } from '../../../../core/api/client/api-client.service';
import {
  CustoDespachante, CustoDespachanteLi, CustoDespachanteDespesa,
  NcmVinculadoOrcamento, ValorImposto, StatusCustoDespachante
} from '../models/custo-despachante.models';

// ── API DTOs ──────────────────────────────────────────────────────────────────

interface CustoDespachanteApiDto {
  id: number;
  codigoInterno: string;
  solicitacaoOrcamentoId?: number | null;
  despachanteId: number;
  importadorId?: number | null;
  portoOrigemId: number;
  portoDestinoId: number;
  responsavel: string;
  tamContainer: string;
  peso: number;
  fobUsd: number;
  fobReais: number;
  cifUsd: number;
  cifReais: number;
  seguroUsd: number;
  freteInternacionalUsd: number;
  taxaUsd: number;
  taxaUsdAgente?: number | null;
  observacao?: string | null;
  data: string;
  status: string;
  versao: number;
  versaoAnteriorId?: number | null;
  imutavel: boolean;
  lis?: CustoDespachanteLiApiDto[];
  despesas?: CustoDespachanteDespesaApiDto[];
  ncms?: NcmVinculadoCustoApiDto[];
}

interface CustoDespachanteLiApiDto {
  id: number;
  custoDespachanteId: number;
  ncm: string;
  descricao: string;
  valor: number;
  data: string;
}

interface CustoDespachanteDespesaApiDto {
  id: number;
  custoDespachanteId: number;
  descricao: string;
  valor: number;
  data: string;
  entraBaseIcms: boolean;
}

interface NcmVinculadoCustoApiDto {
  id: number;
  custoDespachanteId: number;
  ncmId?: number | null;
  numeroNcm: string;
  descricao: string;
  aliIi: number;
  aliIpi: number;
  aliPis: number;
  aliCofins: number;
  aliIcms: number;
  baseCalculo: number;
  valoresImposto?: ValorImpostoCustoApiDto[];
}

interface ValorImpostoCustoApiDto {
  id: number;
  ncmVinculadoCustoId: number;
  aliIi: number; valorIi: number;
  aliIpi: number; valorIpi: number;
  aliPis: number; valorPis: number;
  aliCofins: number; valorCofins: number;
  aliIcms: number; valorIcms: number;
  totalImpostos: number;
}

@Injectable({ providedIn: 'root' })
export class CustoDespachanteService {

  private custos: CustoDespachante[] = [];
  private lisMap: Record<string, CustoDespachanteLi[]> = {};
  private despesasMap: Record<string, CustoDespachanteDespesa[]> = {};
  private ncmsMap: Record<string, NcmVinculadoOrcamento[]> = {};
  private valoresMap: Record<string, ValorImposto[]> = {};

  private _loadPromise: Promise<void> | null = null;

  constructor(private apiClient: ApiClientService) {
    this._loadPromise = this.refresh();
  }

  async ensureLoaded(): Promise<void> {
    if (this._loadPromise) await this._loadPromise;
  }

  async refresh(): Promise<void> {
    const result = await firstValueFrom(
      this.apiClient.getList<CustoDespachanteApiDto>('/custos-despachante', { page: 1, pageSize: 500 })
    );
    const items = result.items ?? [];
    this.lisMap = {};
    this.despesasMap = {};
    this.ncmsMap = {};
    this.valoresMap = {};
    if (items.length === 0) {
      this.custos = [];
      this._loadPromise = null;
      return;
    }
    const details = await Promise.all(
      items.map(item =>
        firstValueFrom(this.apiClient.get<CustoDespachanteApiDto>(`/custos-despachante/${item.id}`))
      )
    );
    this.custos = details.map(dto => this._mapCusto(dto));
    details.forEach(dto => this._cacheDetail(dto));
    this._loadPromise = null;
  }

  async loadDetail(id: string): Promise<void> {
    const dto = await firstValueFrom(
      this.apiClient.get<CustoDespachanteApiDto>(`/custos-despachante/${id}`)
    );
    const mapped = this._mapCusto(dto);
    const idx = this.custos.findIndex(c => c.id === id);
    if (idx >= 0) this.custos[idx] = mapped;
    else this.custos = [mapped, ...this.custos];
    this._cacheDetail(dto);
  }

  private _cacheDetail(dto: CustoDespachanteApiDto): void {
    const id = String(dto.id);
    this.lisMap[id] = (dto.lis ?? []).map(li => this._mapLi(li));
    this.despesasMap[id] = (dto.despesas ?? []).map(d => this._mapDespesa(d));
    this.ncmsMap[id] = (dto.ncms ?? []).map(n => this._mapNcm(n));
    (dto.ncms ?? []).forEach(n => {
      this.valoresMap[String(n.id)] = (n.valoresImposto ?? []).map(v => this._mapValorImposto(v));
    });
  }

  // ── Sync getters (from cache) ─────────────────────────────────────────────

  getAll(): CustoDespachante[] { return this.custos; }

  getAllCurrent(): CustoDespachante[] {
    const previousIds = new Set(
      this.custos
        .map(c => c.versaoAnteriorId != null ? String(c.versaoAnteriorId) : '')
        .filter(Boolean)
    );
    return this.custos.filter(c => !previousIds.has(c.id));
  }

  isCurrentVersion(custoId: string): boolean {
    const previousIds = new Set(
      this.custos
        .map(c => c.versaoAnteriorId != null ? String(c.versaoAnteriorId) : '')
        .filter(Boolean)
    );
    return !previousIds.has(custoId);
  }

  getVersionHistory(codigoInterno: string): CustoDespachante[] {
    return this.custos
      .filter(c => c.codigoInterno === codigoInterno)
      .sort((a, b) => b.versao - a.versao);
  }

  getCurrentVersion(id: string): CustoDespachante | undefined {
    let current = this.getById(id);
    if (!current) return undefined;

    while (true) {
      const next = this.custos.find(c => String(c.versaoAnteriorId ?? '') === current!.id);
      if (!next) return current;
      current = next;
    }
  }

  getVersionChain(id: string): CustoDespachante[] {
    const all = this.custos;
    const start = all.find(c => c.id === id);
    if (!start) return [];

    let root = start;
    while (root.versaoAnteriorId != null) {
      const prev = all.find(c => c.id === String(root.versaoAnteriorId));
      if (!prev) break;
      root = prev;
    }

    const chain: CustoDespachante[] = [];
    let cursor: CustoDespachante | undefined = root;
    while (cursor) {
      chain.push(cursor);
      cursor = all.find(c => String(c.versaoAnteriorId ?? '') === cursor!.id);
    }

    return [...chain].sort((a, b) => b.versao - a.versao);
  }

  getVersionCount(id: string): number {
    return this.getVersionChain(id).length;
  }

  getById(id: string): CustoDespachante | undefined {
    return this.custos.find(c => c.id === id);
  }

  getLis(custoId: string): CustoDespachanteLi[] {
    return this.lisMap[custoId] ?? [];
  }

  getDespesas(custoId: string): CustoDespachanteDespesa[] {
    return this.despesasMap[custoId] ?? [];
  }

  getNcmsVinculados(custoId: string): NcmVinculadoOrcamento[] {
    return this.ncmsMap[custoId] ?? [];
  }

  getValoresImposto(ncmVinculadoId: string): ValorImposto[] {
    return this.valoresMap[ncmVinculadoId] ?? [];
  }

  // ── Async CRUD ────────────────────────────────────────────────────────────

  async create(data: {
    despachanteId: string; importadorId?: string; portoOrigemId: string;
    portoDestinoId: string; responsavel: string; tamContainer: string; peso: number;
    fobUsd: number; fobReais: number; cifUsd: number; cifReais: number;
    seguroUsd: number; freteInternacionalUsd: number; taxaUsd: number; taxaUsdAgente?: number; observacao?: string;
    data: string; solicitacaoOrcamentoId?: string;
  }): Promise<CustoDespachante> {
    const dto = await firstValueFrom(
      this.apiClient.post<CustoDespachanteApiDto>('/custos-despachante', {
        solicitacaoOrcamentoId: data.solicitacaoOrcamentoId ? Number(data.solicitacaoOrcamentoId) : null,
        despachanteId: Number(data.despachanteId),
        importadorId: data.importadorId ? Number(data.importadorId) : null,
        portoOrigemId: Number(data.portoOrigemId),
        portoDestinoId: Number(data.portoDestinoId),
        responsavel: data.responsavel,
        tamContainer: data.tamContainer,
        peso: data.peso,
        fobUsd: data.fobUsd,
        fobReais: data.fobReais,
        cifUsd: data.cifUsd,
        cifReais: data.cifReais,
        seguroUsd: data.seguroUsd,
        freteInternacionalUsd: data.freteInternacionalUsd,
        taxaUsd: data.taxaUsd,
        taxaUsdAgente: data.taxaUsdAgente ?? null,
        observacao: data.observacao ?? null,
        data: data.data
      })
    );
    const mapped = this._mapCusto(dto);
    this.custos = [mapped, ...this.custos];
    this._cacheDetail(dto);
    return mapped;
  }

  async update(item: CustoDespachante): Promise<CustoDespachante> {
    const dto = await firstValueFrom(
      this.apiClient.put<CustoDespachanteApiDto>(`/custos-despachante/${item.id}`, {
        importadorId: item.importadorId ? Number(item.importadorId) : null,
        portoOrigemId: Number(item.portoOrigemId),
        portoDestinoId: Number(item.portoDestinoId),
        responsavel: item.responsavel,
        tamContainer: item.tamContainer,
        peso: item.peso,
        fobUsd: item.fobUsd,
        fobReais: item.fobReais,
        cifUsd: item.cifUsd,
        cifReais: item.cifReais,
        seguroUsd: item.seguroUsd,
        freteInternacionalUsd: item.freteInternacionalUsd,
        taxaUsd: item.taxaUsd,
        taxaUsdAgente: item.taxaUsdAgente ?? null,
        observacao: item.observacao ?? null,
        data: item.data
      })
    );
    const mapped = this._mapCusto(dto);
    this.custos = this.custos.map(c => c.id === mapped.id ? mapped : c);
    this._cacheDetail(dto);
    return mapped;
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.apiClient.delete(`/custos-despachante/${id}`));
    this.ncmsMap[id]?.forEach(ncm => delete this.valoresMap[ncm.id]);
    delete this.lisMap[id];
    delete this.despesasMap[id];
    delete this.ncmsMap[id];
    this.custos = this.custos.filter(c => c.id !== id);
  }

  async iniciar(id: string): Promise<CustoDespachante> {
    const dto = await firstValueFrom(
      this.apiClient.patch<CustoDespachanteApiDto>(`/custos-despachante/${id}/iniciar`, {})
    );
    const mapped = this._mapCusto(dto);
    this.custos = this.custos.map(c => c.id === mapped.id ? mapped : c);
    this._cacheDetail(dto);
    return mapped;
  }

  async finalizar(id: string): Promise<CustoDespachante> {
    const dto = await firstValueFrom(
      this.apiClient.patch<CustoDespachanteApiDto>(`/custos-despachante/${id}/finalizar`, {})
    );
    const mapped = this._mapCusto(dto);
    this.custos = this.custos.map(c => c.id === mapped.id ? mapped : c);
    this._cacheDetail(dto);
    return mapped;
  }

  async reabrir(id: string): Promise<CustoDespachante> {
    const dto = await firstValueFrom(
      this.apiClient.patch<CustoDespachanteApiDto>(`/custos-despachante/${id}/reabrir`, {})
    );
    await this.refresh();
    return this.getById(String(dto.id)) ?? this._mapCusto(dto);
  }

  // ── Children management ───────────────────────────────────────────────────

  async replaceLis(
    custoId: string,
    lista: Array<{ ncm: string; descricao: string; valor: number; data: string }>
  ): Promise<CustoDespachanteLi[]> {
    const existing = this.getLis(custoId);
    for (const li of existing) {
      await firstValueFrom(this.apiClient.delete(`/custos-despachante/${custoId}/lis/${li.id}`));
    }
    const results: CustoDespachanteLi[] = [];
    for (const item of lista) {
      const dto = await firstValueFrom(
        this.apiClient.post<CustoDespachanteLiApiDto>(`/custos-despachante/${custoId}/lis`, {
          ncm: item.ncm,
          descricao: item.descricao,
          valor: item.valor,
          data: item.data
        })
      );
      results.push(this._mapLi(dto));
    }
    this.lisMap[custoId] = results;
    return results;
  }

  async replaceDespesas(
    custoId: string,
    lista: Array<{ descricao: string; valor: number; data: string; entraBaseIcms: boolean }>
  ): Promise<CustoDespachanteDespesa[]> {
    const existing = this.getDespesas(custoId);
    for (const d of existing) {
      await firstValueFrom(this.apiClient.delete(`/custos-despachante/${custoId}/despesas/${d.id}`));
    }
    const results: CustoDespachanteDespesa[] = [];
    for (const item of lista) {
      const dto = await firstValueFrom(
        this.apiClient.post<CustoDespachanteDespesaApiDto>(`/custos-despachante/${custoId}/despesas`, {
          descricao: item.descricao,
          valor: item.valor,
          data: item.data,
          entraBaseIcms: item.entraBaseIcms
        })
      );
      results.push(this._mapDespesa(dto));
    }
    this.despesasMap[custoId] = results;
    return results;
  }

  async replaceNcmsVinculados(
    custoId: string,
    lista: Array<{
      ncmId?: string; numeroNcm: string; descricao: string;
      aliIi: number; aliIpi: number; aliPis: number; aliCofins: number; aliIcms: number; baseCalculo: number;
    }>
  ): Promise<NcmVinculadoOrcamento[]> {
    const existing = this.getNcmsVinculados(custoId);
    for (const n of existing) {
      await firstValueFrom(this.apiClient.delete(`/custos-despachante/${custoId}/ncms/${n.id}`));
      delete this.valoresMap[n.id];
    }
    const results: NcmVinculadoOrcamento[] = [];
    for (const item of lista) {
      const dto = await firstValueFrom(
        this.apiClient.post<NcmVinculadoCustoApiDto>(`/custos-despachante/${custoId}/ncms`, {
          ncmId: item.ncmId ? Number(item.ncmId) : null,
          numeroNcm: item.numeroNcm,
          descricao: item.descricao,
          aliIi: item.aliIi,
          aliIpi: item.aliIpi,
          aliPis: item.aliPis,
          aliCofins: item.aliCofins,
          aliIcms: item.aliIcms,
          baseCalculo: item.baseCalculo
        })
      );
      const mapped = this._mapNcm(dto);
      results.push(mapped);
      this.valoresMap[mapped.id] = [];
    }
    this.ncmsMap[custoId] = results;
    return results;
  }

  async saveValorImposto(
    custoId: string,
    ncmId: string,
    valor: {
      aliIi: number; valorIi: number; aliIpi: number; valorIpi: number;
      aliPis: number; valorPis: number; aliCofins: number; valorCofins: number;
      aliIcms: number; valorIcms: number; totalImpostos: number;
    }
  ): Promise<ValorImposto> {
    const existing = this.getValoresImposto(ncmId);
    for (const v of existing) {
      await firstValueFrom(
        this.apiClient.delete(`/custos-despachante/${custoId}/ncms/${ncmId}/valores-imposto/${v.id}`)
      );
    }
    const dto = await firstValueFrom(
      this.apiClient.post<ValorImpostoCustoApiDto>(
        `/custos-despachante/${custoId}/ncms/${ncmId}/valores-imposto`, {
          aliIi: valor.aliIi, valorIi: valor.valorIi,
          aliIpi: valor.aliIpi, valorIpi: valor.valorIpi,
          aliPis: valor.aliPis, valorPis: valor.valorPis,
          aliCofins: valor.aliCofins, valorCofins: valor.valorCofins,
          aliIcms: valor.aliIcms, valorIcms: valor.valorIcms,
          totalImpostos: valor.totalImpostos
        })
    );
    const mapped = this._mapValorImposto(dto);
    this.valoresMap[ncmId] = [mapped];
    return mapped;
  }

  // ── Mapping ───────────────────────────────────────────────────────────────

  private _mapCusto(dto: CustoDespachanteApiDto): CustoDespachante {
    return {
      id: String(dto.id),
      codigoInterno: dto.codigoInterno,
      solicitacaoOrcamentoId: dto.solicitacaoOrcamentoId != null ? String(dto.solicitacaoOrcamentoId) : undefined,
      despachanteId: String(dto.despachanteId),
      importadorId: dto.importadorId != null ? String(dto.importadorId) : '',
      portoOrigemId: String(dto.portoOrigemId),
      portoDestinoId: String(dto.portoDestinoId),
      responsavel: dto.responsavel,
      tamContainer: dto.tamContainer as '20' | '40' | 'LCL',
      peso: dto.peso,
      fobUsd: dto.fobUsd,
      fobReais: dto.fobReais,
      cifUsd: dto.cifUsd,
      cifReais: dto.cifReais,
      seguroUsd: dto.seguroUsd,
      freteInternacionalUsd: dto.freteInternacionalUsd,
      taxaUsd: dto.taxaUsd,
      taxaUsdAgente: dto.taxaUsdAgente ?? undefined,
      observacao: dto.observacao ?? undefined,
      data: typeof dto.data === 'string' ? dto.data.slice(0, 10) : new Date(dto.data).toISOString().slice(0, 10),
      status: dto.status as StatusCustoDespachante,
      versao: dto.versao,
      versaoAnteriorId: dto.versaoAnteriorId ?? undefined,
      imutavel: dto.imutavel
    };
  }

  private _mapLi(dto: CustoDespachanteLiApiDto): CustoDespachanteLi {
    return {
      id: String(dto.id),
      custoDespachanteId: String(dto.custoDespachanteId),
      ncm: dto.ncm,
      descricao: dto.descricao,
      valor: dto.valor,
      data: typeof dto.data === 'string' ? dto.data.slice(0, 10) : new Date(dto.data).toISOString().slice(0, 10)
    };
  }

  private _mapDespesa(dto: CustoDespachanteDespesaApiDto): CustoDespachanteDespesa {
    return {
      id: String(dto.id),
      custoDespachanteId: String(dto.custoDespachanteId),
      descricao: dto.descricao,
      valor: dto.valor,
      data: typeof dto.data === 'string' ? dto.data.slice(0, 10) : new Date(dto.data).toISOString().slice(0, 10),
      entraBaseIcms: dto.entraBaseIcms
    };
  }

  private _mapNcm(dto: NcmVinculadoCustoApiDto): NcmVinculadoOrcamento {
    return {
      id: String(dto.id),
      custoDespachanteId: String(dto.custoDespachanteId),
      ncmId: dto.ncmId != null ? String(dto.ncmId) : '',
      numeroNcm: dto.numeroNcm,
      descricao: dto.descricao,
      aliIi: dto.aliIi,
      aliIpi: dto.aliIpi,
      aliPis: dto.aliPis,
      aliCofins: dto.aliCofins,
      aliIcms: dto.aliIcms,
      baseCalculo: dto.baseCalculo
    };
  }

  private _mapValorImposto(dto: ValorImpostoCustoApiDto): ValorImposto {
    return {
      id: String(dto.id),
      ncmVinculadoOrcamentoId: String(dto.ncmVinculadoCustoId),
      aliIi: dto.aliIi, valorIi: dto.valorIi,
      aliIpi: dto.aliIpi, valorIpi: dto.valorIpi,
      aliPis: dto.aliPis, valorPis: dto.valorPis,
      aliCofins: dto.aliCofins, valorCofins: dto.valorCofins,
      aliIcms: dto.aliIcms, valorIcms: dto.valorIcms,
      totalImpostos: dto.totalImpostos
    };
  }
}
