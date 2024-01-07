import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthLoginInfo } from '../helpers/login-info';

const AUTH_API = 'http://localhost:8080/api/auth/';
const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  constructor(private http: HttpClient) { }
  
  login(credentials: AuthLoginInfo): Observable<any> {
    return this.http.post(AUTH_API + 'signin', credentials, httpOptions);
  }
  
  register(user: Object): Observable<any> {
    return this.http.post(AUTH_API + 'register', user, httpOptions);
  }

}