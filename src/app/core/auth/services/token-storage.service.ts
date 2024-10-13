import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { UserService } from '../signup/signup.service';

const TOKEN_KEY = 'auth-token';
const TOKEN_TYPE = 'auth-token-type';
const USER_KEY = 'auth-user';
const USER_ID = 'auth-user-id';
const AUTHORITIES_KEY = 'auth-authorities';
const REFRESH_TOKEN_KEY = 'auth-refresh-token';

@Injectable({
    providedIn: 'root'
})
export class TokenStorageService {
    private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
    public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
    private refreshTokenTimeout: any;

    constructor(private router: Router, private userService: UserService) {
        this.updateAuthStatus();

    }

    public updateAuthStatus(): void {
        const token = this.getToken();
        const isAuthenticated = token ? !this.isTokenExpired(token) : false;
        this.isAuthenticatedSubject.next(isAuthenticated);

        if (isAuthenticated) {
            this.startTokenExpirationWatcher();  // Lance le watcher à l'initialisation si l'utilisateur est connecté
        }
    }


    public saveAll(data: any, rememberMe: boolean = false): void {
        this.saveToken(data.token, data.type, rememberMe);  // Sauvegarde du token d'accès
        this.saveUser(data.username, data.id, rememberMe);
        this.saveRefreshToken(data.refreshToken);  // Sauvegarde du refresh token
        this.updateAuthStatus();  // Mise à jour de l'état d'authentification
    }

    public saveToken(token: string, tokenType: string, rememberMe: boolean): void {
        this.clearToken(); // Efface le token précédent s'il existe

        if (rememberMe) {
            localStorage.setItem(TOKEN_KEY, token);          // Stocke le token
            localStorage.setItem(TOKEN_TYPE, tokenType);     // Stocke le type de token (Bearer)
        } else {
            sessionStorage.setItem(TOKEN_KEY, token);
            sessionStorage.setItem(TOKEN_TYPE, tokenType);
        }
    }

    public saveUser(user: any, id: string, rememberMe: boolean): void {
        this.clearUser(); // Efface les informations utilisateur précédentes

        if (rememberMe) {
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            localStorage.setItem(USER_ID, JSON.stringify(id));
        } else {
            sessionStorage.setItem(USER_KEY, JSON.stringify(user));
            sessionStorage.setItem(USER_ID, JSON.stringify(id));
        }
    }

    saveRefreshToken(refreshToken: string): void {
        sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }

    public getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    }

    public getRefreshToken(): string | null {
        return sessionStorage.getItem(REFRESH_TOKEN_KEY);
    }

    public getTokenType(): string | null {
        return localStorage.getItem(TOKEN_TYPE) || sessionStorage.getItem(TOKEN_TYPE);
    }

    // Check if token is expired
    public isTokenExpired(token: string): boolean {
        try {
            const expiry = JSON.parse(atob(token.split('.')[1])).exp * 1000;
            const now = Date.now();
            return expiry < now;
        } catch (e) {
            return true;
        }
    }


    // Watch for token expiration and refresh before it expires
    private startTokenExpirationWatcher(): void {
        const token = this.getToken();
        if (!token) return;

        const expiry = JSON.parse(atob(token.split('.')[1])).exp * 1000;
        const now = Date.now();
        const timeUntilExpiration = expiry - now;

        if (this.refreshTokenTimeout) {
            clearTimeout(this.refreshTokenTimeout);
        }

        this.refreshTokenTimeout = setTimeout(() => {
            this.refreshToken();
        }, timeUntilExpiration - 60000); // Refresh 1min before expiration
    }

    // Refresh token using refresh token
    private refreshToken(): void {
        const refreshToken = this.getRefreshToken();
        if (refreshToken) {
            this.userService.refreshToken(refreshToken).subscribe({
                next: (data) => {
                    this.saveAll(data, false);
                    this.startTokenExpirationWatcher();
                },
                error: () => {
                    this.signOut();
                    this.router.navigate(['/login']);
                }
            });
        } else {
            this.signOut();
            this.router.navigate(['/login']);
        }
    }


    public saveUsername(username: any) {
        if (localStorage.getItem(USER_KEY)) {
            localStorage.removeItem(USER_KEY);
            localStorage.setItem(USER_KEY, JSON.stringify(username));

        } else if (sessionStorage.getItem(USER_KEY)) {
            sessionStorage.removeItem(USER_KEY);
            sessionStorage.setItem(USER_KEY, JSON.stringify(username));
        }
    }

    public getUser(): { username: string; id: number | null } | null {
        const user = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
        const userId = localStorage.getItem(USER_ID) || sessionStorage.getItem(USER_ID);

        if (user) {
            return {
                username: JSON.parse(user),
                id: userId ? JSON.parse(userId) : null
            };
        }

        return null;
    }

    private clearToken() {
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_TYPE);
        sessionStorage.removeItem(TOKEN_TYPE);
    }

    private clearUser() {
        localStorage.removeItem(USER_KEY);
        sessionStorage.removeItem(USER_KEY);
        localStorage.removeItem(USER_ID);
        sessionStorage.removeItem(USER_ID);
    }

    isAuthenticatedUser(): boolean {
        const token = this.getToken();
        return token ? this.isTokenExpired(token) : false;
    }

    // Sauvegarde les informations de l'utilisateur Google/Facebook
    public saveSocialUser(user: any): void {
        this.clearUser(); // Efface les informations utilisateur précédentes
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    // Méthode pour supprimer un cookie spécifique
    private deleteCookie(name: string): void {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }

    signOut(): void {
        localStorage.clear();
        sessionStorage.clear();
        this.updateAuthStatus();  // Met à jour l'état d'authentification après la déconnexion
        this.deleteCookie('g_state'); // Supprime le cookie `g_state`
        if (this.refreshTokenTimeout) {
            clearTimeout(this.refreshTokenTimeout);
        }
        this.isAuthenticatedSubject.next(false);
    }
}