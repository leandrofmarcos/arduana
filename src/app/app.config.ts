import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { AUTH_PROVIDERS, authInterceptor } from './features/auth/auth.providers';
import { PLANILHA_REPOSITORY, PLANILHA_CATALOG_REPOSITORY, CLIENTE_REPOSITORY, DESPACHANTE_REPOSITORY, PORTO_REPOSITORY, ALIQUOTA_REPOSITORY, FUNCIONARIO_REPOSITORY, TEMPLATE_PACKLIST_REPOSITORY } from './core/repository.tokens';
import { LocalStoragePlanilhaRepository } from './data/localstorage/planilha.repository.local';
import { LocalStoragePlanilhaCatalogRepository } from './data/localstorage/planilha.catalog.repository.local';
import { HttpPortoRepository } from './data/http/porto.repository.http';
import { HttpAliquotaRepository } from './data/http/aliquota.repository.http';
import { HttpClienteRepository } from './data/http/cliente.repository.http';
import { HttpTemplatePacklistRepository } from './data/http/template-packlist.repository.http';
import { LocalStorageDespachanteRepository } from './data/localstorage/despachante.repository.local';
import { LocalStorageFuncionarioRepository } from './data/localstorage/funcionario.repository.local';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    ...AUTH_PROVIDERS,
    { provide: PLANILHA_REPOSITORY, useClass: LocalStoragePlanilhaRepository },
    { provide: PLANILHA_CATALOG_REPOSITORY, useClass: LocalStoragePlanilhaCatalogRepository },
    { provide: PORTO_REPOSITORY, useClass: HttpPortoRepository },
    { provide: ALIQUOTA_REPOSITORY, useClass: HttpAliquotaRepository },
    { provide: CLIENTE_REPOSITORY, useClass: HttpClienteRepository },
    { provide: TEMPLATE_PACKLIST_REPOSITORY, useClass: HttpTemplatePacklistRepository },
    { provide: DESPACHANTE_REPOSITORY, useClass: LocalStorageDespachanteRepository },
    { provide: FUNCIONARIO_REPOSITORY, useClass: LocalStorageFuncionarioRepository }
  ]
};
