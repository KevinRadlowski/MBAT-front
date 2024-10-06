import { inject } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';

// export const AuthGuard = () => {
//     const tokenStorageService = inject(TokenStorageService)
//     const router = inject(Router);

//     return tokenStorageService.isAuthenticatedUser() ? true : router.navigate(['/login']);
// }


export const AuthGuard = (): boolean | UrlTree => {
    const tokenStorageService = inject(TokenStorageService);
    const router = inject(Router);

    // Retourne true si l'utilisateur est authentifié, sinon redirige vers la page de connexion avec un UrlTree
    return tokenStorageService.isAuthenticatedUser() ? true : router.createUrlTree(['/login']);
};
