import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth-token';
const TOKEN_TYPE = 'auth-token-type';
const USER_KEY = 'auth-user';
const USER_ID = 'auth-user-id';
const AUTHORITIES_KEY = 'auth-authorities';

@Injectable({
    providedIn: 'root'
})
export class TokenStorageService {

    constructor() { }

    signOut(): void {
        localStorage.clear();
        sessionStorage.clear();
        this.deleteCookie('g_state'); // Supprime le cookie `g_state`
    }

    public saveAll(data: any, rememberMe: boolean = false): void {
        this.saveToken(data.accessToken, data.tokenType, rememberMe);
        this.saveUser(data.username, data.id, rememberMe);
    }

    private clearToken() {
        localStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(TOKEN_TYPE);
        sessionStorage.removeItem(TOKEN_TYPE);
    }

    public saveToken(token: string, tokenType: string, rememberMe: boolean): void {
        this.clearToken(); // Efface le token précédent s'il existe

        if (rememberMe) {
            localStorage.setItem(TOKEN_KEY, token);
            localStorage.setItem(TOKEN_TYPE, tokenType);
        } else {
            sessionStorage.setItem(TOKEN_KEY, token);
            sessionStorage.setItem(TOKEN_TYPE, tokenType);
        }
    }

    public getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    }

    private isTokenExpired(token: string): boolean {
        try {
            const expiry = JSON.parse(atob(token.split('.')[1])).exp;
            return expiry * 1000 > Date.now();
        } catch (e) {
            return false;
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
}