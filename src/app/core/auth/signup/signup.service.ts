import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

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
      httpOptions);
  }

    getUser(username: String): Observable<Object> {
        return this.http.get(`${this.baseUrl}/get-one/${username}`);
    }

    createUser(customer: Object): Observable<Object> {
        return this.http.post(`${this.baseUrl}` + `/signup`, customer);
    }

    updateUser(id: Number, value: any): Observable<Object> {
        return this.http.put(`${this.baseUrl}/${id}`, value);
    }

    updateUserPassword(id: Number, value: any): Observable<Object> {
        return this.http.put(`${this.baseUrl}/update-password/${id}`, value);
    }

    deleteUser(username: String): Observable<any> {
        return this.http.delete(`${this.baseUrl}/delete-user/${username}`);
    }

}
