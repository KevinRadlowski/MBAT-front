import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { TokenStorageService } from '../services/token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private tokenStorage: TokenStorageService, private router: Router) {}

  // Guard to prevent navigation if the user is not authenticated
  canActivate(): boolean {
    const token = this.tokenStorage.getToken();

    if (!token || this.tokenStorage.isTokenExpired(token)) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
