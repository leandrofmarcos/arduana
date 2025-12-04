import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PLANILHA_CATALOG_REPOSITORY, PLANILHA_REPOSITORY } from '../../core/repository.tokens';
import { inject } from '@angular/core';
import { PlanilhaCatalogRepository, PlanilhaListItem } from '../../domain/planilha.catalog';
import { PlanilhaRepository } from '../../domain/planilha.repository';
import { Observable } from 'rxjs';
import { Taxas } from '../../domain/planilha.models';
import { PlanilhaTemplateService } from '../../core/templates/planilha.template.service';

@Injectable({ providedIn: 'root' })
export class PlanilhasService {
  private catalog = inject<PlanilhaCatalogRepository>(PLANILHA_CATALOG_REPOSITORY);
  private editor = inject<PlanilhaRepository>(PLANILHA_REPOSITORY);
  private router = inject(Router);
  private templates = inject(PlanilhaTemplateService);

  list$(): Observable<PlanilhaListItem[]> { return this.catalog.list$(); }

  nova(meta?: Partial<Omit<PlanilhaListItem,'id'|'tributos'|'desembolsoTotal'>>, taxas?: Partial<Taxas>) {
    try{
      const ls = (globalThis as any).localStorage as Storage | undefined;
      ls?.removeItem('import_costs_current_catalog_id');
      ls?.setItem('import_costs_locked', 'false');
    }catch{}
    const snap = this.templates.defaultSnapshot();
    this.editor.carregarSnapshot(snap);
    if(taxas){ this.editor.atualizarTaxas(taxas); }
    this.router.navigateByUrl('/importacao');
  }

  abrir(id: string, taxas?: Partial<Taxas>) {
    const snap = this.catalog.getSnapshot(id);
    if(snap){ try{ const ls = (globalThis as any).localStorage as Storage | undefined; ls?.setItem('import_costs_current_catalog_id', id); const meta = this.catalog.getMeta(id); const locked = meta?.status === 'Finalizado' ? 'true' : 'false'; ls?.setItem('import_costs_locked', locked); }catch{} this.editor.carregarSnapshot(snap); if(taxas){ this.editor.atualizarTaxas(taxas); } this.router.navigateByUrl('/importacao'); }
  }

  duplicar(id: string, taxas?: Partial<Taxas>) {
    const newId = this.catalog.duplicate(id);
    if(newId){ const snap = this.catalog.getSnapshot(newId); if(snap){ try{ const ls = (globalThis as any).localStorage as Storage | undefined; ls?.setItem('import_costs_current_catalog_id', newId); ls?.setItem('import_costs_locked', 'false'); }catch{} this.editor.carregarSnapshot(snap); if(taxas){ this.editor.atualizarTaxas(taxas); } this.router.navigateByUrl('/importacao'); }}
  }

  excluir(id: string) { this.catalog.remove(id); }

  versions(id: string){ return this.catalog.getVersions(id) || []; }
  meta(id: string){ return this.catalog.getMeta(id); }
  versionSnapshot(id: string, vid: string){ return this.catalog.getVersionSnapshot(id, vid); }
}