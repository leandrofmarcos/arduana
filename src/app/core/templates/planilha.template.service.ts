import { Injectable } from '@angular/core';
import { Despesa, PlanilhaSnapshot, Premissas, Taxas } from '../../domain/planilha.models';

@Injectable({ providedIn: 'root' })
export class PlanilhaTemplateService {
  defaultPremissas(): Premissas {
    return { fobUsd: 46110, freteUsd: 2450, seguroUsd: 0, thcUsd: 0, taxaUsd: 5.55, quantidade: 1, ncm: '8423' };
  }
  defaultTaxas(): Taxas {
    return { ii: 14.4, ipi: 7.43, icms: 4, pis: 2.1, cofins: 10.65 };
  }
  defaultDespesas(): Despesa[] {
    return [
      { id: '1', categoria: 'Porto', item: 'THC - V3', valor: 1280 },
      { id: '2', categoria: 'Agência Marítima', item: 'Liberação de B/L - V3', valor: 900 },
      { id: '3', categoria: 'Agência Marítima', item: 'Frete Marítimo - V3', valor: 1450 }
    ];
  }
  defaultSnapshot(): PlanilhaSnapshot {
    return {
      premissas: this.defaultPremissas(),
      taxas: this.defaultTaxas(),
      despesas: this.defaultDespesas(),
      totalDespesas: 0,
      resumo: { tributos: 0, desembolsoDesembaraco: 0, desembolsoTotal: 0 },
      nfSaida: { cfop: '', cst: '', baseIcms: 0, icms: 0 },
      numerario: []
    };
  }
  emptySnapshot(): PlanilhaSnapshot {
    return {
      premissas: { fobUsd: 0, freteUsd: 0, seguroUsd: 0, thcUsd: 0, taxaUsd: 5.55, quantidade: 1, ncm: '' },
      taxas: { ii: 0, ipi: 0, icms: 0, pis: 0, cofins: 0 },
      despesas: [],
      totalDespesas: 0,
      resumo: { tributos: 0, desembolsoDesembaraco: 0, desembolsoTotal: 0 },
      nfSaida: { cfop: '', cst: '', baseIcms: 0, icms: 0 },
      numerario: []
    };
  }
}