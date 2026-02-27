import { InjectionToken } from '@angular/core';
import { PlanilhaRepository } from '../domain/planilha.repository';
import { PlanilhaCatalogRepository } from '../domain/planilha.catalog';
import { PortoRepository } from '../domain/porto.repository';
import { AliquotaRepository } from '../domain/aliquota.repository';
import { ClienteRepository } from '../domain/cliente.repository';
import { DespachanteRepository } from '../domain/despachante.repository';
import { FuncionarioRepository } from '../domain/funcionario.repository';
import { TemplatePacklistRepository } from '../domain/template-packlist.repository';

export const PLANILHA_REPOSITORY = new InjectionToken<PlanilhaRepository>('PLANILHA_REPOSITORY');
export const PLANILHA_CATALOG_REPOSITORY = new InjectionToken<PlanilhaCatalogRepository>('PLANILHA_CATALOG_REPOSITORY');
export const PORTO_REPOSITORY = new InjectionToken<PortoRepository>('PORTO_REPOSITORY');
export const ALIQUOTA_REPOSITORY = new InjectionToken<AliquotaRepository>('ALIQUOTA_REPOSITORY');
export const CLIENTE_REPOSITORY = new InjectionToken<ClienteRepository>('CLIENTE_REPOSITORY');
export const DESPACHANTE_REPOSITORY = new InjectionToken<DespachanteRepository>('DESPACHANTE_REPOSITORY');
export const FUNCIONARIO_REPOSITORY = new InjectionToken<FuncionarioRepository>('FUNCIONARIO_REPOSITORY');
export const TEMPLATE_PACKLIST_REPOSITORY = new InjectionToken<TemplatePacklistRepository>('TEMPLATE_PACKLIST_REPOSITORY');