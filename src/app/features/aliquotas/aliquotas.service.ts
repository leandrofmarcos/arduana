import { Injectable, inject } from '@angular/core';
import { ALIQUOTA_REPOSITORY } from '../../core/repository.tokens';
import { AliquotaRepository } from '../../domain/aliquota.repository';
import { Observable, map } from 'rxjs';
import { AliquotaPerfil } from '../../domain/aliquota.models';

@Injectable({ providedIn: 'root' })
export class AliquotasService {
  private repo = inject<AliquotaRepository>(ALIQUOTA_REPOSITORY);
  list$(): Observable<AliquotaPerfil[]> { return this.repo.list$(); }
  create(data: Omit<AliquotaPerfil,'id'|'padrao'> & { padrao?: boolean }){ return this.repo.create(data); }
  update(id: string, data: Partial<Omit<AliquotaPerfil,'id'>>){ this.repo.update(id, data); }
  remove(id: string){ this.repo.remove(id); }
  setPadrao(id: string){ this.repo.setPadrao(id); }
  default$(): Observable<AliquotaPerfil | undefined> { return this.list$().pipe(map(list => list.find(x => x.padrao))); }
}