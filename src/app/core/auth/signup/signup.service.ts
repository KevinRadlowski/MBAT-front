import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiError } from 'src/app/shared/model/error.model';

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

  getUser(username: String): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/get-one/${username}`).pipe(
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

  deleteUser(id: Number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete-user/${id}`).pipe(
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

  checkOldPassword(userId: number, oldPassword: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/check-old-password`, {
      params: {
        userId: userId.toString(),
        oldPassword: oldPassword
      }
    });
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

  // Méthode pour renvoyer un mail de déverrouillage
  resendUnlockEmail(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/resend-unlock-email`, { email }, httpOptions);
  }


  // Méthode pour rafraîchir le token
  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/refresh-token`, { refreshToken });
}


  /**
 * Gère les erreurs provenant de l'API et génère un message d'erreur approprié.
 * @param {HttpErrorResponse} error - L'objet d'erreur provenant de l'API.
 * @returns {Observable<Error>} - Un observable contenant un message d'erreur.
 */
  private handleError(error: HttpErrorResponse): Observable<never> {
    // let apiError: ApiError;
    // let errorMessage = 'An unknown error occurred!';
    // if (error.error instanceof ErrorEvent) {
    //   // Erreur côté client
    //   errorMessage = `Error: ${error.error.message}`;
    // } else {
    //   console.log(error);
    //   console.log(error.status);
    //   // Erreur côté serveur
    //   if (typeof error.error === 'string') {
    //     errorMessage = error.error; // Si la réponse est une chaîne de texte, c'est notre message d'erreur.
    //   } else if (error.error instanceof Blob && error.error.type === 'text/plain') {
    //     // Convertir Blob en texte si c'est une réponse en texte
    //     return new Observable(observer => {
    //       const reader = new FileReader();
    //       reader.onload = () => {
    //         errorMessage = reader.result as string;
    //         observer.error(new Error(errorMessage));
    //       };
    //       reader.onerror = () => {
    //         observer.error(new Error('An unknown error occurred!'));
    //       };
    //       reader.readAsText(error.error);
    //     });
    //   }
    //   // Gestion des statuts HTTP
    //   switch (error.status) {
    //     case 401:
    //       errorMessage = 'Identifiant ou mot de passe incorrect.'; // Par défaut, si le message n'est pas spécifique
    //       if (error.error?.message) {
    //         errorMessage = error.error.message; // Prendre le message spécifique de l'erreur si disponible
    //       }
    //       break;
    //     case 403:
    //       errorMessage = 'Vous n\'avez pas la permission pour effectuer cette action.';
    //       break;
    //     case 404:
    //       errorMessage = 'Ressource non trouvée.';
    //       break;
    //     default:
    //       errorMessage = `Erreur serveur: ${error.message}`;
    //       break;
    //   }
    // }
    // return throwError(() => new Error(errorMessage));



    // -----------------------------------------------------

    //   let errorMessage = 'Une erreur inconnue est survenue !';
    // if (error.error instanceof ErrorEvent) {
    //   // Erreur côté client
    //   errorMessage = `Erreur: ${error.error.message}`;
    // } else {
    //   // Erreur côté serveur
    //   if (typeof error.error === 'string') {
    //     errorMessage = error.error; // Si la réponse est une chaîne de texte, c'est notre message d'erreur.
    //   } else if (error.error && error.error.message) {
    //     // Ici, nous extrayons le message d'erreur du back-end
    //     errorMessage = error.error.message;
    //   }
    //   switch (error.status) {
    //     case 401:
    //       errorMessage = 'Identifiant ou mot de passe incorrect.';
    //       break;
    //     case 404:
    //       errorMessage = 'Utilisateur non trouvé.';
    //       break;
    //     case 400:
    //       errorMessage = error.error.message || 'Requête incorrecte.';
    //       break;
    //     default:
    //       errorMessage = `Erreur serveur: ${error.message}`;
    //   }
    // }
    // return throwError(() => new Error(errorMessage));

    // ----------------------------------------------------------------------

    let errorMessage = 'Une erreur inconnue est survenue !';
    let email = ''; // Ajout pour capturer l'email s'il est fourni dans la réponse

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Erreur côté serveur
      if (typeof error.error === 'string') {
        errorMessage = error.error; // Si la réponse est une chaîne de texte, c'est notre message d'erreur.
      } else if (error.error && error.error.message) {
        // Ici, nous extrayons le message d'erreur du back-end
        errorMessage = error.error.message;
        if (error.error.email) {
          email = error.error.email; // Capture l'email s'il est renvoyé par le back-end
        }
      }

      switch (error.status) {
        case 401: // Gérer les erreurs 401 (Unauthorized)
          errorMessage = error.error.message || 'Identifiant ou mot de passe incorrect.';
          break;
        case 403:
          errorMessage = 'Vous n\'avez pas la permission pour effectuer cette action.';
          break;
        case 404:
          errorMessage = 'Utilisateur non trouvé.';
          break;
        case 400:
          errorMessage = error.error.message || 'Requête incorrecte.';
          break;
        default:
          errorMessage = `Erreur serveur: ${error.message}`;
      }
    }

    // Ajouter les informations de l'email dans l'erreur si présent
    const errorObj = new Error(errorMessage);
    (errorObj as any).email = email;
    return throwError(() => errorObj);
  }



}
