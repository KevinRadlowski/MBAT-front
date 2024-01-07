import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private baseUrl = 'http://localhost:8080/api/user';

    constructor(private http: HttpClient) { }

    getUser(username: String): Observable<Object> {
        return this.http.get(`${this.baseUrl}/get-one/${username}`);
    }

    createUser(customer: Object): Observable<Object> {
        return this.http.post(`${this.baseUrl}` + `/create`, customer);
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
