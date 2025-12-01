import { InjectionToken } from '@angular/core';
import { PlanilhaRepository } from '../domain/planilha.repository';
import { PlanilhaCatalogRepository } from '../domain/planilha.catalog';

export const PLANILHA_REPOSITORY = new InjectionToken<PlanilhaRepository>('PLANILHA_REPOSITORY');
export const PLANILHA_CATALOG_REPOSITORY = new InjectionToken<PlanilhaCatalogRepository>('PLANILHA_CATALOG_REPOSITORY');