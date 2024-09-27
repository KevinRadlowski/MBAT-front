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

    public saveAll(data: any, rememberMe: boolean = false): void {
        this.saveToken(data.accessToken, data.tokenType, rememberMe);
        this.saveUser(data.username, data.id, rememberMe);
    }

    signOut(): void {
        localStorage.clear();
        sessionStorage.clear();
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

    public getUser(): any {
        const user = localStorage.getItem(USER_KEY) || sessionStorage.getItem(USER_KEY);
        if (user) {
            return JSON.parse(user);
        }
        return {};
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
}