import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAuth } from './core/auth/auth.providers';
import { PLANILHA_REPOSITORY, PLANILHA_CATALOG_REPOSITORY } from './core/repository.tokens';
import { LocalStoragePlanilhaRepository } from './data/localstorage/planilha.repository.local';
import { LocalStoragePlanilhaCatalogRepository } from './data/localstorage/planilha.catalog.repository.local';
import { PORTO_REPOSITORY } from './core/repository.tokens';
import { LocalStoragePortoRepository } from './data/localstorage/porto.repository.local';
import { ALIQUOTA_REPOSITORY } from './core/repository.tokens';
import { LocalStorageAliquotaRepository } from './data/localstorage/aliquota.repository.local';

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
    { provide: ALIQUOTA_REPOSITORY, useClass: LocalStorageAliquotaRepository }
  ]
};
