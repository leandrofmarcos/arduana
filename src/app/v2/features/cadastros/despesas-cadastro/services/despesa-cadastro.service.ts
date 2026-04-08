import { Injectable } from '@angular/core';
import { DespesaCadastro, CategoriaDespesa } from '../models/despesa-cadastro.models';
import { readV2, addV2, writeV2, updateV2, deleteV2, generateV2Id, keysV2 } from '../../../../core/helpers/storage-v2.helper';

const SEED: Omit<DespesaCadastro, 'id'>[] = [
  // Agência Marítima
  { descricao: 'Desconsolidação',                                categoria: 'Agência Marítima', valor: 1280,  ativo: true },
  { descricao: 'Liberação de B/L',                               categoria: 'Agência Marítima', valor: 900,   ativo: true },
  { descricao: 'THC',                                            categoria: 'Agência Marítima', valor: 1450,  ativo: true },
  { descricao: 'ISPS',                                           categoria: 'Agência Marítima', valor: 100,   ativo: true },
  { descricao: 'LOG FEE / TRS / IMP. LOG. FEE / TELEX FEE / IOF', categoria: 'Agência Marítima', valor: 2440, ativo: true },
  { descricao: 'Lift Off',                                       categoria: 'Agência Marítima', valor: 330,   ativo: true },
  // Despachante
  { descricao: 'Honorários Despachante',                         categoria: 'Despachante',      valor: 3000,  ativo: true },
  { descricao: 'Honorários Trading',                             categoria: 'Despachante',      valor: 17000, ativo: true },
  { descricao: 'S.D.A.',                                         categoria: 'Despachante',      valor: 600,   ativo: true },
  { descricao: 'Taxa de Expediente',                             categoria: 'Despachante',      valor: 500,   ativo: true },
  { descricao: 'Taxa Emissão de L.I.',                           categoria: 'Despachante',      valor: 0,     ativo: true },
  // Tributos
  { descricao: 'AFRMM + Taxa Sistema Mercante',                  categoria: 'Tributos',         valor: 3848,  ativo: true },
  { descricao: 'TUS - Taxa de Utilização do Siscomex',           categoria: 'Tributos',         valor: 244,   ativo: true },
  { descricao: 'Siscoserv',                                      categoria: 'Tributos',         valor: 0,     ativo: true },
  { descricao: 'Outras Despesas de Origem',                      categoria: 'Tributos',         valor: 0,     ativo: true },
  // Portos
  { descricao: 'Armazenagem',                                    categoria: 'Portos',           valor: 5200,  ativo: true },
  // Outras Despesas
  { descricao: 'Frete Marítimo',                                 categoria: 'Outras Despesas',  valor: 0,     ativo: true },
  { descricao: 'Outras Despesas',                                categoria: 'Outras Despesas',  valor: 3500,  ativo: true },
  { descricao: 'Impostos de Saída (PIS e COFINS)',               categoria: 'Outras Despesas',  valor: 25264, ativo: true },
  { descricao: 'Frete Rodoviário Interno',                       categoria: 'Outras Despesas',  valor: 5800,  ativo: true },
];

@Injectable({ providedIn: 'root' })
export class DespesaCadastroService {

  initSeed(): void {
    const existing = readV2<DespesaCadastro>(keysV2.despesasCadastro);
    if (existing.length >= SEED.length) return;
    // Write all seed items at once to avoid partial saves
    const seeded = SEED.map(d => ({ id: generateV2Id(), ...d }));
    writeV2(keysV2.despesasCadastro, seeded);
  }

  getAll(): DespesaCadastro[] {
    return readV2<DespesaCadastro>(keysV2.despesasCadastro);
  }

  getAtivos(): DespesaCadastro[] {
    return this.getAll().filter(d => d.ativo);
  }

  getByCategoria(cat: CategoriaDespesa): DespesaCadastro[] {
    return this.getAll().filter(d => d.categoria === cat && d.ativo);
  }

  create(data: Omit<DespesaCadastro, 'id'>): DespesaCadastro {
    const item: DespesaCadastro = { id: generateV2Id(), ...data };
    addV2(keysV2.despesasCadastro, item);
    return item;
  }

  update(item: DespesaCadastro): void {
    updateV2(keysV2.despesasCadastro, item);
  }

  remove(id: string): void {
    deleteV2(keysV2.despesasCadastro, id);
  }
}
