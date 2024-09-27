import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlertStorageService {
  private alertMessage: string | null = null;

  // Stocker le message d'alerte
  setAlertMessage(message: string) {
    this.alertMessage = message;
  }

  // Récupérer le message d'alerte
  getAlertMessage(): string | null {
    const message = this.alertMessage;
    this.alertMessage = null; // Effacer le message après récupération
    return message;
  }

  // Effacer le message d'alerte
  clearAlertMessage() {
    this.alertMessage = null;
  }
}
