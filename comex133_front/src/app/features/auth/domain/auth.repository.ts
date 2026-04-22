import { Observable } from 'rxjs';
import { User, Credentials, AuthSession } from './auth.models';

/**
 * Repository abstraction for authentication data access
 * Implementations can be localStorage, HTTP API, IndexedDB, etc.
 */
export abstract class AuthRepository {
  /**
   * Authenticate user with credentials
   * @returns AuthSession if successful, null if failed
   */
  abstract authenticate(credentials: Credentials): Observable<AuthSession | null>;

  /**
   * Get current authenticated session from storage
   */
  abstract getCurrentSession(): Observable<AuthSession | null>;

  /**
   * Save session to persistent storage
   */
  abstract saveSession(session: AuthSession): Observable<void>;

  /**
   * Clear current session (logout)
   */
  abstract clearSession(refreshToken?: string): Observable<void>;

  /**
   * Refresh access token using refresh token
   */
  abstract refreshToken(refreshToken: string): Observable<AuthSession | null>;

  /**
   * Verify if user has specific permission
   */
  abstract hasPermission(user: User, permission: string): boolean;

  /**
   * Verify if user has any of the specified permissions
   */
  abstract hasAnyPermission(user: User, permissions: string[]): boolean;

  /**
   * Verify if user has all specified permissions
   */
  abstract hasAllPermissions(user: User, permissions: string[]): boolean;

  /**
   * Save credentials for "remember me" functionality
   */
  abstract saveRememberedCredentials(credentials: Partial<Credentials>): Observable<void>;

  /**
   * Get saved credentials for "remember me" functionality
   */
  abstract getRememberedCredentials(): Observable<Partial<Credentials> | null>;

  /**
   * Clear remembered credentials on logout
   */
  abstract clearRememberedCredentials(): Observable<void>;
}
