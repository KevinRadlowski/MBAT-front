import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthLoginInfo } from '../../helpers/login-info';
import { TokenStorageService } from '../../services/token-storage.service';
import { UserService } from '../../signup/signup.service';
import { AlertService } from 'src/app/shared/services/alert.service';
import { ApiError } from 'src/app/shared/model/error.model';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {
  public formConnect: FormGroup;
  hidePassword = true;
  errorMessage = '';
  loading = false;
  private errorHandled = false; // Ajouter un indicateur pour éviter la double gestion d'erreur
  private loginInfo!: AuthLoginInfo;
  @Output() showResendVerificationButton: EventEmitter<boolean> = new EventEmitter(); // Ajouter un indicateur pour afficher ou non le bouton de renvoi d'email de validation du compte
  @Output() showResendUnlockButton: EventEmitter<boolean> = new EventEmitter(); // Ajouter un indicateur pour afficher ou non le bouton de renvoi d'email de déverouillage du compte
  @Output() isLoginFailed: EventEmitter<any> = new EventEmitter();
  @Output() emailNonValide: EventEmitter<string> = new EventEmitter(); // Émet l'email pour le renvoi de validation


  constructor(
    private tokenStorage: TokenStorageService,
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
    private alertService: AlertService
  ) {
    this.formConnect = this.connectForm();
  }

  get f() { return this.formConnect.controls; }

  ngOnInit(): void {
  }

  connectForm(): FormGroup {
    return this.fb.group(
      {
        username: [
          '',
          Validators.compose([Validators.required])
        ],
        password: [
          '',
          Validators.compose([Validators.required])
        ],
        rememberMe: [
          false
        ]
      }
    );
  }


  submitFormulaireConnexion() {
    this.loginInfo = this.formConnect.value;
    this.loading = true;
    this.errorHandled = false;

    if (this.formConnect.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      this.alertService.error(this.errorMessage, true);
      return;
    }

    const rememberMe = this.formConnect.get('rememberMe')?.value || false;

    this.userService.login(this.loginInfo.username, this.loginInfo.password).subscribe({
      next: (data) => {
        this.tokenStorage.saveAll(data, rememberMe);
        this.tokenStorage.updateAuthStatus(); // Mise à jour immédiate de l'état        
        this.isLoginFailed.emit(false);
        this.loading = false;
        this.router.navigate(['../index']); // Redirection après connexion
      },
      error: (error: ApiError) => {
        this.errorHandled = true;
        const errorMessage = error.message || 'Une erreur est survenue';
        const userEmail = error.email || this.formConnect.get('username')?.value;

        if (errorMessage.includes('compte non validé')) {
          this.showResendVerificationButton.emit(true);
          this.emailNonValide.emit(userEmail);
          this.alertService.error('Votre compte n\'est pas encore validé. Veuillez vérifier vos emails.', false);
        } else if (errorMessage.includes('Votre compte est actuellement verrouillé')) {
          this.showResendUnlockButton.emit(true);
          this.alertService.error(errorMessage);
        } else {
          this.showResendVerificationButton.emit(false);
          this.alertService.error(errorMessage);
        }

        this.isLoginFailed.emit(true);
        this.loading = false;
      }
    });
  }

}