import { Injectable } from '@angular/core';
import { StatusEmbarque, StatusEmbarqueNome } from '../models/embarque-aduana.models';

@Injectable({ providedIn: 'root' })
export class StatusEmbarqueService {

  private readonly items: StatusEmbarque[] = [
    { id: '1', nome: 'Previsto', codigo: 'PREV', ordem: 1, ativo: true },
    { id: '2', nome: 'Aguardando', codigo: 'AGRD', ordem: 2, ativo: true },
    { id: '3', nome: 'Atracado', codigo: 'ATRC', ordem: 3, ativo: true },
    { id: '4', nome: 'Registrado', codigo: 'RGTD', ordem: 4, ativo: true },
    { id: '5', nome: 'Desembaraçado', codigo: 'DSMB', ordem: 5, ativo: true },
    { id: '6', nome: 'Entregue', codigo: 'ENTG', ordem: 6, ativo: true },
    { id: '7', nome: 'Finalizado', codigo: 'FNLZ', ordem: 7, ativo: true },
  ];

  getAll(): StatusEmbarque[] {
    return [...this.items].sort((a, b) => a.ordem - b.ordem);
  }

  getById(id: string): StatusEmbarque | undefined {
    return this.items.find(s => s.id === id);
  }

  getPrevisto(): StatusEmbarque | undefined {
    return this.items.find(s => s.codigo === 'PREV');
  }
}
