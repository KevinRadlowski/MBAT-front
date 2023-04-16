import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { User } from '../helpers/user.model';
import { Buffer } from 'buffer';

export interface AuthState {
  user: User | null;
  authorities: String | null;
}

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';
const AUTHORITIES_KEY = 'auth-authorities';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  authUser: any = '';
  authToken: any = '';
  state: AuthState = {
    user: null,
    authorities: null,
  };

  constructor(private http: HttpClient) {
    const storedUser = localStorage.getItem('auth-user');
    const storedAuthorities = localStorage.getItem('auth-authorities');
    if (storedUser) {
      this.state.user = JSON.parse(storedUser);
    }
    if (storedAuthorities) {
      this.state.authorities = JSON.parse(storedAuthorities);
    }
  }
  /**
   * Méthode permettant de récupérer le user en utilisant le cookie de session, elle
   * sera utilisée au lancement de l'application pour obtenir les informations de la
   * personne actuellement connectée pour les mettre dans le authService
   */
  getUser() {
    return this.http
      .get<User>('/api/user/account')
      .pipe(tap((data) => this.updateUser(data)));
  }
  /**
   * La méthode login va envoyer les identifiants du User vers le serveur et, dans le
   * cas où les identifiants sont correct, va pousser le user connectée dans le state du service
   * @param email identifiant du User
   * @param password mot de passe du User
   * @returns Renvoie le User sous forme d'Observable
   */
  login(email: string, password: string) {
    return this.http
      .get<User>('/api/user/account', {
        headers: {
          Authorization:
            'Basic ' + Buffer.from(email + ':' + password).toString('base64'),
          // btoa(email + ':' + password),
        },
      })
      .pipe(
        tap((data) => this.updateUser(data)) //On assigne user connectée au state
      );
  }

  /**
   * Méthode pour l'inscription, qui, si l'inscription réussie, nous connecte automatiquement
   * @param user Le User à faire persister
   * @returns Le User qui a persisté
   */
  register(user: User) {
    return this.http.post<User>('/api/user', user).pipe(
      tap((data) => this.updateUser(data)) //On assigne user connectée au state
    );
  }
  /**
   * La méthode logout qui va stoper la session côté serveur et poussé un null dans le
   * state afin que le front sache qu'on est pu connecté
   */
  logout() {
    return this.http.get<void>('/logout').pipe(
      tap(() => {
        this.updateUser(null);
      })
    );
  }
  /**
   * Méthode pour changer son mot de passe
   * @param oldPassword le mot de passe actuel pour comparer
   * @param newPassword le nouveau mot de passe
   */
  changePassword(oldPassword: string, newPassword: string) {
    return this.http.patch<void>('/api/user/password', {
      oldPassword,
      newPassword,
    });
  }
  /**
   * Méthode qui met à jour la valeur du user dans le AuthService.state ainsi que
   * dans le localStorage
   * @param data La nouvelle valeur du user
   */
  private updateUser(data: any | null) {
    this.state.user = data;
    this.state.authorities = data?.authorities[0].authority;
    if (data) {
      this.authUser = {
        username: data.username,
        email: data.email,
        id: data.id,
        enabled: data.enabled,
      };
      this.authToken = {
        accountNonExpired: data.accountNonExpired,
        accountNonLocked: data.accountNonLocked,
        credentialsNonExpired: data.credentialsNonExpired,
        accessToken: data.accessToken,
      };
      localStorage.setItem(
        AUTHORITIES_KEY,
        JSON.stringify(data.authorities[0].authority)
      );
      localStorage.setItem(TOKEN_KEY, JSON.stringify(this.authToken));
      localStorage.setItem(USER_KEY, JSON.stringify(this.authUser));
    } else {
      localStorage.removeItem(AUTHORITIES_KEY);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }
}
