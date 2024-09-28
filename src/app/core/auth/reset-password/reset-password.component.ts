import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../signup/signup.service';
import { AlertService } from 'src/app/shared/services/alert.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  isResetFormVisible = false;
  token: string | null = null;
  hidePassword = true;
  errorMessage = '';
  formReset: FormGroup;
  isLoading = false; // Ajout du flag pour le loader

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private alertService: AlertService // Injecter le service d'alertes
  ) {
    this.formReset = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.token = params.get('token');
      if (this.token) {
        this.isResetFormVisible = true;
        this.formReset.get('email')?.disable();
      } else {
        this.formReset.get('password')?.disable();
      }
    });
  }

  submitFormulaireReinitialisationMdp(): void {
    if (this.formReset.invalid) {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      this.alertService.error(this.errorMessage, true);
      return;
    }
    this.isLoading = true; // Activer le loader au début de la soumission

    if (this.isResetFormVisible && this.token) {
      const newPassword = this.formReset.value.password;
      this.userService.resetPassword(this.token, newPassword).subscribe({
        next: () => {
          this.isLoading = false; // Désactiver le loader
          this.alertService.success('Mot de passe mis à jour avec succès, veuillez vous connecter.', true);
          setTimeout(() => {
            this.router.navigate(['/login']); // Redirige vers la page de connexion après soumission
          }, 100); // Délai court pour s'assurer que le message est bien enregistré
        },
        error: (err) => {
          this.isLoading = false; // Désactiver le loader
          this.alertService.error('Erreur lors de la réinitialisation du mot de passe :', err);
        }
      });
    } else {
      const email = this.formReset.value.email;
      this.userService.requestPasswordReset(email).subscribe({
        next: () => {
          this.isLoading = false; // Désactiver le loader
          this.alertService.success('Lien de réinitialisation envoyé, veuillez vérifier votre boîte de réception.', true, 15000);
          setTimeout(() => {
            this.router.navigate(['/login']); // Redirige vers la page de connexion après soumission
          }, 100); // Délai court pour s'assurer que le message est bien enregistré
        },
        error: (err) => {
          this.isLoading = false; // Désactiver le loader
          this.alertService.error('Erreur lors de l\'envoi du lien de réinitialisation :', err);
        }
      });
    }
  }
  
}
