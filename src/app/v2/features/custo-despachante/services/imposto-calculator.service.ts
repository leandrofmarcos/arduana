import { Injectable } from '@angular/core';
import { NcmVinculadoOrcamento, ValorImposto } from '../models/custo-despachante.models';
import { generateV2Id } from '../../../core/helpers/storage-v2.helper';

@Injectable({ providedIn: 'root' })
export class ImpostoCalculatorService {

  calcularImpostos(ncmVinculado: NcmVinculadoOrcamento): ValorImposto {
    const base = ncmVinculado.baseCalculo;
    const valorIi      = base * (ncmVinculado.aliIi / 100);
    const valorIpi     = (base + valorIi) * (ncmVinculado.aliIpi / 100);
    const valorPis     = base * (ncmVinculado.aliPis / 100);
    const valorCofins  = base * (ncmVinculado.aliCofins / 100);
    const valorIcms    = (base + valorIi + valorIpi) * (ncmVinculado.aliIcms / 100);
    const totalImpostos = valorIi + valorIpi + valorPis + valorCofins + valorIcms;

    return {
      id: generateV2Id(),
      ncmVinculadoOrcamentoId: ncmVinculado.id,
      aliIi:       ncmVinculado.aliIi,    valorIi,
      aliIpi:      ncmVinculado.aliIpi,   valorIpi,
      aliPis:      ncmVinculado.aliPis,   valorPis,
      aliCofins:   ncmVinculado.aliCofins, valorCofins,
      aliIcms:     ncmVinculado.aliIcms,  valorIcms,
      totalImpostos
    };
  }

  totalImpostosPorCusto(valoresImposto: ValorImposto[]): number {
    return valoresImposto.reduce((acc, v) => acc + v.totalImpostos, 0);
  }
}
