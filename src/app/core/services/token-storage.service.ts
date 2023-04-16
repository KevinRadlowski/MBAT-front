import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';
const AUTHORITIES_KEY = 'auth-authorities';

@Injectable({
    providedIn: 'root'
})
export class TokenStorageService {
    constructor() { }

    signOut(): void {
        window.sessionStorage.clear();
    }

    public saveAll(data: any): void {
        this.saveToken(data.accessToken);
        this.saveUser(data.username);
        this.saveAuthorities(data.authorities[0].authority);
    }

    public saveToken(token: string): void {
        window.sessionStorage.removeItem(TOKEN_KEY);
        window.sessionStorage.setItem(TOKEN_KEY, token);
    }

    public getToken(): string | null {
        return window.sessionStorage.getItem(TOKEN_KEY);
    }

    public saveUser(user: any): void {
        window.sessionStorage.removeItem(USER_KEY);
        window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    public getUser(): any {
        const user = window.sessionStorage.getItem(USER_KEY);
        if (user) {
            return JSON.parse(user);
        }
        return null;
    }

    public saveAuthorities(authorities: string) {
        window.sessionStorage.removeItem(AUTHORITIES_KEY);
        window.sessionStorage.setItem(AUTHORITIES_KEY, JSON.stringify(authorities));
    }

    public getAuthorities(): any {
        if (window.sessionStorage.getItem(TOKEN_KEY)) {
            const authority = window.sessionStorage.getItem(AUTHORITIES_KEY);
            if (authority) {
                return JSON.parse(authority);
            }
            return null;
        }

    }
}