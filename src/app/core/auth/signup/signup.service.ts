import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
};
@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = `${environment.apiUrl}/api/user`;

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

  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/check-email?email=${email}`);
  }


  createUser(user: Object): Observable<Object> {
    return this.http.post(`${this.baseUrl}` + `/signup`, user).pipe(
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

  // Méthode pour demander la réinitialisation du mot de passe
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email }, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/reset-password`,
      { token, newPassword },
      httpOptions // Pas besoin de spécifier responseType ici si on attend une réponse JSON
    ).pipe(
      catchError(this.handleError)
    );
  }
  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/verify-email`, {
      params: { token },
      responseType: 'text' // Indique que la réponse attendue est du texte
    }).pipe(
      catchError(this.handleError)
    );
  }

  resendVerificationEmail(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/resend-verification-email`, { email }, httpOptions);
  }


  /**
 * Gère les erreurs provenant de l'API et génère un message d'erreur approprié.
 * @param {HttpErrorResponse} error - L'objet d'erreur provenant de l'API.
 * @returns {Observable<Error>} - Un observable contenant un message d'erreur.
 */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      if (typeof error.error === 'string') {
        errorMessage = error.error; // Si la réponse est une chaîne de texte, c'est notre message d'erreur.
      } else if (error.error instanceof Blob && error.error.type === 'text/plain') {
        // Convertir Blob en texte si c'est une réponse en texte
        return new Observable(observer => {
          const reader = new FileReader();
          reader.onload = () => {
            errorMessage = reader.result as string;
            observer.error(new Error(errorMessage));
          };
          reader.onerror = () => {
            observer.error(new Error('An unknown error occurred!'));
          };
          reader.readAsText(error.error);
        });
      }
      // Gestion des statuts HTTP
      switch (error.status) {
        case 401:
          errorMessage = 'Identifiant ou mot de passe incorrect.'; // Par défaut, si le message n'est pas spécifique
          if (error.error?.message) {
            errorMessage = error.error.message; // Prendre le message spécifique de l'erreur si disponible
          }
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
