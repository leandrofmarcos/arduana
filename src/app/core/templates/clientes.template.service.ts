import { Injectable } from '@angular/core';
import { Cliente } from '../../domain/cliente.models';

@Injectable({ providedIn: 'root' })
export class ClientesTemplateService {
  defaultClientes(): Cliente[] {
    return [
      { id: 'c1', nome: 'Cliente A', documento: '00.000.000/0001-00', contato: '(11) 90000-0001' },
      { id: 'c2', nome: 'Cliente B', documento: '11.111.111/0001-11', contato: '(11) 90000-0002' },
      { id: 'c3', nome: 'Cliente C', documento: '22.222.222/0001-22', contato: '(11) 90000-0003' }
    ];
  }
  emptyCliente(): Omit<Cliente,'id'> {
    return { nome: '', documento: '', contato: '' };
  }
}