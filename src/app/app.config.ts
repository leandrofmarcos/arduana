import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAuth } from './core/auth/auth.providers';
import { PLANILHA_REPOSITORY, PLANILHA_CATALOG_REPOSITORY, NUMERARIO_REPOSITORY, FECHAMENTO_REPOSITORY, VENDA_REPOSITORY, ANEXO_REPOSITORY } from './core/repository.tokens';
import { LocalStoragePlanilhaRepository } from './data/localstorage/planilha.repository.local';
import { LocalStoragePlanilhaCatalogRepository } from './data/localstorage/planilha.catalog.repository.local';
import { PORTO_REPOSITORY } from './core/repository.tokens';
import { LocalStoragePortoRepository } from './data/localstorage/porto.repository.local';
import { ALIQUOTA_REPOSITORY } from './core/repository.tokens';
import { LocalStorageAliquotaRepository } from './data/localstorage/aliquota.repository.local';
import { LocalStorageNumerarioRepository } from './data/localstorage/numerario.repository.local';
import { LocalStorageFechamentoRepository } from './data/localstorage/fechamento.repository.local';
import { LocalStorageVendaRepository } from './data/localstorage/venda.repository.local';
import { LocalStorageAnexoRepository } from './data/localstorage/anexo.repository.local';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(),
    provideAnimations(),
    provideAuth(),
    { provide: PLANILHA_REPOSITORY, useClass: LocalStoragePlanilhaRepository },
    { provide: PLANILHA_CATALOG_REPOSITORY, useClass: LocalStoragePlanilhaCatalogRepository },
    { provide: PORTO_REPOSITORY, useClass: LocalStoragePortoRepository },
    { provide: ALIQUOTA_REPOSITORY, useClass: LocalStorageAliquotaRepository },
    { provide: NUMERARIO_REPOSITORY, useClass: LocalStorageNumerarioRepository },
    { provide: FECHAMENTO_REPOSITORY, useClass: LocalStorageFechamentoRepository },
    { provide: VENDA_REPOSITORY, useClass: LocalStorageVendaRepository },
    { provide: ANEXO_REPOSITORY, useClass: LocalStorageAnexoRepository }
  ]
};
