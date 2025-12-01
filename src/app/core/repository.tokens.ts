import { InjectionToken } from '@angular/core';
import { PlanilhaRepository } from '../domain/planilha.repository';

export const PLANILHA_REPOSITORY = new InjectionToken<PlanilhaRepository>('PLANILHA_REPOSITORY');