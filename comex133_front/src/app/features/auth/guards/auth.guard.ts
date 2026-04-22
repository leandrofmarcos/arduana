import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard - Protects routes that require authentication
 * Redirects to /login if user is not authenticated
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated) {
    return true;
  }

  // Redirect to login with return URL
  return router.createUrlTree(['/login']);
};

/**
 * Guest Guard - Protects routes that should only be accessible to non-authenticated users
 * Redirects to / if user is already authenticated (e.g., login page)
 */
export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated) {
    return true;
  }

  // Redirect to home if already logged in
  return router.createUrlTree(['/']);
};
