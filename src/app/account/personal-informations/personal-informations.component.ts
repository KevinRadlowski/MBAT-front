import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TokenStorageService } from 'src/app/core/auth/services/token-storage.service';
import { UserService } from 'src/app/core/auth/signup/signup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CustomValidators } from 'src/app/shared/services/custom-validators';
import { NotificationService } from 'src/app/shared/services/notification.service';

@Component({
  selector: 'app-personal-informations',
  templateUrl: './personal-informations.component.html',
  styleUrl: './personal-informations.component.scss'
})
export class PersonalInformationsComponent {
  userId: number | null = null;
  isVerified: boolean = false;

  emailForm: FormGroup;
  nameForm: FormGroup;
  phoneForm: FormGroup;

  showEmailForm = false;
  showPasswordForm = false;
  showPhoneForm = false;
  showNameForm = false;

  currentEmail: string = '';  // Email actuel de l'utilisateur
  currentPhone: string = '';  // Numéro de téléphone actuel de l'utilisateur
  currentFirstName: string = ''; // Stockage du prénom actuel
  currentLastName: string = ''; // Stockage du nom actuel

  hidePassword = true;
  hideCurrentPassword = true;


  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private tokenStorage: TokenStorageService,
    private alertService: AlertService,
    private notificationService: NotificationService,
    private dialog: MatDialog  // Injection de MatDialog pour afficher la boîte de dialogue de confirmation
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
      currentPassword: ['', Validators.required] // Champ pour confirmer l’identité
    },
      {
        validators: CustomValidators.match('email', 'confirmation_email')
      })

    this.phoneForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^(\+?\d{1,3}[- ]?)?\d{10}$/)]], // Regex pour le numéro de téléphone
      currentPassword: ['', Validators.required]
    });

    this.nameForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      currentPassword: ['', Validators.required]
    });
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
        this.currentPhone = userData.phone || '';
        this.currentFirstName = userData.firstName;
        this.currentLastName = userData.lastName;
      });
    }
  }

  toggleEmailForm(): void {
    if (this.showEmailForm) {
      // Si le formulaire est déjà ouvert, le fermer et réinitialiser les champs
      this.emailForm.reset();
    }
    this.showEmailForm = !this.showEmailForm;
    this.alertService.clear();
  }

  togglePhoneForm(): void {
    if (this.showPhoneForm) {
      this.phoneForm.reset();
    }
    this.showPhoneForm = !this.showPhoneForm;
    this.alertService.clear();
  }

  toggleNameForm(): void {
    if (this.showNameForm) {
      this.nameForm.reset();
    }
    this.showNameForm = !this.showNameForm;
    this.alertService.clear();
  }

  // Soumission du formulaire de modification d'email
  onEmailSubmit(): void {
    // Vérification initiale de la validité du formulaire pour l'affichage des erreurs de champ


    if (!this.emailForm.controls['email'].valid && !this.emailForm.controls['confirmation_email'].valid) {
      this.alertService.error('Veuillez remplir tous les champs et assurez-vous que la confirmation de l\'email est correcte.');
      return;
    }

    if (!this.emailForm.controls['currentPassword'].valid) {
      this.alertService.error('Veuillez saisir votre mot de passe.');
      return;
    }
    // Vérification de l'identifiant utilisateur
    if (this.userId === null) {
      this.alertService.error('Utilisateur non trouvé. Veuillez vous reconnecter.');
      return;
    }

    const newEmail = this.emailForm.value.email;
    const currentPassword = this.emailForm.value.currentPassword;

    this.userService.checkEmailExists(newEmail).subscribe({
      next: (emailExists: boolean) => {
        if (emailExists) {
          this.alertService.error("L'email est déjà utilisé.");
        } else {

          if (!currentPassword) {
            this.alertService.error("Veuillez entrer votre mot de passe actuel pour confirmer la modification.");
            return;
          }

          if (this.userId) {
            // Vérification du mot de passe avant de procéder au changement d'email
            this.userService.validateOldPassword(this.userId, currentPassword).subscribe({
              next: (isPasswordValid) => {
                if (isPasswordValid && this.userId) {
                  this.userService.updateUser(this.userId, { username: newEmail }).subscribe({
                    next: (response: any) => {
                      this.alertService.success('Adresse email mise à jour avec succès.');
                      this.currentEmail = newEmail;
                      this.tokenStorage.saveToken(response.jwt, 'Bearer', false); // Sauvegarde du nouveau JWT
                      this.tokenStorage.saveUsername(this.currentEmail);
                      this.isVerified = false;
                      this.toggleEmailForm();
                    },
                    complete: () => {
                      this.notificationService.sendNotificationEmail(newEmail, 'email-modified').subscribe();
                    },
                    error: (err) => {
                      this.alertService.error('Erreur lors de la mise à jour de l\'email : ' + err.message);
                    }
                  });
                } else {
                  this.alertService.error("Mot de passe incorrect.");
                }
              },
              error: () => this.alertService.error('Erreur de vérification du mot de passe.')
            });
          }
        }
      },
      error: () => this.alertService.error('Erreur lors de la vérification de l\'email.')
    });

  }
  onPhoneSubmit(): void {
    if (!this.phoneForm.controls['phone'].valid) {
      this.alertService.error('Veuillez saisir un numéro de téléphone.');
      return;
    }
    if (!this.phoneForm.controls['currentPassword'].valid) {
      this.alertService.error('Veuillez saisir votre mot de passe.');
      return;
    }

    if (this.phoneForm.valid && this.userId !== null) {
      const newPhone = this.phoneForm.value.phone;
      const currentPassword = this.phoneForm.value.currentPassword;

      this.userService.validateOldPassword(this.userId, currentPassword).subscribe({
        next: (isPasswordValid) => {
          if (isPasswordValid && this.userId) {
            this.userService.updateUser(this.userId, { phone: newPhone }).subscribe({
              next: () => {
                this.alertService.success('Numéro de téléphone mis à jour avec succès.');
                this.currentPhone = newPhone;
                this.togglePhoneForm();
              },
              error: (err) => {
                this.alertService.error('Erreur lors de la mise à jour du téléphone : ' + err.message);
              }
            });
          } else {
            this.alertService.error("Mot de passe incorrect.");
          }
        },
        error: () => this.alertService.error('Erreur de vérification du mot de passe.')
      });
    }
  }

  onNameSubmit(): void {
    if (this.nameForm.invalid) {
      this.alertService.error('Veuillez remplir tous les champs et fournir le mot de passe actuel.');
      return;
    }

    if (this.userId === null) {
      this.alertService.error('Utilisateur non trouvé. Veuillez vous reconnecter.');
      return;
    }

    const { firstName, lastName, currentPassword } = this.nameForm.value;

    this.userService.validateOldPassword(this.userId, currentPassword).subscribe({
      next: (isPasswordValid) => {
        if (isPasswordValid && this.userId) {
          this.userService.updateUser(this.userId, { firstName, lastName }).subscribe({
            next: () => {
              this.alertService.success('Prénom et nom mis à jour avec succès.');
              this.currentFirstName = firstName;
              this.currentLastName = lastName;
              this.toggleNameForm();
            },
            error: (err) => {
              this.alertService.error('Erreur lors de la mise à jour du nom et prénom : ' + err.message);
            }
          });
        } else {
          this.alertService.error("Mot de passe incorrect.");
        }
      },
      error: () => this.alertService.error('Erreur de vérification du mot de passe.')
    });
  }

  onDeleteAccount(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '500px',
      data: {
        title: 'Confirmer la suppression',
        message: 'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.',
        requirePassword: true // Demande le mot de passe pour la suppression
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('result :' + result)
        this.submitPasswordForAccountDeletion(result);
      } else {
        this.alertService.info("Suppression du compte annulée.");
      }
    });
  }

  submitPasswordForAccountDeletion(password: string): void {
    if (this.userId !== null) {
      this.userService.validateOldPassword(this.userId, password).subscribe({
        next: (isPasswordValid) => {
          if (isPasswordValid && this.userId) {
            this.userService.deleteUser(this.userId).subscribe({
              next: () => {
                this.alertService.success('Compte supprimé avec succès.');
                this.tokenStorage.signOut();
                window.location.reload();
              },
              complete: () => {
                this.notificationService.sendNotificationEmail(this.currentEmail, 'account-deleted').subscribe();
              },
              error: (err) => {
                this.alertService.error('Erreur lors de la suppression du compte : ' + err.message);
              }
            });
          } else {
            this.alertService.error("Mot de passe incorrect.");
          }
        },
        error: () => this.alertService.error('Erreur de vérification du mot de passe.')
      });
    }
  }

  getMaskedEmail(): string {
    if (this.showEmailForm) {
      return this.currentEmail; // Affiche l'email en clair
    } else {
      const [firstChar, ...rest] = this.currentEmail.split('@')[0];
      const lastChar = rest.pop();
      return `${firstChar}*******${lastChar}@${this.currentEmail.split('@')[1]}`; // Affiche l'email masqué
    }
  }

  getMaskedPhone(): string {
    if (this.showPhoneForm) {
      return this.currentPhone;
    } else {
      if (this.currentPhone) {
        return this.currentPhone.replace(/.(?=.{2})/g, '*'); // Remplace tous les caractères sauf les deux derniers par des étoiles
      } else return "Aucun numéro de téléphone enregistré"
    }
  }
}
