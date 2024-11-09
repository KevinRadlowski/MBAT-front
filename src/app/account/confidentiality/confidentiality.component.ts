import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { TokenStorageService } from 'src/app/core/auth/services/token-storage.service';
import { UserService } from 'src/app/core/auth/signup/signup.service';
import { ConfirmationDialogComponent } from 'src/app/shared/confirmation-dialog/confirmation-dialog.component';
import { AlertService } from 'src/app/shared/services/alert.service';
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
  passwordForm!: FormGroup;

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
    const user = this.tokenStorage.getUser();

    if (user && user.username) {
      this.username = user.username;
      this.userService.getUser(this.username).subscribe({
        next: (response: any) => {
          if (response && response.isTwoFactorEnabled) {
            this.firstMethodConfigured = response.isTwoFactorEnabled;
            this.twoFactorMethod = response.twoFactorMethod;
          }
        },
        error: (err: any) => this.alertService.error('Erreur lors de la récupération des informations utilisateur.')
      });
    }

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

  // Initialize forms
  private initializeForms(): void {
    this.methodSelectionForm = this.fb.group({
      method: ['', Validators.required]
    });

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
      password: ['', Validators.required]
    });
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
    if (!this.showPasswordForm) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '500px',
        data: {
          title: 'Confirmer la désactivation',
          message: 'Êtes-vous sûr de vouloir désactiver cette méthode d\'authentification ?'
        }
      });

      dialogRef.afterClosed().subscribe((confirmed: boolean) => {
        if (confirmed) {
          this.showPasswordForm = true; // Affiche le formulaire de mot de passe après la confirmation
        } else {
          this.alertService.error("Désactivation annulée.");
        }
      });
    } else {
      this.showPasswordForm = false;
      this.passwordForm.reset(); // Réinitialise le champ de mot de passe
    }

  }

  submitPassword(): void {
    if (this.passwordForm.valid) {
      const password = this.passwordForm.value.password;
      this.verifyPasswordAndDeactivate(password);
    }
  }

  // desactivateFirstMethod(): void {

  //   const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
  //     width: '300px',
  //     data: { message: 'Veuillez confirmer la désactivation en entrant votre mot de passe.' }
  //   });

  //   dialogRef.afterClosed().subscribe((password: string | null) => {
  //     if (password !== null) {
  //       // Vérifier le mot de passe avant de désactiver
  //       this.verifyPasswordAndDeactivate(password);
  //     } else {
  //       this.alertService.error("Désactivation annulée.");
  //     }
  //   });

  // const user = this.tokenStorage.getUser();
  // if (user && user.id !== null) {
  //   this.userService.disableUserTwoFactor(user.id).subscribe({
  //     next: () => {
  //       this.alertService.success('Authentification à deux facteurs désactivée avec succès.');
  //       this.firstMethodConfigured = false;
  //       this.showFirstMethodSetup = false; // Masquer le formulaire de configuration
  //     },
  //     error: (err: any) => this.alertService.error(`Erreur lors de la désactivation du 2FA : ${err.message}`)
  //   });
  // } else {
  //   this.alertService.error("L'ID de l'utilisateur n'est pas valide.");
  // }
  // }

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
