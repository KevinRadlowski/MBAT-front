import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

export const AuthGuard = () => {
  const router = inject(Router);
  const token = inject(TokenStorageService);

  return token.isLoggedIn() ? true : router.navigate(['/login']) ;
};
