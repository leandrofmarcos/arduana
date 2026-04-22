import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Permission } from '../domain/auth.models';

/**
 * Permission Guard Factory
 * Creates a guard that checks if user has required permissions
 * 
 * @example
 * // Single permission
 * { path: 'custo', canActivate: [permissionGuard(['custo:write'])] }
 * 
 * // Any of multiple permissions
 * { path: 'admin', canActivate: [permissionGuard(['admin:all'], 'any')] }
 * 
 * // All permissions required
 * { path: 'special', canActivate: [permissionGuard(['custo:write', 'venda:write'], 'all')] }
 */
export function permissionGuard(
  permissions: (Permission | string)[],
  mode: 'any' | 'all' = 'any'
): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated) {
      return router.createUrlTree(['/login']);
    }

    const hasPermission = mode === 'all'
      ? authService.hasAllPermissions(permissions)
      : authService.hasAnyPermission(permissions);

    if (hasPermission) {
      return true;
    }

    // Redirect to forbidden page or home
    return router.createUrlTree(['/']);
  };
}

/**
 * Role Guard Factory
 * Creates a guard that checks if user has required role
 * 
 * @example
 * { path: 'admin', canActivate: [roleGuard('admin')] }
 */
export function roleGuard(role: string): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated) {
      return router.createUrlTree(['/login']);
    }

    if (authService.hasRole(role)) {
      return true;
    }

    return router.createUrlTree(['/']);
  };
}

/**
 * Admin Guard - Shortcut for admin role check
 */
export const adminGuard: CanActivateFn = roleGuard('admin');
