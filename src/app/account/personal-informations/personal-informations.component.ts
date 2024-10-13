import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TokenStorageService } from 'src/app/core/auth/services/token-storage.service';
import { UserService } from 'src/app/core/auth/signup/signup.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CustomValidators } from 'src/app/shared/services/custom-validators';

@Component({
  selector: 'app-personal-informations',
  templateUrl: './personal-informations.component.html',
  styleUrl: './personal-informations.component.scss'
})
export class PersonalInformationsComponent {
  emailForm: FormGroup;
  passwordForm: FormGroup;
  hidePassword = true;
  hidePasswordOld = true;
  currentEmail: string = '';  // Email actuel de l'utilisateur
  showEmailForm = false;
  showPasswordForm = false;
  userId: number | null = null;
  isVerified: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private tokenStorage: TokenStorageService,
    private alertService: AlertService
  ) {
    this.emailForm = this.fb.group({
      email: [
        '',
        [Validators.email, Validators.required]
      ],
      confirmation_email: [
        '',
        [Validators.email, Validators.required]
      ],
    },
      {
        validators: CustomValidators.match('email', 'confirmation_email')
      })

    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: [
        '',
        [Validators.required,
        // Vérifie si le mot-de-passe entré contient un nombre
        CustomValidators.patternValidator(/\d/, {
          hasNumber: true
        }),
        // Vérifie si le mot-de-passe entré contient une lettre majuscule
        CustomValidators.patternValidator(/[A-Z]/, {
          hasCapitalCase: true
        }),
        // Vérifie si le mot-de-passe entré contient une lettre minuscule
        CustomValidators.patternValidator(/[a-z]/, {
          hasSmallCase: true
        }),
        Validators.minLength(6)]

      ],
      confirmPassword: ['', [Validators.required]]
    }, { validator: CustomValidators.match('password', 'confirmation_password') });
  }

  ngOnInit(): void {
    this.loadUserInfo();
  }

  // Charge les informations de l'utilisateur depuis le stockage du token
  loadUserInfo(): void {
    const user = this.tokenStorage.getUser();
    if (user) {
      this.currentEmail = user.username;  // Remplacer par le bon champ email si besoin
      this.userId = user.id;
      this.userService.getUser(user.username).subscribe((userData: any) => {
        this.isVerified = userData.verified;  // Assigner l'état de vérification
      });
    }
  }

  toggleEmailForm(): void {
    this.showEmailForm = !this.showEmailForm;
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
  }

  // Soumission du formulaire de modification d'email
  onEmailSubmit(): void {
    if (this.emailForm.valid && this.userId !== null) {
      const newEmail = this.emailForm.value.email;
      this.userService.updateUser(this.userId, { username: newEmail }).subscribe({
        next: () => {
          this.alertService.success('Adresse email mise à jour avec succès.');
          this.currentEmail = newEmail;  // Mise à jour de l'email affiché
          this.tokenStorage.saveUsername(this.currentEmail);
          this.isVerified = false;  // Réinitialise l'état de vérification
          this.toggleEmailForm();
        },
        error: (err) => {
          this.alertService.error('Erreur lors de la mise à jour de l\'email : ' + err.message);
        }
      });
    }
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.valid && this.userId !== null) {  // Vérification explicite que this.userId n'est pas null
      const oldPassword = this.passwordForm.value.oldPassword;
  
      console.log("userid: " + this.userId)
      // Vérification du mot de passe actuel
      this.userService.checkOldPassword(this.userId, oldPassword).subscribe({
        next: (response) => {
          console.log("response : " + response)
          // Si le mot de passe est correct, soumettre les nouvelles informations
          const newPassword = this.passwordForm.value.newPassword;
      console.log("userid: " + this.userId)
      this.userService.updateUserPassword(this.userId!, { oldPassword, newPassword }).subscribe({
            next: () => {
              this.alertService.success('Mot de passe mis à jour avec succès.');
              this.togglePasswordForm();
            },
            error: (err) => {
              this.alertService.error('Erreur lors de la mise à jour du mot de passe : ' + err.message);
            }
          });
        },
        error: (err) => {
          this.alertService.error('Ancien mot de passe incorrect.');
        }
      });
    } else {
      this.alertService.error('Utilisateur non trouvé. Veuillez vous reconnecter.');
    }
  }

  // Validation de correspondance des mots de passe
  passwordMatchValidator(form: FormGroup): any {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  // Suppression du compte utilisateur
  onDeleteAccount(): void {
    if (this.userId !== null) {
      this.userService.deleteUser(this.userId).subscribe({
        next: () => {
          this.alertService.success('Compte supprimé avec succès.');
          this.tokenStorage.signOut();  // Déconnexion après suppression
          window.location.reload();  // Redirection vers la page d'accueil ou login
        },
        error: (err) => {
          console.error('Erreur lors de la suppression du compte :', err);
          this.alertService.error('Erreur lors de la suppression du compte : ' + err.message);
        }
      });
    }
  }
}
