import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { PLANILHA_CATALOG_REPOSITORY, PLANILHA_REPOSITORY } from '../../core/repository.tokens';
import { inject } from '@angular/core';
import { PlanilhaCatalogRepository, PlanilhaListItem } from '../../domain/planilha.catalog';
import { PlanilhaRepository } from '../../domain/planilha.repository';
import { Observable } from 'rxjs';
import { Taxas } from '../../domain/planilha.models';

@Injectable({ providedIn: 'root' })
export class PlanilhasService {
  private catalog = inject<PlanilhaCatalogRepository>(PLANILHA_CATALOG_REPOSITORY);
  private editor = inject<PlanilhaRepository>(PLANILHA_REPOSITORY);
  private router = inject(Router);

  list$(): Observable<PlanilhaListItem[]> { return this.catalog.list$(); }

  nova(meta?: Partial<Omit<PlanilhaListItem,'id'|'tributos'|'desembolsoTotal'>>, taxas?: Partial<Taxas>) {
    const id = this.catalog.createNew(meta);
    const snap = this.catalog.getSnapshot(id);
    if(snap){ this.editor.carregarSnapshot(snap); if(taxas){ this.editor.atualizarTaxas(taxas); } this.router.navigateByUrl('/importacao'); }
  }

  abrir(id: string, taxas?: Partial<Taxas>) {
    const snap = this.catalog.getSnapshot(id);
    if(snap){ this.editor.carregarSnapshot(snap); if(taxas){ this.editor.atualizarTaxas(taxas); } this.router.navigateByUrl('/importacao'); }
  }

  duplicar(id: string, taxas?: Partial<Taxas>) {
    const newId = this.catalog.duplicate(id);
    if(newId){ const snap = this.catalog.getSnapshot(newId); if(snap){ this.editor.carregarSnapshot(snap); if(taxas){ this.editor.atualizarTaxas(taxas); } this.router.navigateByUrl('/importacao'); }}
  }

  excluir(id: string) { this.catalog.remove(id); }
}