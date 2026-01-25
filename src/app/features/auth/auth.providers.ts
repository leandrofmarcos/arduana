import { Provider } from '@angular/core';
import { AuthRepository } from './domain/auth.repository';
import { AuthRepositoryLocal } from './data/auth.repository.local';

/**
 * Auth Feature Providers
 * Configures dependency injection for auth feature
 */
export const AUTH_PROVIDERS: Provider[] = [
  {
    provide: AuthRepository,
    useClass: AuthRepositoryLocal
  }
];

/**
 * Export all auth feature public APIs
 */
export { AuthService } from './services/auth.service';
export { authGuard, guestGuard } from './guards/auth.guard';
export { permissionGuard, roleGuard, adminGuard } from './guards/permission.guard';
export { authInterceptor } from './interceptors/auth.interceptor';
export { HasPermissionDirective, HasRoleDirective, IsAuthenticatedDirective } from './directives/permission.directives';
export * from './domain/auth.models';
export { LoginComponent } from './pages/login.component';
