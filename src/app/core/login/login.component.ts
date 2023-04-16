import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  hasError = false;
  hidePassword = true;
  loading = false;
  errorMessage: string = '';

  @Output() isLoginFailed: EventEmitter<any> = new EventEmitter();

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastrService: ToastrService
  ) {
    if (this.authService.state.user) {
      this.router.navigate(['/home']);
    }
  }

  login() {
    this.hasError = false;
    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.isLoginFailed.emit(false);
        this.loading = false;
        this.router.navigate(['/home']);
      },
      error: (err: any) => {
        this.hasError = true;
        this.errorMessage = 'Les informations saisies sont invalides';
        this.toastrService.error(
          "Une erreur est survenue lors de la connexion, veuillez contacter l'administrateur de l'application. Code d'erreur : " +
            err.message,
          'Connexion impossible'
        );
        this.isLoginFailed.emit(true);
        this.loading = false;
      },
    });
  }
}
