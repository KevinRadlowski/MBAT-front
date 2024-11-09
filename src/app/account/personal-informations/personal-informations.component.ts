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
  currentEmail: string = '';  // Email actuel de l'utilisateur
  showEmailForm = false;

  passwordForm: FormGroup;
  validationPasswordForm: FormGroup;
  hidePassword = true;
  hideCurrentPassword = true;
  hidePasswordOld = true;
  showPasswordForm = false;
  showValidationPasswordForm = false;
  lastUpdatePasswordDate: string = '';
  passwordStrength: number = 0;

  phoneForm: FormGroup;
  currentPhone: string = '';  // Numéro de téléphone actuel de l'utilisateur
  showPhoneForm = false;


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

    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: [
        '',
        [Validators.required,
          // Vérifie si le mot-de-passe entré contient un nombre
          // CustomValidators.patternValidator(/\d/, {
          //   hasNumber: true
          // }),
          // // Vérifie si le mot-de-passe entré contient une lettre majuscule
          // CustomValidators.patternValidator(/[A-Z]/, {
          //   hasCapitalCase: true
          // }),
          // // Vérifie si le mot-de-passe entré contient une lettre minuscule
          // CustomValidators.patternValidator(/[a-z]/, {
          //   hasSmallCase: true
          // }),
          // Validators.minLength(6)
        ]

      ],
      confirmPassword: ['', [Validators.required]]
    }, { validator: CustomValidators.match('password', 'confirmation_password') });

    this.validationPasswordForm = this.fb.group({
      password: ['', Validators.required]
    });

    this.passwordForm.get('newPassword')?.valueChanges.subscribe(() => {
      this.updatePasswordStrength();
    });

    this.phoneForm = this.fb.group({
      phone: ['', [Validators.required, Validators.pattern(/^(\+?\d{1,3}[- ]?)?\d{10}$/)]], // Regex pour le numéro de téléphone
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
        this.lastUpdatePasswordDate = userData.passwordLastUpdated; // Récupère la date de mise à jour
      });
    }
  }

  toggleEmailForm(): void {
    if (this.showEmailForm) {
      // Si le formulaire est déjà ouvert, le fermer et réinitialiser les champs
      this.emailForm.reset();
    }
    this.showEmailForm = !this.showEmailForm;
  }

  togglePasswordForm(): void {
    if (this.showPasswordForm) {
      // Si le formulaire est déjà ouvert, le fermer et réinitialiser les champs
      this.passwordForm.reset();
    }
    this.showPasswordForm = !this.showPasswordForm;
  }

  togglePhoneForm(): void {
    if (this.showPhoneForm) {
      this.phoneForm.reset();
    }
    this.showPhoneForm = !this.showPhoneForm;
  }

  // Soumission du formulaire de modification d'email
  onEmailSubmit(): void {
    if (this.emailForm.valid && this.userId !== null) {
      const newEmail = this.emailForm.value.email;
      const currentPassword = this.emailForm.value.currentPassword;

      this.userService.checkEmailExists(newEmail).subscribe({
        next: (emailExists: boolean) => {
          if (emailExists) {
            this.alertService.error("L'email est déjà utilisé.");
          } else {
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
  }

  onPasswordSubmit(): void {
    if (this.passwordForm.valid && this.userId !== null) {  // Vérification explicite que this.userId n'est pas null
      const oldPassword = this.passwordForm.value.oldPassword;
      const user = this.tokenStorage.getUser();

      // Vérification du mot de passe actuel
      this.userService.validateOldPassword(this.userId, oldPassword).subscribe({
        next: (response) => {
          // Si le mot de passe est correct, soumettre les nouvelles informations
          const newPassword = this.passwordForm.value.newPassword;
          this.userService.changeAuthenticatedUserPassword(oldPassword, newPassword).subscribe({
            next: () => {
              this.alertService.success('Mot de passe mis à jour avec succès.');
              this.togglePasswordForm();
            },
            complete: () => {
              if (user) {
                this.notificationService.sendNotificationEmail(
                  user.username,
                  'password-modified',
                ).subscribe();
              }
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

  onPhoneSubmit(): void {
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

  // Suppression du compte utilisateur
  // onDeleteAccount(): void {

  //   const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
  //     width: '500px',
  //     data: {
  //       title: 'Confirmer la suppression',
  //       message: 'Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.'
  //     }
  //   });

  //   dialogRef.afterClosed().subscribe((confirmed: boolean) => {
  //     if (confirmed && this.userId !== null) {
  //       this.userService.deleteUser(this.userId).subscribe({
  //         next: () => {
  //           this.alertService.success('Compte supprimé avec succès.');
  //           this.tokenStorage.signOut(); // Déconnexion après suppression
  //           window.location.reload(); // Redirection vers la page d'accueil
  //         },
  //         complete: () => {
  //           this.notificationService.sendNotificationEmail(
  //             this.currentEmail,
  //             'account-deleted'
  //           ).subscribe();
  //         },
  //         error: (err) => {
  //           this.alertService.error('Erreur lors de la suppression du compte : ' + err.message);
  //         }
  //       });
  //     } else {
  //       this.alertService.info("Suppression annulée.");
  //     }
  //   });

  // }


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
        console.log("result : " + result);
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
                this.tokenStorage.signOut(); // Déconnexion après suppression
                window.location.reload(); // Redirection vers la page d'accueil
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

  getPasswordStrength(password: string): number {
    let poolSize = 0;

    if (/[a-z]/.test(password)) poolSize += 26;   // Minuscules
    if (/[A-Z]/.test(password)) poolSize += 26;   // Majuscules
    if (/\d/.test(password)) poolSize += 10;      // Chiffres
    if (/[@$!%*?&#]/.test(password)) poolSize += 32; // Symboles spéciaux courants

    const length = password.length;
    const entropy = length * Math.log2(poolSize);

    // Classifier la force en fonction de l'entropie
    if (entropy < 28) {
      return 1; // Très faible
    } else if (entropy < 36) {
      return 2; // Faible
    } else if (entropy < 60) {
      return 3; // Moyenne
    } else if (entropy < 128) {
      return 4; // Forte
    } else {
      return 5; // Très forte
    }
  }

  updatePasswordStrength(): void {
    const newPassword = this.passwordForm.get('newPassword')?.value || '';
    if (newPassword.length === 0) {
      this.passwordStrength = 0;
    } else {
      this.passwordStrength = this.getPasswordStrength(newPassword);
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
      return this.currentPhone.replace(/.(?=.{2})/g, '*'); // Remplace tous les caractères sauf les deux derniers par des étoiles
    }
  }


}
