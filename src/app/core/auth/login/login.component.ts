import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Observable } from 'rxjs';
import { UserService } from '../signup/signup.service';
import { TokenStorageService } from '../services/token-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  alertMessage$: Observable<any> | undefined;
  showResendVerificationButton = false; // Ajoutez cette propriété pour contrôler l'affichage du bouton de validation du compte
  showResendUnlockButton = false; // Ajoutez cette propriété pour contrôler l'affichage du bouton de déverouillage du compte
  userEmail: string = ''; // Stocke l'email de l'utilisateur

  constructor(private alertService: AlertService, private userService: UserService) { }

  ngOnInit(): void {
    this.alertMessage$ = this.alertService.getMessage();
    this.alertMessage$.subscribe(message => {
      if (message) {
        console.log('Message reçu sur la page de connexion :', message);
      }
    });
  }

  onEmailNonValide(email: string): void {
    this.userEmail = email; // Sauvegarde l'email pour renvoyer l'email de validation
  }

  onShowResendValidationButton(showResendVerificationButton: boolean): void {
    this.showResendVerificationButton = showResendVerificationButton; // Sauvegarde l'email pour renvoyer l'email de validation
  }

  onShowResendUnlockButton(showResendUnlockButton: boolean): void {
    this.showResendUnlockButton = showResendUnlockButton; // Sauvegarde l'email pour renvoyer l'email de validation
  }

  resendVerificationEmail(): void {
    if (this.userEmail) {
      this.userService.resendVerificationEmail(this.userEmail).subscribe({
        next: () => {
          this.alertService.success('Un nouveau mail de validation a été envoyé à votre adresse e-mail.', true);
        },
        error: (err) => {
          this.alertService.error('Erreur lors de l\'envoi du mail de validation. Veuillez réessayer plus tard', true);
          console.error(err);
        }
      });
    }
  }

  resendUnlockEmail(): void {
    if (this.userEmail) {
      this.userService.resendUnlockEmail(this.userEmail).subscribe({
        next: () => {
          this.alertService.success('Un nouveau mail de déverrouillage a été envoyé à votre adresse e-mail.', true);
        },
        error: () => {
          this.alertService.error('Erreur lors de l\'envoi du mail de déverrouillage. Veuillez réessayer plus tard.', true);
        }
      });
    }
  }
}
