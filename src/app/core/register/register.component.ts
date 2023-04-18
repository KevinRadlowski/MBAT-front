import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  username = '';
  password = '';
  passwordRepeat = '';
  hasError = false;
  hidePassword = true;
  hideRepeatPassword = true;
  loading = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private toastrService: ToastrService,
    private tokenStorage: TokenStorageService
  ) {
    if (this.tokenStorage.isLoggedIn()) {
      this.router.navigate(['/synthesis']);
    }
  }

  register() {
    this.hasError = false;
    this.auth.register(this.username, this.password).subscribe({
      next: () => {
        this.router.navigate(['/']);
        this.toastrService.success(
          "L'enregistrement a réussis, veuillez vous connecter avec vos identifiants.",
          'Enregistrement réussi'
        );
      },
      error: (err: any) => {
        this.hasError = true;
        this.toastrService.error(
          "Une erreur est survenue lors de l'enregistrement, veuillez contacter l'administrateur de l'application. Erreur : " +
            err.error.message,
          'Enregistrement impossible'
        );
      },
    });
  }
}
