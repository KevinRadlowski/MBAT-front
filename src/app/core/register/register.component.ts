import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  passwordRepeat = '';
  hasError = false;
  hidePassword = true;
  hideRepeatPassword = true;
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastrService: ToastrService
  ) {}

  register() {
    this.hasError = false;
    this.auth
      .register({
        username: this.email,
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
          this.toastrService.success(
            "L'enregistrement à réussis, veuillez vous connecter avec vos identifiants.",
            'Enregistrement réussi'
          );
        },
        error: (err: any) => {
          this.hasError = true;
          this.toastrService.error(
            "Une erreur est survenue lors de l'enregistrement, veuillez contacter l'administrateur de l'application. Code d'erreur : " +
              err.message,
            'Enregistrement impossible'
          );
        },
      });
  }
}
