import { FacebookLoginProvider, GoogleLoginProvider, SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from '../../services/token-storage.service';

@Component({
  selector: 'app-login-social',
  templateUrl: './login-social.component.html',
  styleUrls: ['./login-social.component.scss']
})
export class LoginSocialComponent implements OnInit {

  constructor(
    private authService: SocialAuthService, 
    private tokenStorage: TokenStorageService, // Injecter le service de stockage
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.authState.subscribe((user: SocialUser) => {
      if (user) {
        console.log('Utilisateur connecté:', user);

         // Sauvegarder les informations utilisateur dans le TokenStorageService
         this.tokenStorage.saveSocialUser(user);
        
         // Sauvegarder le token JWT si nécessaire (optionnel)
         if (user.idToken) {
           this.tokenStorage.saveToken(user.idToken, 'Bearer', false);
         }

        this.router.navigate(['/']); // Redirection après connexion
      }
    });
  }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).catch(error => {
      console.error('Erreur de connexion Google:', error);
    });
  }

  signInWithFacebook(): void {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).catch(error => {
      console.error('Erreur de connexion Facebook:', error);
    });
  }

}
