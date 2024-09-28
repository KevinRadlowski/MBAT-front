import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../signup/signup.service';
import { AlertService } from 'src/app/shared/services/alert.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent implements OnInit {
  isLoading = true;
  isVerified = false;
  errorMessage = '';

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.userService.verifyEmail(token).subscribe({
          next: () => {
            this.isLoading = false;
            this.isVerified = true;
            this.alertService.success('Compte vérifié avec succès. Vous pouvez maintenant vous connecter.', true);
            this.router.navigate(['/login']);
          },
          error: (err) => {
            this.isLoading = false;
            this.isVerified = false;
            this.errorMessage = 'Erreur lors de la vérification du compte : ' + (err.error?.message || err.message);
            this.alertService.error(this.errorMessage);
          }
        });
      } else {
        this.isLoading = false;
        this.errorMessage = 'Le lien de vérification est invalide. Veuillez vérifier votre e-mail et essayer à nouveau.';
        this.alertService.error(this.errorMessage);
      }
    });
  }

  resendVerificationEmail(): void {
    const email = this.route.snapshot.queryParams['email'];
    if (email) {
      this.userService.resendVerificationEmail(email).subscribe({
        next: () => {
          this.alertService.success('Un nouvel e-mail de vérification a été envoyé. Veuillez vérifier votre boîte de réception.', true);
        },
        error: (err) => {
          this.alertService.error('Erreur lors de l\'envoi de l\'e-mail de vérification : ' + (err.error?.message || err.message));
        }
      });
    } else {
      this.alertService.error('L\'adresse e-mail n\'est pas disponible pour renvoyer l\'e-mail de vérification.');
    }
  }
}
