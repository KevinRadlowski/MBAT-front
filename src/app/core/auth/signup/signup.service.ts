import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  };
@Injectable({
    providedIn: 'root'
})
export class UserService {

    private baseUrl = 'http://192.168.56.101:8080/api/user';

    constructor(private http: HttpClient) { }

      /**
   * Envoie une requête HTTP POST à l'API pour authentifier un utilisateur avec un nom d'utilisateur et un mot de passe.
   * @param {string} username - Le nom d'utilisateur de l'utilisateur qui tente de se connecter.
   * @param {string} password - Le mot de passe de l'utilisateur qui tente de se connecter.
   * @returns {Observable<any>} - Un observable qui émet une réponse HTTP de l'API lorsqu'elle est disponible.
   */
  login(username: string, password: string): Observable<any> {
    return this.http.post(
        `${this.baseUrl}` + `/signin`,
      {
        username,
        password,
      },
      httpOptions).pipe(
        catchError(this.handleError)
      );
  }

    getUser(username: String): Observable<Object> {
        return this.http.get(`${this.baseUrl}/get-one/${username}`).pipe(
            catchError(this.handleError)
          );
    }

    createUser(customer: Object): Observable<Object> {
        return this.http.post(`${this.baseUrl}` + `/signup`, customer).pipe(
            catchError(this.handleError)
          );
    }

    updateUser(id: Number, value: any): Observable<Object> {
        return this.http.put(`${this.baseUrl}/${id}`, value).pipe(
            catchError(this.handleError)
          );
    }

    updateUserPassword(id: Number, value: any): Observable<Object> {
        return this.http.put(`${this.baseUrl}/update-password/${id}`, value).pipe(
            catchError(this.handleError)
          );
    }

    deleteUser(username: String): Observable<any> {
        return this.http.delete(`${this.baseUrl}/delete-user/${username}`).pipe(
            catchError(this.handleError)
          );
    }

    /**
   * Gère les erreurs provenant de l'API et génère un message d'erreur approprié.
   * @param {HttpErrorResponse} error - L'objet d'erreur provenant de l'API.
   * @returns {Observable<Error>} - Un observable contenant un message d'erreur.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      switch (error.status) {
        case 401:
          errorMessage = 'Identifiant ou mot de passe incorrect.';
          break;
        case 403:
          errorMessage = 'Vous n\'avez pas la permission pour effectuer cette action.';
          break;
        case 404:
          errorMessage = 'Ressource non trouvée.';
          break;
        default:
          errorMessage = `Erreur serveur: ${error.message}`;
          break;
      }
    }
    return throwError(() => new Error(errorMessage));
  }

}
