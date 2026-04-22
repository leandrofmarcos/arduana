import { Injectable } from '@angular/core';
import { Despachante } from '../../domain/despachante.models';

@Injectable({ providedIn: 'root' })
export class DespachantesTemplateService {
  defaultDespachantes(): Despachante[] {
    return [
      { id: 'd1', nome: 'Despachante XPTO', documento: '33.333.333/0001-33', contato: '(11) 90000-0101' },
      { id: 'd2', nome: 'Alpha Despachos', documento: '44.444.444/0001-44', contato: '(11) 90000-0102' },
      { id: 'd3', nome: 'LogBrasil', documento: '55.555.555/0001-55', contato: '(11) 90000-0103' }
    ];
  }
  emptyDespachante(): Omit<Despachante,'id'> {
    return { nome: '', documento: '', contato: '' };
  }
}