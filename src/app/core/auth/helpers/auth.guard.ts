import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';

export const AuthGuard = () => {
    const tokenStorageService = inject(TokenStorageService)
    const router = inject(Router);

    return tokenStorageService.isAuthenticatedUser() ? true : router.navigate(['/login']);
}

