import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';

export const authGuard = () => {
    const tokenStorageService = inject(TokenStorageService)
    const router = inject(Router);
    if (tokenStorageService.isAuthenticatedUser()) {
        return true;
    } else {
        // Redirect to the login page if the user is not authenticated
        router.navigate(['/login']);
        return false;
    }
}

