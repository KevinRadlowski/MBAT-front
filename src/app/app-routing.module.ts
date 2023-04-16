import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './core/auth/signup/signup.component';
import { ResetPasswordComponent } from './core/auth/reset-password/reset-password.component';
import { LoginComponent } from './core/auth/login/login.component';
import { AuthGuard } from './core/auth/helpers/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/index', pathMatch: 'full' },
  { path: 'register', component: SignupComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'login', component: LoginComponent },
  // { path: 'synthesis', component: SynthesisComponent, canActivate: [AuthGuard] },
  // { path: 'tracking', component: ProjectComponent, , canActivate: [AuthGuard] },
  // { path: 'configuration', component: ProjectComponent, , canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
