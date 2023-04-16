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

    constructor() {}

    public saveAll(data: any): void {
        this.saveToken(data.accessToken, data.tokenType);
        this.saveUser(data.username, data.id);
    }

    signOut(): void {
        localStorage.clear();
    }

    public saveToken(token: string, tokenType: string): void {
        window.sessionStorage.removeItem(TOKEN_KEY);
        window.sessionStorage.setItem(TOKEN_KEY, token);
        window.sessionStorage.removeItem(TOKEN_TYPE);
        window.sessionStorage.setItem(TOKEN_TYPE, tokenType);
    }

    public getToken(): string | null {
        return window.sessionStorage.getItem(TOKEN_KEY);
    }

    private isTokenExpired() {
        const token = window.sessionStorage.getItem(TOKEN_KEY);
        if (token) {
            const expiry = JSON.parse(atob(token.split('.')[1])).exp;
            return expiry * 1000 > Date.now();
        } else {
            return true;
        }
    }

    public saveUser(user: any, id: string): void {
        window.sessionStorage.removeItem(USER_KEY);
        window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
        window.sessionStorage.removeItem(USER_ID);
        window.sessionStorage.setItem(USER_ID, JSON.stringify(id));
    }

    public getUser(): any {
        const user = window.sessionStorage.getItem(USER_KEY);
        if (user) {
            return JSON.parse(user);
        }

        return {};
    }

    isAuthenticatedUser(): boolean {
        const user = window.sessionStorage.getItem(USER_KEY);
        const token = window.sessionStorage.getItem(TOKEN_KEY);
        if (user && token && this.isTokenExpired()) {
            return true;
        }

        return false;
    }
}