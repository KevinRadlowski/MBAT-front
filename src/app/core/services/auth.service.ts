import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { User } from '../helpers/user.model';

export interface AuthState {
  user: User | null;
  authorities: String | null;
}

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';
const AUTHORITIES_KEY = 'auth-authorities';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // authUser: any = '';
  // authToken: any = '';
  // state: AuthState = {
  //   user: null,
  //   authorities: null,
  // };

  constructor(private http: HttpClient) {
    // const storedUser = localStorage.getItem('auth-user');
    // const storedAuthorities = localStorage.getItem('auth-authorities');
    // if (storedUser) {
    //   this.state.user = JSON.parse(storedUser);
    // }
    // if (storedAuthorities) {
    //   this.state.authorities = JSON.parse(storedAuthorities);
    // }
  }
  /**
   * Méthode permettant de récupérer le user en utilisant le cookie de session, elle
   * sera utilisée au lancement de l'application pour obtenir les informations de la
   * personne actuellement connectée pour les mettre dans le authService
   */
  // getUser() {
  //   return this.http
  //     .get<User>('/api/user')
  //     .pipe(tap((data) => console.log(data)));
  // }

  /**
   * Envoie une requête HTTP POST à l'API pour authentifier un utilisateur avec un nom d'utilisateur et un mot de passe.
   * @param {string} username - Le nom d'utilisateur de l'utilisateur qui tente de se connecter.
   * @param {string} password - Le mot de passe de l'utilisateur qui tente de se connecter.
   * @returns {Observable<any>} - Un observable qui émet une réponse HTTP de l'API lorsqu'elle est disponible.
   */
  public login(username: string, password: string): Observable<any> {
    return this.http.post(
      '/api/user/signin',
      {
        username,
        password,
      },
      httpOptions
    );
  }

  /**
   * Méthode pour l'inscription d'un nouvel utilisateur.
   * @param {string} username - Le nom d'utilisateur du nouvel utilisateur à enregistrer.
   * @param {string} password - Le mot de passe du nouvel utilisateur à enregistrer.
   * @returns {Observable<any>} - Un observable qui émet une réponse HTTP de l'API lorsqu'elle est disponible.
   * Si l'inscription réussit, l'utilisateur est créé et la réponse de l'API contient les détails de l'utilisateur créé.
   * Sinon, la réponse de l'API contient une erreur indiquant pourquoi l'inscription a échoué.
   */
  public register(username: string, password: string): Observable<any> {
    return this.http.post(
      '/api/user/signup',
      {
        username,
        password,
      },
      httpOptions
    );
  }

  /**
   * Méthode pour déconnecter l'utilisateur en supprimant toutes les informations de session stockées dans la sessionStorage du navigateur.
   * La méthode ne prend pas d'argument et ne retourne rien.
   * Elle utilise la méthode clear() de la sessionStorage pour supprimer toutes les informations de session stockées dans le navigateur.
   */
  logout(): Observable<any> {
    return this.http.post('/api/user/signout', { }, httpOptions);
  }

  /**
   * Méthode pour le changement de mot de passe de l'utilisateur courant.
   * @param {string} oldPassword - L'ancien mot de passe de l'utilisateur.
   * @param {string} newPassword - Le nouveau mot de passe de l'utilisateur.
   * @returns {Observable<void>} - Un observable qui émet un événement lorsque la modification de mot de passe est effectuée avec succès.
   * La méthode effectue une requête HTTP PATCH pour changer le mot de passe de l'utilisateur auprès de l'API.
   * Les nouveaux mots de passe sont envoyés dans le corps de la requête.
   * La méthode retourne un observable qui émet un événement lorsque la modification de mot de passe est effectuée avec succès.
   */
  public changePassword(
    oldPassword: string,
    newPassword: string
  ): Observable<void> {
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
  // private updateUser(data: any | null) {
  //   this.state.user = data;
  //   this.state.authorities = data?.authorities[0].authority;
  //   if (data) {
  //     this.authUser = {
  //       username: data.username,
  //       id: data.id,
  //       enabled: data.enabled,
  //     };
  //     this.authToken = {
  //       accountNonExpired: data.accountNonExpired,
  //       accountNonLocked: data.accountNonLocked,
  //       credentialsNonExpired: data.credentialsNonExpired,
  //       accessToken: data.accessToken,
  //     };
  //     localStorage.setItem(
  //       AUTHORITIES_KEY,
  //       JSON.stringify(data.authorities[0].authority)
  //     );
  //     localStorage.setItem(TOKEN_KEY, JSON.stringify(this.authToken));
  //     localStorage.setItem(USER_KEY, JSON.stringify(this.authUser));
  //   } else {
  //     localStorage.removeItem(AUTHORITIES_KEY);
  //     localStorage.removeItem(TOKEN_KEY);
  //     localStorage.removeItem(USER_KEY);
  //   }
  // }
}
