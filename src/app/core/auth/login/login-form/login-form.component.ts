import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthLoginInfo } from '../../helpers/login-info';
import { AuthService } from '../../services/auth.service';
import { TokenStorageService } from '../../services/token-storage.service';
import { UserService } from '../../signup/signup.service';
import { AlertService } from 'src/app/shared/services/alert.service';

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
  @Output() isLoginFailed: EventEmitter<any> = new EventEmitter();

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
    this.errorHandled = false; // Réinitialiser l'indicateur avant chaque tentative de connexion
  
    if (this.formConnect.invalid) {
      // Vérifiez si le formulaire est invalide et affichez un message d'erreur
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      this.alertService.error(this.errorMessage, true);
      return;
    }
  
    // Récupérer l'état de la checkbox "Se souvenir de moi"
    const rememberMe = this.formConnect.get('rememberMe')?.value || false;
  
    this.userService.login(this.loginInfo.username, this.loginInfo.password).subscribe({
      next: (data) => {
        this.tokenStorage.saveAll(data, rememberMe); // Sauvegarde des données de connexion
        this.isLoginFailed.emit(false);
        this.loading = false;
        this.router.navigate(['../index']); // Redirection après connexion
      },
      error: (error) => {
        this.errorHandled = true; // Indiquer que l'erreur est gérée
        this.errorMessage = error.message;
        this.alertService.errorAutoClear(this.errorMessage, true); // Affichage du message d'erreur
        this.isLoginFailed.emit(true);
        this.loading = false;
      }
    });
  }
  

}