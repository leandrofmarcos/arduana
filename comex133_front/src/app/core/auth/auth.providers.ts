import { Provider } from '@angular/core';
import { AuthService } from './auth.service';

export function provideAuth(): Provider[] {
  return [AuthService];
}