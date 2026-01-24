import { Injectable, inject } from '@angular/core';
import { DESPACHANTE_REPOSITORY } from '../../../core/repository.tokens';
import { DespachanteRepository } from '../../../domain/despachante.repository';
import { Observable } from 'rxjs';
import { Despachante } from '../models/despachante.models';

@Injectable({ providedIn: 'root' })
export class DespachantesService {
  private repo = inject<DespachanteRepository>(DESPACHANTE_REPOSITORY);
  list$(): Observable<Despachante[]> { return this.repo.list$(); }
  create(nome: string, documento: string, contato: string){ return this.repo.create({ nome, documento, contato }); }
  update(id: string, data: Partial<Pick<Despachante,'nome'|'documento'|'contato'>>){ this.repo.update(id, data); }
  remove(id: string){ this.repo.remove(id); }
}