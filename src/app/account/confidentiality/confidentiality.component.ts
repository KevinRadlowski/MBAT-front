import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TokenStorageService } from 'src/app/core/auth/services/token-storage.service';
import { UserService } from 'src/app/core/auth/signup/signup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CustomValidators } from 'src/app/shared/services/custom-validators';
import { NotificationService } from 'src/app/shared/services/notification.service';

@Component({
  selector: 'app-confidentiality',
  templateUrl: './confidentiality.component.html',
  styleUrls: ['./confidentiality.component.scss']
})
export class ConfidentialityComponent implements OnInit {

  firstMethodConfigured = false;
  twoFactorMethod = '';
  showFirstMethodSetup = false;
  methodSelectionForm!: FormGroup;
  // smsForm!: FormGroup;
  emailForm!: FormGroup;
  authenticatorForm!: FormGroup;
  qrCodeImage: string = '';
  currentStep: number = 0;
  isCodeSent = false; // Indique si le code a été envoyé
  username: string = '';
  showPasswordForm = false;
  showPasswordConfirm2FAForm = false;
  passwordForm!: FormGroup;
  password2FAForm!: FormGroup;

  userId: number | null = null;
  lastUpdatePasswordDate: string = '';
  passwordStrength: number = 0;
  hidePasswordOld = true;
  hidePassword = true;
  securityQuestion: String = '';
  securityAnswer: String = '';

  showSecretQuestionForm = false;
  secretQuestionForm!: FormGroup;

  secretQuestions: string[] = [
    'Quel est le nom de votre premier animal de compagnie ?',
    'Quel est le nom de la rue où vous avez grandi ?',
    'Quel est le prénom de votre meilleur(e) ami(e) d’enfance ?',
    'Quelle est votre destination de vacances favorite ?',
    'Quel est votre plat préféré ?',
    'Quel est le nom de votre premier enseignant(e) ?',
    'Quelle est la couleur de votre première voiture ?',
    'Dans quelle ville vos parents se sont-ils rencontrés ?',
    'Quel est le nom de votre personnage de livre ou de film préféré ?',
    'Quel est le métier que vous vouliez faire enfant ?'
  ];


  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private alertService: AlertService,
    private tokenStorage: TokenStorageService,
    private dialog: MatDialog,
    private notificationService: NotificationService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {

    this.loadUserInfo();

    this.methodSelectionForm.get('method')?.valueChanges.subscribe((selectedMethod) => {
      this.resetFormValidators(selectedMethod);
      if (selectedMethod === 'app') {
        this.loadQrCode();
        this.isCodeSent = true; // Force la validation pour l'étape suivante
      } else {
        this.isCodeSent = false; // Réinitialise pour les autres méthodes
      }
    });
  }

  // Charge les informations de l'utilisateur depuis le stockage du token
  loadUserInfo(): void {
    const user = this.tokenStorage.getUser();
    if (user) {
      this.userId = user.id;
      this.userService.getUser(user.username).subscribe({
        next: (userData: any) => {
          console.log(userData)
          this.firstMethodConfigured = userData.isTwoFactorEnabled;
          this.twoFactorMethod = userData.twoFactorMethod;
          this.securityQuestion = userData.securityQuestion;
          this.lastUpdatePasswordDate = userData.passwordLastUpdated; // Récupère la date de mise à jour
        },
        error: (err: any) => this.alertService.error('Erreur lors de la récupération des informations utilisateur.')
      });
    }
  }

  private initializeForms(): void {
    this.methodSelectionForm = this.fb.group({ method: ['', Validators.required] });

    // this.smsForm = this.fb.group({
    //   phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10}$/)]],
    //   verificationCode: ['']
    // });

    this.emailForm = this.fb.group({
      verificationCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    this.authenticatorForm = this.fb.group({
      authenticatorCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });

    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: CustomValidators.match('newPassword', 'confirmPassword') });

    this.password2FAForm = this.fb.group({
      password: ['', [Validators.required]],
    });

    this.passwordForm.get('newPassword')?.valueChanges.subscribe(() => {
      this.updatePasswordStrength();
    });

    this.secretQuestionForm = this.fb.group({
      newQuestion: ['', Validators.required],
      answer: ['', Validators.required]
    });
  }

  togglePasswordForm(): void {
    if (this.showPasswordForm) {
      // Si le formulaire est déjà ouvert, le fermer et réinitialiser les champs
      this.passwordForm.reset();
    }
    this.showPasswordForm = !this.showPasswordForm;
    this.alertService.clear();
  }

  toggleSecretQuestionForm(): void {
    this.showSecretQuestionForm = !this.showSecretQuestionForm;
    if (!this.showSecretQuestionForm) {
      this.secretQuestionForm.reset();
    }
  }

  private resetFormValidators(selectedMethod: string): void {
    // this.smsForm.get('phoneNumber')?.clearValidators();
    this.emailForm.get('email')?.clearValidators();
    this.authenticatorForm.get('authenticatorCode')?.clearValidators();

    // if (selectedMethod === 'sms') {
    //   this.smsForm.get('phoneNumber')?.setValidators([Validators.required, Validators.pattern(/^\+?[0-9]{10}$/)]);
    // } else

    this.updateAllFormsValidity();
  }

  private updateAllFormsValidity(): void {
    // this.smsForm.updateValueAndValidity();
    this.emailForm.updateValueAndValidity();
    this.authenticatorForm.updateValueAndValidity();
  }

  onPasswordSubmit(): void {
    if (!this.passwordForm.valid) {
      this.alertService.error('Veuillez remplir tous les champs et assurez-vous que la confirmation du mot de passe est correcte.');
      return;
    }

    if (this.userId === null) {
      this.alertService.error('Utilisateur non trouvé. Veuillez vous reconnecter.');
      return;
    }

    // Ouvrir le dialog de confirmation pour demander la réponse à la question secrète
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '500px',
      data: {
        title: 'Confirmer la modification du mot de passe',
        message: 'Veuillez répondre à votre question secrète pour valider la modification du mot de passe.',
        requireSecretAnswer: true,
        secretQuestion: this.securityQuestion
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.secretAnswer) {
        // Vérifier la réponse à la question secrète avec le backend
        this.userService.verifySecretAnswer(this.userId!, result.secretAnswer).subscribe({
          next: (isAnswerCorrect: boolean) => {
            if (isAnswerCorrect) {
              // Si la réponse est correcte, procéder à la modification du mot de passe
              const oldPassword = this.passwordForm.value.oldPassword;
              const newPassword = this.passwordForm.value.newPassword;
              this.userService.changeAuthenticatedUserPassword(oldPassword, newPassword).subscribe({
                next: () => {
                  this.alertService.success('Mot de passe mis à jour avec succès.');
                  this.togglePasswordForm();
                },
                complete: () => {
                  const user = this.tokenStorage.getUser();
                  if (user) {
                    this.notificationService.sendNotificationEmail(user.username, 'password-modified').subscribe();
                  }
                },
                error: (err) => {
                  this.alertService.error('Erreur lors de la mise à jour du mot de passe : ' + err.message);
                }
              });
            } else {
              this.alertService.error('La réponse à la question secrète est incorrecte.');
            }
          },
          error: (err: any) => this.alertService.error(`Erreur lors de la vérification de la réponse à la question secrète : ${err.message}`)
        });
      } else {
        this.alertService.info("Modification du mot de passe annulée.");
      }
    });

    // const oldPassword = this.passwordForm.value.oldPassword;
    // const user = this.tokenStorage.getUser();
    // const newPassword = this.passwordForm.value.newPassword;

    // // Vérification du mot de passe actuel
    // this.userService.validateOldPassword(this.userId, oldPassword).subscribe({
    //   next: (response) => {
    //     // Si le mot de passe est correct, soumettre les nouvelles informations
    //     this.userService.changeAuthenticatedUserPassword(oldPassword, newPassword).subscribe({
    //       next: () => {
    //         this.alertService.success('Mot de passe mis à jour avec succès.');
    //         this.togglePasswordForm();
    //       },
    //       complete: () => {
    //         if (user) {
    //           this.notificationService.sendNotificationEmail(
    //             user.username,
    //             'password-modified',
    //           ).subscribe();
    //         }
    //       },
    //       error: (err) => {
    //         this.alertService.error('Erreur lors de la mise à jour du mot de passe : ' + err.message);
    //       }
    //     });
    //   },
    //   error: (err) => {
    //     this.alertService.error('Ancien mot de passe incorrect.');
    //   }
    // });
  }

  updatePasswordStrength(): void {
    const newPassword = this.passwordForm.get('newPassword')?.value || '';
    if (newPassword.length === 0) {
      this.passwordStrength = 0;
    } else {
      this.passwordStrength = this.getPasswordStrength(newPassword);
    }
  }

  getPasswordStrength(password: string): number {
    let poolSize = 0;

    if (/[a-z]/.test(password)) poolSize += 26;   // Minuscules
    if (/[A-Z]/.test(password)) poolSize += 26;   // Majuscules
    if (/\d/.test(password)) poolSize += 10;      // Chiffres
    if (/[@$!%*?&#]/.test(password)) poolSize += 32; // Symboles spéciaux courants

    const entropy = password.length * Math.log2(poolSize);

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

  // Validation de correspondance des mots de passe
  passwordMatchValidator(form: FormGroup): any {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { mismatch: true };
  }

  onSecretQuestionSubmit(): void {
    if (!this.secretQuestionForm.valid) {
      this.alertService.error('Veuillez sélectionner une question et entrer une réponse.');
      return;
    }

    const updatedQuestion = this.secretQuestionForm.value.newQuestion;
    const updatedAnswer = this.secretQuestionForm.value.answer;
    if (this.userId) {
      this.userService.updateSecretQuestion(this.userId, updatedQuestion, updatedAnswer).subscribe({
        next: () => {
          this.alertService.success('Question secrète mise à jour avec succès.');
          this.securityQuestion = updatedQuestion;
          this.toggleSecretQuestionForm();
        },
        error: (err: any) => this.alertService.error(`Erreur lors de la mise à jour de la question secrète : ${err.message}`)
      });
    }

  }


  startFirstMethodSetup(): void {
    this.showFirstMethodSetup = !this.showFirstMethodSetup;
    this.currentStep = 0;
  }

  cancelSetup(): void {
    this.showFirstMethodSetup = false;
    this.currentStep = 0;
  }

  sendVerificationCode(method: String): void {

    // if (method === 'sms' && this.smsForm.valid) {
    //   const phoneNumber = this.smsForm.value.phoneNumber;
    //   this.userService.sendSmsCode(phoneNumber).subscribe({
    //     next: () => {
    //       this.alertService.success('Code envoyé par SMS.');
    //       this.isCodeSent = true; // Active l'étape suivante
    //     },
    //     error: (err: any) => this.alertService.error(`Erreur lors de l'envoi du SMS : ${err.message}`)
    //   });
    // } else 
    if (method === 'email') {
      this.userService.generateEmailCode(this.username,).subscribe({
        next: () => {
          this.alertService.success('Code envoyé par Email.');
          this.isCodeSent = true; // Active l'étape suivante
        },
        error: (err: any) => this.alertService.error(`Erreur lors de l'envoi de l'email : ${err.message}`)
      });
    }
  }


  isStep2Valid(): boolean {
    const method = this.methodSelectionForm.get('method')?.value;
    if (method === 'email') {
      return this.isCodeSent; // L'étape 2 est validée si le code a été envoyé pour l'email
    } else if (method === 'app') {
      return !!this.qrCodeImage; // L'étape 2 est validée si le QR code est chargé pour l'app
    }
    return false;
  }

  loadQrCode(): void {
    const user = this.tokenStorage.getUser();

    if (user) {
      this.username = user.username;  // Remplace par la propriété correcte si ce n'est pas celle-ci
      this.userService.getQrCode(this.username).subscribe({
        next: (response: any) => {
          if (response && response.qrCodeUrl) {
            this.qrCodeImage = response.qrCodeUrl;
          } else {
            this.alertService.error('Erreur: QR code non reçu.');
          }
        },
        error: (err: any) => this.alertService.error('Erreur lors de la génération du QR code.')
      });
    }
  }


  validateCode(): void {
    const method = this.methodSelectionForm.get('method')?.value;

    // if (method === 'sms' && this.smsForm.valid) {
    //   this.verifySmsCode();
    // } else
    if (method === 'email' && this.emailForm.valid) {
      this.verifyEmailCode();
    } else if (method === 'app' && this.authenticatorForm.valid) {
      this.verifyAuthenticatorCode();
    }
  }

  // private verifySmsCode(): void {
  //   const verificationCode = this.smsForm.value.verificationCode;
  //   this.userService.verifySmsCode(verificationCode).subscribe({
  //     next: () => this.alertService.success('SMS vérifié avec succès.'),
  //     error: (err: any) => this.alertService.error(`Erreur lors de la vérification du SMS : ${err.message}`)
  //   });
  // }

  private verifyEmailCode(): void {
    const verificationCode = this.emailForm.value.verificationCode;
    this.userService.enable2FaEmail(this.username, verificationCode).subscribe({
      next: () => {
        // this.updateUserTwoFactor('email');
        this.alertService.success('Email vérifié avec succès.')
        this.completeSetup('email');

      },
      error: (err: any) => this.alertService.error(`Erreur lors de la vérification de l'email : ${err.message}`)
    });
  }

  private verifyAuthenticatorCode(): void {
    const authenticatorCode = this.authenticatorForm.value.authenticatorCode;
    this.userService.enable2FaApp(this.username, authenticatorCode).subscribe({
      next: () => {
        this.alertService.success('Code Authenticator vérifié avec succès.');
        this.completeSetup('app');
      },
      error: (err: any) => this.alertService.error(`Erreur lors de la vérification du code Authenticator : ${err.message}`)
    });
    // this.userService.verifyAuthenticatorCode(this.username, authenticatorCode).subscribe({
    //   next: () => {
    //     this.alertService.success('Code Authenticator vérifié avec succès.');
    //     this.completeSetup('app');
    //   },
    //   error: (err: any) => this.alertService.error(`Erreur lors de la vérification du code Authenticator : ${err.message}`)
    // });
  }

  private completeSetup(method: string): void {
    // this.updateUserTwoFactor(method);

    if (method == "app") {
      this.notificationService.sendNotificationEmail(
        this.username,
        '2fa-app-enabled',
      ).subscribe();
    } else if (method == "email") {
      this.notificationService.sendNotificationEmail(
        this.username,
        '2fa-email-enabled',
      ).subscribe();
    }
    this.firstMethodConfigured = true; // Pour indiquer que la méthode est configurée
    this.showFirstMethodSetup = false; // Cache le formulaire après la configuration
  }

  getCurrentForm(): FormGroup {
    const method = this.methodSelectionForm.get('method')?.value;

    // if (method === 'sms') {
    //   return this.smsForm;
    // } else 
    if (method === 'email') {
      return this.emailForm;
    } else if (method === 'app') {
      return this.authenticatorForm;
    }
    return new FormGroup({});
  }

  updateUserTwoFactor(method: string): void {
    const user = this.tokenStorage.getUser();
    if (user && user.id !== null) {
      const updatedData = {
        twoFactorMethod: method,
        isTwoFactorEnabled: true,
      };

      this.twoFactorMethod = method;
      this.userService.updateUserTwoFactor(user.id, updatedData).subscribe({
        next: () => this.alertService.success('Authentification à deux facteurs configurée avec succès.'),
        error: (err: any) => this.alertService.error(`Erreur lors de la mise à jour de l'utilisateur : ${err.message}`)
      });
    } else {
      this.alertService.error("L'utilisateur n'a pas d'ID valide.");
    }
  }

  desactivateFirstMethod(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '500px',
      data: {
        title: 'Confirmer la désactivation',
        message: 'Êtes-vous sûr de vouloir désactiver cette méthode d\'authentification ?',
        requirePassword: true // Demande le mot de passe pour la désactivation
      }
    });

    dialogRef.afterClosed().subscribe((password) => {
      if (password) {
        this.verifyPasswordAndDeactivate(password); // Passe le mot de passe directement
      } else {
        this.alertService.info("Désactivation annulée.");
      }
    });

  }

  submitPassword(): void {
    if (this.passwordForm.valid) {
      const password = this.passwordForm.value.password;
      this.verifyPasswordAndDeactivate(password);
    }
  }

  private verifyPasswordAndDeactivate(password: string): void {
    const user = this.tokenStorage.getUser();
    if (user && user.id !== null) {
      this.userService.validateOldPassword(user.id, password).subscribe({
        next: (isPasswordValid: boolean) => {
          if (isPasswordValid && user.id) {
            this.userService.disableUserTwoFactor(user.id).subscribe({
              next: () => {
                this.alertService.success('Authentification à deux facteurs désactivée avec succès.');
                this.firstMethodConfigured = false;
                this.showPasswordForm = false; // Cache le formulaire après la désactivation
              },
              error: (err: any) => this.alertService.error(`Erreur lors de la désactivation du 2FA : ${err.message}`)
            });
          } else {
            this.alertService.error("Mot de passe incorrect.");
          }
        },
        complete: () => {
          this.notificationService.sendNotificationEmail(
            this.username,
            '2fa-email-desactivated'
          ).subscribe();
        },
        error: (err: any) => this.alertService.error(`Erreur de vérification du mot de passe : ${err.message}`)
      });
    } else {
      this.alertService.error("L'ID de l'utilisateur n'est pas valide.");
    }
  }

  forceFormValidation(): void {
    this.methodSelectionForm.markAllAsTouched();
    this.authenticatorForm.valid
    this.updateAllFormsValidity();
  }

}
