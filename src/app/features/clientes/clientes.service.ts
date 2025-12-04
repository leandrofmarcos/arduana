import { Injectable, inject } from '@angular/core';
import { CLIENTE_REPOSITORY } from '../../core/repository.tokens';
import { ClienteRepository } from '../../domain/cliente.repository';
import { Observable } from 'rxjs';
import { Cliente } from '../../domain/cliente.models';

@Injectable({ providedIn: 'root' })
export class ClientesService {
  private repo = inject<ClienteRepository>(CLIENTE_REPOSITORY);
  list$(): Observable<Cliente[]> { return this.repo.list$(); }
  create(nome: string, documento: string, contato: string){ return this.repo.create({ nome, documento, contato }); }
  update(id: string, data: Partial<Pick<Cliente,'nome'|'documento'|'contato'>>){ this.repo.update(id, data); }
  remove(id: string){ this.repo.remove(id); }
}