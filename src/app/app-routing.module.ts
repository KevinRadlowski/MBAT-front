import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './core/auth/signup/signup.component';
import { ResetPasswordComponent } from './core/auth/reset-password/reset-password.component';
import { LoginComponent } from './core/auth/login/login.component';
import { AuthGuard } from './core/auth/helpers/auth.guard';
import { VerifyEmailComponent } from './core/auth/verify-email/verify-email.component';
import { UnlockAccountComponent } from './core/auth/unlock-account/unlock-account.component';
import { AccountComponent } from './account/account.component';
import { ConfidentialityComponent } from './account/confidentiality/confidentiality.component';
import { PersonalInformationsComponent } from './account/personal-informations/personal-informations.component';
import { SubscriptionComponent } from './account/subscription/subscription.component';
import { AccountsComponent } from './account/accounts/accounts.component';

const routes: Routes = [
  { path: '', redirectTo: '/index', pathMatch: 'full' },
  { path: 'register', component: SignupComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'login', component: LoginComponent },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'unlock-account', component: UnlockAccountComponent },
  {
    path: 'my-account',
    component: AccountComponent,
    canActivate: [AuthGuard],
    children: [  // Définition des routes enfants
      {
        path: '',  // Route vide pour rediriger automatiquement vers 'personal-informations'
        redirectTo: 'personal-informations',
        pathMatch: 'full'
      },
      {
        path: 'confidentiality',
        component: ConfidentialityComponent  // Le composant pour la confidentialité
      },
      {
        path: 'personal-informations',
        component: PersonalInformationsComponent  // Un autre exemple de route enfant
      },
      {
        path: 'subscription',
        component: SubscriptionComponent  // Un autre exemple de route enfant
      },
      {
        path: 'accounts',
        component: AccountsComponent  // Un autre exemple de route enfant
      }
    ]
  },
  // { path: 'synthesis', component: SynthesisComponent, canActivate: [AuthGuard] },
  // { path: 'tracking', component: ProjectComponent, , canActivate: [AuthGuard] },
  // { path: 'configuration', component: ProjectComponent, , canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
