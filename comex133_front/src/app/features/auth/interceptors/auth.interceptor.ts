import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

/**
 * Auth Interceptor
 * Automatically adds Authorization header with Bearer token to all HTTP requests
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.accessToken;
  const isAuthEndpoint = req.url.includes('/api/auth/login') || req.url.includes('/api/auth/refresh');

  const requestWithToken = (!isAuthEndpoint && token)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(requestWithToken).pipe(
    catchError(error => {
      if (isAuthEndpoint || error?.status !== 401) {
        return throwError(() => error);
      }

      return authService.refreshToken().pipe(
        switchMap(refreshed => {
          if (!refreshed || !authService.accessToken) {
            return throwError(() => error);
          }

          const retryReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${authService.accessToken}`
            }
          });

          return next(retryReq);
        }),
        catchError(() => throwError(() => error))
      );
    })
  );
};
