import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiClientService } from '../../../../core/api/client/api-client.service';
import {
  SolicitacaoOrcamento,
  SolicitacaoOrcamentoDespachante,
  SolicitacaoOrcamentoDocumento
} from '../models/solicitacao-orcamento.models';

interface SolicitacaoOrcamentoApiDto {
  id: number;
  codigoInterno: string;
  clienteId?: number | null;
  importadorId?: number | null;
  portoOrigemId: number;
  portoDestinoId: number;
  responsavel: string;
  tamContainer: '20' | '40' | 'LCL';
  peso: number;
  observacao?: string;
  status: string;
  data: string;
}

interface SolicitacaoOrcamentoDespachanteApiDto {
  id: number;
  solicitacaoOrcamentoId: number;
  despachanteId: number;
  status: string;
  dataEnvio: string;
}

interface SolicitacaoOrcamentoDocumentoApiDto {
  id: number;
  solicitacaoOrcamentoId: number;
  nomeArquivo: string;
  linkDocumento: string;
  dataUpload: string;
  observacao?: string;
}

@Injectable({ providedIn: 'root' })
export class SolicitacaoOrcamentoService {
  private solicitacoes: SolicitacaoOrcamento[] = [];
  private despachantesBySolicitacao: Record<string, SolicitacaoOrcamentoDespachante[]> = {};
  private documentosBySolicitacao: Record<string, SolicitacaoOrcamentoDocumento[]> = {};
  private despachantesLoaded = new Set<string>();
  private documentosLoaded = new Set<string>();
  private loaded = false;

  constructor(private apiClient: ApiClientService) {
    void this.refresh();
  }

  async refresh(): Promise<void> {
    const result = await firstValueFrom(
      this.apiClient.getList<SolicitacaoOrcamentoApiDto>('/solicitacoes-orcamento', { page: 1, pageSize: 500 })
    );
    this.solicitacoes = (result.items ?? []).map((item) => this.mapSolicitacaoDto(item));
    this.loaded = true;
  }

  // ── SolicitacaoOrcamento ───────────────────────────────────────────────

  getAll(): SolicitacaoOrcamento[] {
    if (!this.loaded) {
      void this.refresh();
    }
    return [...this.solicitacoes];
  }

  getById(id: string): SolicitacaoOrcamento | undefined {
    return this.getAll().find(s => s.id === id);
  }

  async create(data: Omit<SolicitacaoOrcamento, 'id' | 'codigoInterno'>): Promise<SolicitacaoOrcamento> {
    const payload = {
      clienteId: data.clienteId ? Number(data.clienteId) : null,
      importadorId: data.importadorId ? Number(data.importadorId) : null,
      portoOrigemId: Number(data.portoOrigemId),
      portoDestinoId: Number(data.portoDestinoId),
      responsavel: data.responsavel,
      tamContainer: data.tamContainer,
      peso: data.peso,
      observacao: data.observacao,
      status: data.status,
      data: data.data
    };

    const created = await firstValueFrom(
      this.apiClient.post<SolicitacaoOrcamentoApiDto>('/solicitacoes-orcamento', payload)
    );

    const mapped = this.mapSolicitacaoDto(created);
    this.solicitacoes = [mapped, ...this.solicitacoes.filter(s => s.id !== mapped.id)];
    return mapped;
  }

  async update(item: SolicitacaoOrcamento): Promise<void> {
    const payload = {
      clienteId: item.clienteId ? Number(item.clienteId) : null,
      importadorId: item.importadorId ? Number(item.importadorId) : null,
      portoOrigemId: Number(item.portoOrigemId),
      portoDestinoId: Number(item.portoDestinoId),
      responsavel: item.responsavel,
      tamContainer: item.tamContainer,
      peso: item.peso,
      observacao: item.observacao,
      status: item.status,
      data: item.data
    };

    const updated = await firstValueFrom(
      this.apiClient.put<SolicitacaoOrcamentoApiDto>(`/solicitacoes-orcamento/${item.id}`, payload)
    );

    const mapped = this.mapSolicitacaoDto(updated);
    const idx = this.solicitacoes.findIndex(s => s.id === mapped.id);
    if (idx >= 0) {
      this.solicitacoes[idx] = mapped;
    } else {
      this.solicitacoes.unshift(mapped);
    }
  }

  async remove(id: string): Promise<void> {
    await firstValueFrom(this.apiClient.delete(`/solicitacoes-orcamento/${id}`));
    this.solicitacoes = this.solicitacoes.filter(s => s.id !== id);
    delete this.despachantesBySolicitacao[id];
    delete this.documentosBySolicitacao[id];
    this.despachantesLoaded.delete(id);
    this.documentosLoaded.delete(id);
  }

  // ── SolicitacaoOrcamentoDespachante ───────────────────────────────────

  getAllDespachantes(): SolicitacaoOrcamentoDespachante[] {
    return Object.values(this.despachantesBySolicitacao).flatMap((items) => items);
  }

  getDespachantes(solicitacaoId: string): SolicitacaoOrcamentoDespachante[] {
    if (!this.despachantesLoaded.has(solicitacaoId)) {
      void this.loadDespachantes(solicitacaoId);
      return [];
    }
    return [...(this.despachantesBySolicitacao[solicitacaoId] ?? [])];
  }

  async loadDespachantes(solicitacaoId: string): Promise<SolicitacaoOrcamentoDespachante[]> {
    const data = await firstValueFrom(
      this.apiClient.get<SolicitacaoOrcamentoDespachanteApiDto[]>(`/solicitacoes-orcamento/${solicitacaoId}/despachantes`)
    );

    const mapped = (data ?? []).map((item) => this.mapDespachanteDto(item));
    this.despachantesBySolicitacao[solicitacaoId] = mapped;
    this.despachantesLoaded.add(solicitacaoId);
    return [...mapped];
  }

  async addDespachante(data: Omit<SolicitacaoOrcamentoDespachante, 'id'>): Promise<SolicitacaoOrcamentoDespachante> {
    const payload = {
      despachanteId: Number(data.despachanteId),
      status: data.status,
      dataEnvio: data.dataEnvio
    };

    const created = await firstValueFrom(
      this.apiClient.post<SolicitacaoOrcamentoDespachanteApiDto>(`/solicitacoes-orcamento/${data.solicitacaoOrcamentoId}/despachantes`, payload)
    );
    const mapped = this.mapDespachanteDto(created);
    const list = this.despachantesBySolicitacao[data.solicitacaoOrcamentoId] ?? [];
    this.despachantesBySolicitacao[data.solicitacaoOrcamentoId] = [...list, mapped];
    this.despachantesLoaded.add(data.solicitacaoOrcamentoId);
    return mapped;
  }

  async updateDespachante(item: SolicitacaoOrcamentoDespachante): Promise<void> {
    // A API atual não possui endpoint de atualização de despachante.
    // Estratégia: remover e recriar com os dados atualizados.
    await this.removeDespachante(item.id, item.solicitacaoOrcamentoId);
    await this.addDespachante({
      solicitacaoOrcamentoId: item.solicitacaoOrcamentoId,
      despachanteId: item.despachanteId,
      status: item.status,
      dataEnvio: item.dataEnvio
    });
  }

  async removeDespachante(id: string, solicitacaoOrcamentoId: string): Promise<void> {
    await firstValueFrom(
      this.apiClient.delete(`/solicitacoes-orcamento/${solicitacaoOrcamentoId}/despachantes/${id}`)
    );
    const list = this.despachantesBySolicitacao[solicitacaoOrcamentoId] ?? [];
    this.despachantesBySolicitacao[solicitacaoOrcamentoId] = list.filter((d) => d.id !== id);
  }

  // ── SolicitacaoOrcamentoDocumento ─────────────────────────────────────

  getAllDocumentos(): SolicitacaoOrcamentoDocumento[] {
    return Object.values(this.documentosBySolicitacao).flatMap((items) => items);
  }

  getDocumentos(solicitacaoId: string): SolicitacaoOrcamentoDocumento[] {
    if (!this.documentosLoaded.has(solicitacaoId)) {
      void this.loadDocumentos(solicitacaoId);
      return [];
    }
    return [...(this.documentosBySolicitacao[solicitacaoId] ?? [])];
  }

  async loadDocumentos(solicitacaoId: string): Promise<SolicitacaoOrcamentoDocumento[]> {
    const data = await firstValueFrom(
      this.apiClient.get<SolicitacaoOrcamentoDocumentoApiDto[]>(`/solicitacoes-orcamento/${solicitacaoId}/documentos`)
    );

    const mapped = (data ?? []).map((item) => this.mapDocumentoDto(item));
    this.documentosBySolicitacao[solicitacaoId] = mapped;
    this.documentosLoaded.add(solicitacaoId);
    return [...mapped];
  }

  async addDocumento(data: Omit<SolicitacaoOrcamentoDocumento, 'id'>): Promise<SolicitacaoOrcamentoDocumento> {
    const payload = {
      nomeArquivo: data.nomeArquivo,
      linkDocumento: data.linkDocumento,
      dataUpload: data.dataUpload,
      observacao: data.observacao
    };

    const created = await firstValueFrom(
      this.apiClient.post<SolicitacaoOrcamentoDocumentoApiDto>(`/solicitacoes-orcamento/${data.solicitacaoOrcamentoId}/documentos`, payload)
    );
    const mapped = this.mapDocumentoDto(created);
    const list = this.documentosBySolicitacao[data.solicitacaoOrcamentoId] ?? [];
    this.documentosBySolicitacao[data.solicitacaoOrcamentoId] = [...list, mapped];
    this.documentosLoaded.add(data.solicitacaoOrcamentoId);
    return mapped;
  }

  async updateDocumento(item: SolicitacaoOrcamentoDocumento): Promise<void> {
    // A API atual não possui endpoint de atualização de documento.
    // Estratégia: remover e recriar com os dados atualizados.
    await this.removeDocumento(item.id, item.solicitacaoOrcamentoId);
    await this.addDocumento({
      solicitacaoOrcamentoId: item.solicitacaoOrcamentoId,
      nomeArquivo: item.nomeArquivo,
      linkDocumento: item.linkDocumento,
      dataUpload: item.dataUpload,
      observacao: item.observacao
    });
  }

  async removeDocumento(id: string, solicitacaoOrcamentoId: string): Promise<void> {
    await firstValueFrom(
      this.apiClient.delete(`/solicitacoes-orcamento/${solicitacaoOrcamentoId}/documentos/${id}`)
    );
    const list = this.documentosBySolicitacao[solicitacaoOrcamentoId] ?? [];
    this.documentosBySolicitacao[solicitacaoOrcamentoId] = list.filter((d) => d.id !== id);
  }

  private mapSolicitacaoDto(dto: SolicitacaoOrcamentoApiDto): SolicitacaoOrcamento {
    return {
      id: String(dto.id),
      codigoInterno: dto.codigoInterno,
      clienteId: dto.clienteId != null ? String(dto.clienteId) : undefined,
      importadorId: dto.importadorId != null ? String(dto.importadorId) : undefined,
      portoOrigemId: String(dto.portoOrigemId),
      portoDestinoId: String(dto.portoDestinoId),
      responsavel: dto.responsavel,
      tamContainer: dto.tamContainer,
      peso: dto.peso,
      observacao: dto.observacao,
      status: dto.status as SolicitacaoOrcamento['status'],
      data: this.toDateOnly(dto.data)
    };
  }

  private mapDespachanteDto(dto: SolicitacaoOrcamentoDespachanteApiDto): SolicitacaoOrcamentoDespachante {
    return {
      id: String(dto.id),
      solicitacaoOrcamentoId: String(dto.solicitacaoOrcamentoId),
      despachanteId: String(dto.despachanteId),
      status: dto.status as SolicitacaoOrcamentoDespachante['status'],
      dataEnvio: this.toDateOnly(dto.dataEnvio)
    };
  }

  private mapDocumentoDto(dto: SolicitacaoOrcamentoDocumentoApiDto): SolicitacaoOrcamentoDocumento {
    return {
      id: String(dto.id),
      solicitacaoOrcamentoId: String(dto.solicitacaoOrcamentoId),
      nomeArquivo: dto.nomeArquivo,
      linkDocumento: dto.linkDocumento,
      dataUpload: this.toDateOnly(dto.dataUpload),
      observacao: dto.observacao
    };
  }

  private toDateOnly(value: string): string {
    if (!value) return value;
    const datePart = value.includes('T') ? value.split('T')[0] : value;
    return datePart.slice(0, 10);
  }
}
