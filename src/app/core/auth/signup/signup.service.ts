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

  // private baseUrl = `${environment.apiUrl}/api/user`;
  private baseUrlUser = `${environment.apiUrl}/api/user`;
  private baseUrlAuth = `${environment.apiUrl}/api/auth`;
  private baseUrlPassword = `${environment.apiUrl}/api/password`;
  private baseUrlTwoFactor = `${environment.apiUrl}/api/twofactor`;

  constructor(private http: HttpClient) { }



  // ----------- MÉTHODES DU AuthController -----------



  /**
     * Authentifie un utilisateur avec nom d'utilisateur et mot de passe.
     * @param {string} username - Le nom d'utilisateur.
     * @param {string} password - Le mot de passe.
     * @returns {Observable<any>} - Un observable de la réponse de l'API.
     */
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.baseUrlAuth}/signin`, { username, password }, httpOptions).pipe(
      catchError(this.handleError)
    );
  }
  /**
     * Déconnecte l'utilisateur.
     * @returns {Observable<any>} - Un observable de la réponse de l'API.
     */
  logout(): Observable<any> {
    return this.http.post(`${this.baseUrlAuth}/logout`, {}, httpOptions).pipe(
      catchError(this.handleError)
    );
  }


  /**
   * Rafraîchit le token JWT pour l'utilisateur.
   * @param {string} refreshToken - Le token de rafraîchissement.
   * @returns {Observable<any>} - Un observable avec le nouveau token JWT.
   */
  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post(`${this.baseUrlAuth}/refresh-token`, { refreshToken }, httpOptions).pipe(
      catchError(this.handleError)
    );
  }



  // ----------- MÉTHODES DU UserController -----------



  /**
     * Obtient un utilisateur par son nom d'utilisateur.
     * @param {string} username - Le nom d'utilisateur.
     * @returns {Observable<any>} - Un observable de la réponse de l'API.
     */
  getUser(username: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrlUser}/get-one/${username}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Vérifie si un e-mail existe dans la base de données.
   * @param {string} email - L'e-mail à vérifier.
   * @returns {Observable<boolean>} - Un observable avec true/false.
   */
  checkEmailExists(email: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrlUser}/check-email?email=${email}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
     * Créé un nouvel utilisateur.
     * @param {Object} user - Les informations de l'utilisateur à créer.
     * @returns {Observable<Object>} - Un observable de la réponse de l'API.
     */
  createUser(user: Object): Observable<Object> {
    return this.http.post(`${this.baseUrlUser}/signup`, user, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Met à jour un utilisateur existant.
   * @param {number} id - L'identifiant de l'utilisateur à mettre à jour.
   * @param {any} value - Les nouvelles valeurs à mettre à jour.
   * @returns {Observable<Object>} - Un observable de la réponse de l'API.
   */
  updateUser(id: number, value: any): Observable<Object> {
    return this.http.put(`${this.baseUrlUser}/${id}`, value, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Supprime un utilisateur.
   * @param {number} id - L'identifiant de l'utilisateur à supprimer.
   * @returns {Observable<any>} - Un observable de la réponse de l'API.
   */
  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrlUser}/delete-user/${id}`, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
     * Vérifie l'e-mail de l'utilisateur.
     * @param {string} token - Le jeton de vérification.
     * @returns {Observable<any>} - Un observable avec la réponse de l'API.
     */
  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.baseUrlUser}/verify-email`, {
      params: { token },
      responseType: 'text'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
 * Renvoyer l'e-mail de vérification.
 * @param {string} email - L'adresse e-mail de l'utilisateur.
 * @returns {Observable<any>} - Un observable de la réponse de l'API.
 */
  resendVerificationEmail(email: string): Observable<any> {
    return this.http.post(`${this.baseUrlUser}/resend-verification-email`, { email }, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
* Renvoyer un e-mail de déverrouillage de compte.
* @param {string} email - L'adresse e-mail de l'utilisateur.
* @returns {Observable<any>} - Un observable de la réponse de l'API.
*/
  resendUnlockEmail(email: string): Observable<any> {
    return this.http.post(`${this.baseUrlUser}/resend-unlock-email`, { email }, httpOptions).pipe(
      catchError(this.handleError)
    );
  }


  /**
   * Met à jour le thème de l'utilisateur.
   * @param {string} theme - Le thème choisi par l'utilisateur.
   * @returns {Observable<any>} - Un observable avec la réponse de l'API.
   */
  updateUserTheme(theme: string): Observable<any> {
    return this.http.patch(`${this.baseUrlUser}/update-theme`, { theme }, httpOptions).pipe(
      catchError(this.handleError)
    );
  }



  // ----------- MÉTHODES DU PasswordController -----------



  /**
     * Demande de réinitialisation de mot de passe par e-mail.
     * @param {string} email - L'adresse e-mail de l'utilisateur.
     * @returns {Observable<any>} - Un observable avec la réponse de l'API.
     */
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.baseUrlPassword}/request-reset`, { email }, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Réinitialise le mot de passe de l'utilisateur avec un jeton.
   * @param {string} token - Le jeton de réinitialisation.
   * @param {string} newPassword - Le nouveau mot de passe.
   * @returns {Observable<any>} - Un observable avec la réponse de l'API.
   */
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrlPassword}/reset-password`, { token, newPassword }, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Vérifie si l'ancien mot de passe est correct pour un utilisateur donné.
   * @param {number} userId - L'identifiant de l'utilisateur.
   * @param {string} oldPassword - L'ancien mot de passe à vérifier.
   * @returns {Observable<any>} - Un observable avec la réponse de l'API.
   */
  validateOldPassword(userId: number, oldPassword: string): Observable<any> {
    return this.http.get(`${this.baseUrlPassword}/validate-old-password`, {
      params: {
        userId: userId.toString(),
        oldPassword
      }
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Change le mot de passe de l'utilisateur actuellement authentifié.
   * @param {string} oldPassword - L'ancien mot de passe.
   * @param {string} newPassword - Le nouveau mot de passe.
   * @returns {Observable<any>} - Un observable avec la réponse de l'API.
   */
  changeAuthenticatedUserPassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.patch(`${this.baseUrlPassword}/change`, { oldPassword, newPassword }, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Met à jour le mot de passe d'un utilisateur spécifique (pour les administrateurs).
   * @param {number} id - L'identifiant de l'utilisateur.
   * @param {string} newPassword - Le nouveau mot de passe.
   * @returns {Observable<any>} - Un observable avec la réponse de l'API.
   */
  adminUpdateUserPassword(id: number, newPassword: string): Observable<any> {
    return this.http.put(`${this.baseUrlPassword}/admin/update/${id}`, { newPassword }, httpOptions).pipe(
      catchError(this.handleError)
    );
  }



  // ----------- MÉTHODES DU TwoFactorAuthController -----------

  // ------------ 2FA APP AUTHENTICATOR ------------

  /**
   * Génère un QR code pour l'Authenticator App.
   * @param {string} username - Le nom d'utilisateur.
   * @returns {Observable<any>} - Un observable avec la réponse de l'API.
   */
  getQrCode(username: string): Observable<any> {
    return this.http.post(`${this.baseUrlTwoFactor}/generate-qr`, { username }, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
  * Active la validation 2FA avec une app Authenticator.
  * @param {string} email - L'adresse e-mail de l'utilisateur.
  * @returns {Observable<any>} - Un observable avec la réponse de l'API.
  */
  enable2FaApp(username: string, code: string): Observable<any> {
    return this.http.post(`${this.baseUrlTwoFactor}/enable-2fa/app`, { username, code }, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // ------------ 2FA SMS ------------

  /**
   * Envoie le code SMS pour la validation 2FA.
   * @param {string} phoneNumber - Le numéro de téléphone.
   * @returns {Observable<any>} - Un observable avec la réponse de l'API.
   */
  sendSmsCode(phoneNumber: string): Observable<any> {
    return this.http.post(`${this.baseUrlTwoFactor}/enable-2fa/sms`, { phoneNumber }, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Vérifie le code envoyé par SMS pour la validation 2FA.
   * @param {string} code - Le code envoyé par SMS.
   * @returns {Observable<any>} - Un observable avec la réponse de l'API.
   */
  verifySmsCode(code: string): Observable<any> {
    return this.http.post(`${this.baseUrlTwoFactor}/verify-2fa/sms`, { code }, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  //------------ 2FA EMAIL ------------

  /**
 * Envoie le code par e-mail pour la validation 2FA.
 * @param {string} email - L'adresse e-mail de l'utilisateur.
 * @returns {Observable<any>} - Un observable avec la réponse de l'API.
 */
  generateEmailCode(username: string): Observable<any> {
    return this.http.post(`${this.baseUrlTwoFactor}/generate-email-code`, { username }, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
* Active la validation 2FA avec une app Authenticator.
* @param {string} email - L'adresse e-mail de l'utilisateur.
* @returns {Observable<any>} - Un observable avec la réponse de l'API.
*/
  enable2FaEmail(username: string, code: string): Observable<any> {
    return this.http.post(`${this.baseUrlTwoFactor}/enable-2fa/email`, { username, code }, httpOptions).pipe(
      catchError(this.handleError)
    );
  }


    /**
   * Vérifie le code envoyé soit par l'Authenticator App, soit par mail, soit par SMS pour la validation 2FA.
   * @param {string} username - Le nom d'utilisateur.
   * @param {string} code - Le code généré par l'Authenticator App.
   * @returns {Observable<any>} - Un observable avec la réponse de l'API.
   */
    verify2FaCode(username: string, code: string): Observable<any> {
      return this.http.post(`${this.baseUrlTwoFactor}/verify-2fa`, { username, code }, httpOptions).pipe(
        catchError(this.handleError)
      );
    }

  // ------------ 2FA BACKUP ------------

  /**
   * Récupère les codes de secours pour l'utilisateur.
   * @param {string} username - Le nom d'utilisateur.
   * @returns {Observable<any>} - Un observable avec les codes de secours.
   */
  getBackupCodes(username: string): Observable<any> {
    return this.http.get(`${this.baseUrlTwoFactor}/backup-codes?username=${username}`, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Génère de nouveaux codes de secours pour l'utilisateur.
   * @param {string} username - Le nom d'utilisateur.
   * @returns {Observable<any>} - Un observable avec les nouveaux codes de secours.
   */
  generateNewBackupCodes(username: string): Observable<any> {
    return this.http.post(`${this.baseUrlTwoFactor}/generate-new-backup-codes`, { username }, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  updateUserTwoFactor(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrlTwoFactor}/update-twofactor/${id}`, data, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  disableUserTwoFactor(id: number): Observable<any> {
    return this.http.put(`${this.baseUrlTwoFactor}/disable-twofactor/${id}`, {}, httpOptions).pipe(
      catchError(this.handleError)
    );
  }


  // ----------- GESTION DES ERREURS -----------


  /**
 * Gère les erreurs provenant de l'API et génère un message d'erreur approprié.
 * @param {HttpErrorResponse} error - L'objet d'erreur provenant de l'API.
 * @returns {Observable<Error>} - Un observable contenant un message d'erreur.
 */
  private handleError(error: HttpErrorResponse): Observable<never> {
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
