import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private baseUrlNotification = `${environment.apiUrl}/api/notifications`;

    constructor(private http: HttpClient) { }

    sendNotificationEmail(email: string, method: string): Observable<any> {
        // Ajouter { responseType: 'text' } pour indiquer que la réponse est en texte brut
        return this.http.post(`${this.baseUrlNotification}/send-email-${method}`, { email }, { responseType: 'text' });
    }
    
}
