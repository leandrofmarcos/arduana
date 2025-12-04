import { Injectable } from '@angular/core';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { NumerarioRepository } from '../../domain/numerario.repository';
import { NumerarioLancamento, NumerarioStatus } from '../../domain/numerario.models';
import { NUMERARIO_REPOSITORY, PLANILHA_CATALOG_REPOSITORY } from '../../core/repository.tokens';
import { PlanilhaCatalogRepository } from '../../domain/planilha.catalog';

@Injectable({ providedIn: 'root' })
export class NumerarioService {
  private repo = inject<NumerarioRepository>(NUMERARIO_REPOSITORY);
  private catalog = inject<PlanilhaCatalogRepository>(PLANILHA_CATALOG_REPOSITORY);
  private readJSON<T>(key: string): T | null { try { const ls = (globalThis as any).localStorage as Storage | undefined; if (!ls) return null; const raw = ls.getItem(key); return raw ? JSON.parse(raw) as T : null; } catch { return null; } }
  private writeJSON(key: string, value: any) { try { const ls = (globalThis as any).localStorage as Storage | undefined; if (!ls) return; ls.setItem(key, JSON.stringify(value)); } catch {} }
  private log(evento: string, dados?: any){ const id = (globalThis as any).localStorage?.getItem('import_costs_current_catalog_id') || ''; if(!id) return; const key = `import_costs_logs_${id}`; const arr = this.readJSON<Array<{ evento: string; dados?: any; data: string }>>(key) || []; arr.push({ evento, dados, data: new Date().toISOString() }); this.writeJSON(key, arr); }
  private key(pid: string){ return `import_costs_numerario_${pid}`; }

  list$(): Observable<NumerarioLancamento[]> {
    const id = (globalThis as any).localStorage?.getItem('import_costs_current_catalog_id') || '';
    return this.repo.list$(id);
  }

  listSync(): NumerarioLancamento[]{
    const id = (globalThis as any).localStorage?.getItem('import_costs_current_catalog_id') || '';
    return this.readJSON<NumerarioLancamento[]>(this.key(id)) || [];
  }

  meta(){ const id = (globalThis as any).localStorage?.getItem('import_costs_current_catalog_id') || ''; return this.catalog.getMeta(id); }

  novo(valor: number, moeda: 'BRL'|'USD'|'EUR', responsavel: string, observacao?: string){ this.repo.add({ processoId: '', valor, moeda, responsavel, observacao }); this.log('NumerarioSolicitado', { valor, moeda, responsavel, observacao }); }
  atualizar(id: string, status: NumerarioStatus){ this.repo.updateStatus(id, status); this.log('NumerarioStatusAlterado', { id, status }); }
  remover(id: string){ this.repo.remove(id); this.log('NumerarioRemovido', { id }); }
}