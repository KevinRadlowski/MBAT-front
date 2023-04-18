import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { TokenStorageService } from '../services/token-storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  form: any = {
    username: '',
    password: '',
  };
  hasError = false;
  hidePassword = true;
  loading = false;
  errorMessage: string = '';
  roles: string[] = [];
  @Output() isLoginFailed: EventEmitter<any> = new EventEmitter();

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastrService: ToastrService,
    private tokenStorage: TokenStorageService
  ) {
    if (this.tokenStorage.isLoggedIn()) {
      this.router.navigate(['/synthesis']);
    }
  }

  login() {
    const { username, password } = this.form;
    this.hasError = false;
    this.loading = true;
    this.authService.login(username, password).subscribe({
      next: (data: any) => {
        this.tokenStorage.saveAll(data);
        this.isLoginFailed.emit(false);
        this.loading = false;
        this.roles = this.tokenStorage.getUser().roles;
        this.router.navigate(['/synthesis']);
      },
      error: (err: any) => {
        this.hasError = true;
        this.errorMessage = 'Les informations saisies sont invalides';
        this.toastrService.error(
          "Une erreur est survenue lors de la connexion, veuillez contacter l'administrateur de l'application. Erreur : " +
            err.message,
          'Connexion impossible'
        );
        this.isLoginFailed.emit(true);
        this.loading = false;
      },
    });
  }
}
