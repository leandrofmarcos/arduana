import { Observable } from 'rxjs';
import { PlanilhaSnapshot } from './planilha.models';

export interface PlanilhaListItem {
  id: string;
  produto: string;
  cliente: string;
  processo: string;
  origem: string;
  dataSimulacao: string;
  tributos: number;
  desembolsoTotal: number;
  status: 'Ativo' | 'Finalizado' | 'Rascunho';
  faseAtual?: 'Orcamento' | 'Aduana' | 'Numerario' | 'Fechamento';
  faseDates?: {
    Orcamento?: { start: string; end?: string };
    Aduana?: { start: string; end?: string };
    Numerario?: { start: string; end?: string };
    Fechamento?: { start: string; end?: string };
  };
  versionsCount?: number;
}

export abstract class PlanilhaCatalogRepository {
  abstract list$(): Observable<PlanilhaListItem[]>;
  abstract getSnapshot(id: string): PlanilhaSnapshot | null;
  abstract getMeta(id: string): PlanilhaListItem | null;
  abstract getVersions(id: string): Array<{ id: string; fase: string; createdAt: string }> | null;
  abstract getVersionSnapshot(id: string, versionId: string): PlanilhaSnapshot | null;
  abstract createNew(meta?: Partial<Omit<PlanilhaListItem,'id'|'tributos'|'desembolsoTotal'>>): string;
  abstract duplicate(id: string): string | null;
  abstract remove(id: string): void;
  abstract update(id: string, data: Partial<Omit<PlanilhaListItem,'id'>>): void;
  abstract setSnapshot(id: string, snap: PlanilhaSnapshot): void;
}