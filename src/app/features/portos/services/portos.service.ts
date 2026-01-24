import { Injectable, inject } from '@angular/core';
import { PORTO_REPOSITORY } from '../../../core/repository.tokens';
import { PortoRepository } from '../../../domain/porto.repository';
import { Observable } from 'rxjs';
import { Porto } from '../models/porto.models';

@Injectable({ providedIn: 'root' })
export class PortosService {
  private repo = inject<PortoRepository>(PORTO_REPOSITORY);
  list$(): Observable<Porto[]> { return this.repo.list$(); }
  create(nome: string, codigo: string, pais: string){ return this.repo.create({ nome, codigo, pais }); }
  update(id: string, data: Partial<Pick<Porto,'nome'|'codigo'|'pais'>>){ this.repo.update(id, data); }
  remove(id: string){ this.repo.remove(id); }
}