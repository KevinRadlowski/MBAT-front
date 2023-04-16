import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthLoginInfo } from '../helpers/login-info';
import { User } from 'src/app/shared/model/user.model';

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
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  /**
   * Envoie une requête HTTP POST à l'API pour authentifier un utilisateur avec un nom d'utilisateur et un mot de passe.
   * @param {string} username - Le nom d'utilisateur de l'utilisateur qui tente de se connecter.
   * @param {string} password - Le mot de passe de l'utilisateur qui tente de se connecter.
   * @returns {Observable<any>} - Un observable qui émet une réponse HTTP de l'API lorsqu'elle est disponible.
   */
  login(username: string, password: string): Observable<any> {
    return this.http.post(
      '/api/user/signin',
      {
        username,
        password,
      },
      httpOptions);
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
    return this.http.post('/api/user/signout', {}, httpOptions);
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

}