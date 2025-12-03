import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = route.data?.['roles'] as string[] | undefined;
  if (!auth.isLoggedIn()) { router.navigate(['/login']); return false; }
  if (!roles || roles.length === 0) return true;
  const userRole = auth.currentUser?.role;
  if (userRole && roles.includes(userRole)) return true;
  router.navigate(['/']);
  return false;
};