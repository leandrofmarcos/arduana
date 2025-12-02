import { InjectionToken } from '@angular/core';
import { PlanilhaRepository } from '../domain/planilha.repository';
import { PlanilhaCatalogRepository } from '../domain/planilha.catalog';
import { PortoRepository } from '../domain/porto.repository';
import { AliquotaRepository } from '../domain/aliquota.repository';

export const PLANILHA_REPOSITORY = new InjectionToken<PlanilhaRepository>('PLANILHA_REPOSITORY');
export const PLANILHA_CATALOG_REPOSITORY = new InjectionToken<PlanilhaCatalogRepository>('PLANILHA_CATALOG_REPOSITORY');
export const PORTO_REPOSITORY = new InjectionToken<PortoRepository>('PORTO_REPOSITORY');
export const ALIQUOTA_REPOSITORY = new InjectionToken<AliquotaRepository>('ALIQUOTA_REPOSITORY');