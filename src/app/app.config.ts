import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAuth } from './core/auth/auth.providers';
import { PLANILHA_REPOSITORY, PLANILHA_CATALOG_REPOSITORY, NUMERARIO_REPOSITORY, CLIENTE_REPOSITORY, DESPACHANTE_REPOSITORY, PORTO_REPOSITORY, ALIQUOTA_REPOSITORY } from './core/repository.tokens';
import { LocalStoragePlanilhaRepository } from './data/localstorage/planilha.repository.local';
import { LocalStoragePlanilhaCatalogRepository } from './data/localstorage/planilha.catalog.repository.local';
import { LocalStoragePortoRepository } from './data/localstorage/porto.repository.local';
import { LocalStorageAliquotaRepository } from './data/localstorage/aliquota.repository.local';
import { LocalStorageNumerarioRepository } from './data/localstorage/numerario.repository.local';
import { LocalStorageClienteRepository } from './data/localstorage/cliente.repository.local';
import { LocalStorageDespachanteRepository } from './data/localstorage/despachante.repository.local';

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
    { provide: CLIENTE_REPOSITORY, useClass: LocalStorageClienteRepository },
    { provide: DESPACHANTE_REPOSITORY, useClass: LocalStorageDespachanteRepository }
  ]
};
