import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiClientService } from '../../../../../core/api/client/api-client.service';
import { ControleNavio, ControleNavioTrajeto, EmbarqueResumo } from '../models/controle-navio.models';

interface NavioApiDto {
  id: number;
  nomeNavio: string;
  codigoImo?: string;
  armador?: string;
  observacao?: string;
  ativo: boolean;
}

interface EmbarqueResumoApiDto {
  embarqueId: number;
  codigoInterno: string;
  status: string;
  numeroViagem?: string;
  clienteNome?: string;
  containerBl?: string;
  eta?: string;
}

interface NavioTrajetoApiDto {
  id: number;
  navioId: number;
  numeroViagem: string;
  sequencia: number;
  portoOrigemId: number;
  portoOrigemNome: string;
  portoDestinoId: number;
  portoDestinoNome: string;
  etd: string;
  eta: string;
  statusPerna: 'Previsto' | 'EmTransito' | 'Atracado' | 'Concluido';
  observacao?: string;
  embarques: EmbarqueResumoApiDto[];
}

interface LogisticaControleNavioApiDto {
  navioId: number;
  nomeNavio: string;
  codigoImo?: string;
  armador?: string;
  embarquesAtivos: number;
  portoAtualNome?: string;
  trajetos: NavioTrajetoApiDto[];
}

type LogisticaControleResponse =
  | LogisticaControleNavioApiDto[]
  | { items?: LogisticaControleNavioApiDto[]; data?: LogisticaControleNavioApiDto[] };

interface CreateNavioRequest {
  nomeNavio: string;
  codigoImo?: string;
  armador?: string;
  observacao?: string;
  ativo: boolean;
}

interface UpdateNavioRequest {
  nomeNavio: string;
  codigoImo?: string;
  armador?: string;
  observacao?: string;
  ativo: boolean;
}

interface UpsertNavioTrajetoRequest {
  numeroViagem: string;
  sequencia: number;
  portoOrigemId: number;
  portoDestinoId: number;
  etd: string;
  eta: string;
  statusPerna: 'Previsto' | 'EmTransito' | 'Atracado' | 'Concluido';
  observacao?: string;
}

@Injectable({ providedIn: 'root' })
export class ControleNavioService {
  private items: ControleNavio[] = [];
  private trajetos: ControleNavioTrajeto[] = [];
  private embarquesAtivosPorNavio: Record<string, number> = {};
  private loaded = false;

  readonly navios$ = new BehaviorSubject<ControleNavio[]>([]);
  readonly trajetos$ = new BehaviorSubject<ControleNavioTrajeto[]>([]);
  readonly loading$ = new BehaviorSubject<boolean>(false);
  readonly loadError$ = new BehaviorSubject<string | null>(null);

  constructor(private apiClient: ApiClientService) {
    this.refresh();
  }

  reload(): void {
    this.loaded = false;
    this.refresh();
  }

  // ── Navios ──────────────────────────────────────────────────────────────

  getAll(): ControleNavio[] {
    this.ensureLoaded();
    return [...this.items];
  }

  getAtivos(): ControleNavio[] {
    return this.getAll().filter(n => n.ativo);
  }

  create(data: Omit<ControleNavio, 'id'>): Observable<ControleNavio> {
    const payload: CreateNavioRequest = {
      nomeNavio: data.nomeNavio.trim(),
      observacao: data.observacao?.trim() || undefined,
      ativo: data.ativo
    };

    return this.apiClient.post<NavioApiDto>('/navios', payload).pipe(
      map((created) => this.mapNavioDto(created)),
      tap(created => {
        // Add to cache immediately without waiting for full refresh
        this.items.push(created);
      })
    );
  }

  update(item: ControleNavio): void {
    const payload: UpdateNavioRequest = {
      nomeNavio: item.nomeNavio.trim(),
      observacao: item.observacao?.trim() || undefined,
      ativo: item.ativo
    };

    this.apiClient.put<NavioApiDto>(`/navios/${item.id}`, payload).subscribe({
      next: () => this.refresh()
    });
  }

  remove(id: string): void {
    this.apiClient.delete(`/navios/${id}`).subscribe({
      next: () => this.refresh()
    });
  }

  // ── Trajetos ─────────────────────────────────────────────────────────────

  getAllTrajetos(): ControleNavioTrajeto[] {
    this.ensureLoaded();
    return [...this.trajetos];
  }

  getTrajetos(controleNavioId: string): ControleNavioTrajeto[] {
    return this.getAllTrajetos().filter(t => t.controleNavioId === controleNavioId);
  }

  getEmbarquesAtivosCount(controleNavioId: string): number {
    return this.embarquesAtivosPorNavio[controleNavioId] ?? 0;
  }

  addTrajeto(data: Omit<ControleNavioTrajeto, 'id' | 'portoOrigemNome' | 'portoDestinoNome'>): void {
    const payload = this.toTrajetoRequest(data, undefined, data.controleNavioId);

    this.apiClient.post<NavioTrajetoApiDto>(
      `/navios/${data.controleNavioId}/trajetos`,
      payload
    ).subscribe({
      next: () => this.refreshTrajetos()
    });
  }

  removeTrajeto(id: string): void {
    // Find the controle-navio-id of the trajeto to construct the nested URL
    const trajeto = this.trajetos.find(t => t.id === id);
    if (!trajeto) return;
    
    this.apiClient.delete(`/navios/${trajeto.controleNavioId}/trajetos/${id}`).subscribe({
      next: () => this.refreshTrajetos()
    });
  }

  /** Substitui todos os trajetos de um navio de uma vez. */
  replaceTrajetos(
    controleNavioId: string,
    trajetosList: Array<{
      portoOrigemId: string;
      portoDestinoId: string;
      etd: string;
      eta: string;
      trajetoDescricao?: string;
    }>
  ): Observable<void> {
    const payload = trajetosList.map((item, idx) =>
      this.toTrajetoRequest(item, idx + 1, controleNavioId)
    );

    return this.apiClient.patch<NavioTrajetoApiDto[]>(`/navios/${controleNavioId}/trajetos`, payload).pipe(
      tap(() => this.refreshTrajetos()),
      map(() => void 0)
    );
  }

  private refresh(): void {
    this.loading$.next(true);
    this.loadError$.next(null);

    this.apiClient.getList<NavioApiDto>('/navios', { page: 1, pageSize: 200 }).subscribe({
      next: (result) => {
        this.items = result.items.map((item) => this.mapNavioDto(item));
        this.loaded = true;
        this.navios$.next([...this.items]);
        this.refreshTrajetos();
      },
      error: (err) => {
        this.loaded = false;
        this.loading$.next(false);
        this.loadError$.next(err?.message ?? 'Não foi possível carregar os navios no momento.');
      }
    });
  }

  private refreshTrajetos(): void {
    this.apiClient.get<LogisticaControleResponse>('/logistica/controle-navios').subscribe({
      next: (result) => {
        const naviosOperacionais = this.normalizeControleResponse(result);

        this.embarquesAtivosPorNavio = {};
        naviosOperacionais.forEach((n) => {
          this.embarquesAtivosPorNavio[String(n.navioId)] = n.embarquesAtivos ?? 0;
        });

        this.trajetos = naviosOperacionais.flatMap((n) =>
          n.trajetos.map((item) => this.mapTrajetoDto(item))
        );

        // Atualiza numero de viagem "principal" no cache de navios para manter compatibilidade da UI atual.
        const viagemPorNavio = new Map<string, string>();
        naviosOperacionais.forEach((n) => {
          const primeira = [...n.trajetos].sort((a, b) => a.sequencia - b.sequencia)[0];
          if (primeira?.numeroViagem) {
            viagemPorNavio.set(String(n.navioId), primeira.numeroViagem);
          }
        });

        const operacionaisMap = new Map<string, ControleNavio>(
          naviosOperacionais.map((n) => {
            const id = String(n.navioId);
            const existente = this.items.find((item) => item.id === id);
            return [id, {
              id,
              numeroViagem: viagemPorNavio.get(id) ?? existente?.numeroViagem ?? '',
              nomeNavio: n.nomeNavio,
              observacao: existente?.observacao,
              ativo: existente?.ativo ?? true
            }];
          })
        );

        const mergedBase = this.items.map((item) => {
          const fromOperacional = operacionaisMap.get(item.id);
          return fromOperacional
            ? { ...item, ...fromOperacional, numeroViagem: fromOperacional.numeroViagem || item.numeroViagem || '' }
            : { ...item, numeroViagem: viagemPorNavio.get(item.id) ?? item.numeroViagem ?? '' };
        });

        const existentes = new Set(mergedBase.map((n) => n.id));
        const extrasOperacionais = [...operacionaisMap.values()].filter((n) => !existentes.has(n.id));
        this.items = [...mergedBase, ...extrasOperacionais];
        this.navios$.next([...this.items]);
        this.trajetos$.next([...this.trajetos]);
        this.loading$.next(false);
        this.loadError$.next(null);
      },
      error: (err) => {
        this.embarquesAtivosPorNavio = {};
        this.trajetos = [];
        this.trajetos$.next([]);
        this.loading$.next(false);
        this.loadError$.next(err?.message ?? 'Não foi possível carregar o painel operacional de navios.');
      }
    });
  }

  private normalizeControleResponse(response: LogisticaControleResponse): LogisticaControleNavioApiDto[] {
    const raw = response as any;

    // Accept direct array, {items:[...]}, {data:[...]} and {success,data:[...]} shapes.
    const source = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.items)
        ? raw.items
        : Array.isArray(raw?.data)
          ? raw.data
          : [];

    return source
      .map((item: any) => this.mapControleNavioShape(item))
      .filter((item: LogisticaControleNavioApiDto | null): item is LogisticaControleNavioApiDto => item !== null);
  }

  private mapControleNavioShape(item: any): LogisticaControleNavioApiDto | null {
    if (!item || typeof item !== 'object') return null;

    const navioId = this.toNumber(item.navioId ?? item.NavioId);
    const nomeNavio = this.toStringSafe(item.nomeNavio ?? item.NomeNavio);

    if (!navioId || !nomeNavio) {
      return null;
    }

    const trajetosRaw = item.trajetos ?? item.Trajetos;
    const trajetosArray = Array.isArray(trajetosRaw) ? trajetosRaw : [];

    return {
      navioId,
      nomeNavio,
      codigoImo: this.toOptionalString(item.codigoImo ?? item.CodigoImo),
      armador: this.toOptionalString(item.armador ?? item.Armador),
      embarquesAtivos: this.toNumber(item.embarquesAtivos ?? item.EmbarquesAtivos) ?? 0,
      portoAtualNome: this.toOptionalString(item.portoAtualNome ?? item.PortoAtualNome),
      trajetos: trajetosArray
        .map((t: any) => this.mapTrajetoShape(t, navioId))
        .filter((t: NavioTrajetoApiDto | null): t is NavioTrajetoApiDto => t !== null)
    };
  }

  private mapTrajetoShape(item: any, fallbackNavioId: number): NavioTrajetoApiDto | null {
    if (!item || typeof item !== 'object') return null;

    const id = this.toNumber(item.id ?? item.Id);
    const portoOrigemId = this.toNumber(item.portoOrigemId ?? item.PortoOrigemId);
    const portoDestinoId = this.toNumber(item.portoDestinoId ?? item.PortoDestinoId);
    const sequencia = this.toNumber(item.sequencia ?? item.Sequencia) ?? 1;
    const etd = this.toStringSafe(item.etd ?? item.Etd);
    const eta = this.toStringSafe(item.eta ?? item.Eta);

    if (!id || !portoOrigemId || !portoDestinoId || !etd || !eta) {
      return null;
    }

    const embarquesRaw = item.embarques ?? item.Embarques;
    const embarquesArray = Array.isArray(embarquesRaw) ? embarquesRaw : [];

    return {
      id,
      navioId: this.toNumber(item.navioId ?? item.NavioId) ?? fallbackNavioId,
      numeroViagem: this.toStringSafe(item.numeroViagem ?? item.NumeroViagem) || 'SEM-VIAGEM',
      sequencia,
      portoOrigemId,
      portoOrigemNome: this.toStringSafe(item.portoOrigemNome ?? item.PortoOrigemNome) || '-',
      portoDestinoId,
      portoDestinoNome: this.toStringSafe(item.portoDestinoNome ?? item.PortoDestinoNome) || '-',
      etd,
      eta,
      statusPerna: (this.toStringSafe(item.statusPerna ?? item.StatusPerna) as any) || 'Previsto',
      observacao: this.toOptionalString(item.observacao ?? item.Observacao),
      embarques: embarquesArray.map((e: any): EmbarqueResumoApiDto => ({
        embarqueId: this.toNumber(e.embarqueId ?? e.EmbarqueId) ?? 0,
        codigoInterno: this.toStringSafe(e.codigoInterno ?? e.CodigoInterno),
        status: this.toStringSafe(e.status ?? e.Status),
        numeroViagem: this.toOptionalString(e.numeroViagem ?? e.NumeroViagem),
        clienteNome: this.toOptionalString(e.clienteNome ?? e.ClienteNome),
        containerBl: this.toOptionalString(e.containerBl ?? e.ContainerBl),
        eta: this.toOptionalString(e.eta ?? e.Eta)
      })).filter(e => !!e.embarqueId)
    };
  }

  private toStringSafe(value: unknown): string {
    if (value === null || value === undefined) return '';
    return String(value);
  }

  private toOptionalString(value: unknown): string | undefined {
    const text = this.toStringSafe(value).trim();
    return text ? text : undefined;
  }

  private toNumber(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = Number(value);
    return Number.isFinite(num) ? num : null;
  }

  private mapNavioDto(dto: NavioApiDto): ControleNavio {
    return {
      id: dto.id.toString(),
      numeroViagem: '',
      nomeNavio: dto.nomeNavio,
      observacao: dto.observacao,
      ativo: dto.ativo
    };
  }

  private mapTrajetoDto(dto: NavioTrajetoApiDto): ControleNavioTrajeto {
    return {
      id: dto.id.toString(),
      controleNavioId: dto.navioId.toString(),
      sequencia: dto.sequencia,
      portoOrigemId: dto.portoOrigemId.toString(),
      portoOrigemNome: dto.portoOrigemNome,
      portoDestinoId: dto.portoDestinoId.toString(),
      portoDestinoNome: dto.portoDestinoNome,
      etd: this.toDateOnly(dto.etd),
      eta: this.toDateOnly(dto.eta),
      statusPerna: dto.statusPerna,
      trajetoDescricao: dto.observacao,
      embarques: (dto.embarques ?? []).map((e): EmbarqueResumo => ({
        id: e.embarqueId.toString(),
        codigoInterno: e.codigoInterno,
        status: e.status,
        numeroViagem: e.numeroViagem,
        clienteNome: e.clienteNome,
        containerBl: e.containerBl,
        eta: e.eta
      }))
    };
  }

  private toTrajetoRequest(data: {
    portoOrigemId: string;
    portoDestinoId: string;
    etd: string;
    eta: string;
    trajetoDescricao?: string;
  }, sequencia = 1, controleNavioId?: string): UpsertNavioTrajetoRequest {
    const numeroViagemAtual = controleNavioId
      ? (this.items.find(n => n.id === controleNavioId)?.numeroViagem || '').trim()
      : '';

    return {
      numeroViagem: numeroViagemAtual || 'SEM-VIAGEM',
      sequencia,
      portoOrigemId: Number(data.portoOrigemId),
      portoDestinoId: Number(data.portoDestinoId),
      etd: this.toDateOnly(data.etd),
      eta: this.toDateOnly(data.eta),
      statusPerna: 'Previsto',
      observacao: data.trajetoDescricao?.trim() || undefined
    };
  }

  private toDateOnly(value: string): string {
    if (!value) return value;
    const datePart = value.includes('T') ? value.split('T')[0] : value;
    return datePart.slice(0, 10);
  }

  private ensureLoaded(): void {
    if (!this.loaded) this.refresh();
  }
}
