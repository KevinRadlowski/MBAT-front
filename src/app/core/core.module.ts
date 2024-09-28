import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { AuthComponent } from './auth/auth.component';
import { LoginSocialComponent } from './auth/login/login-social/login-social.component';
import { LoginComponent } from './auth/login/login.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { SignupSocialComponent } from './auth/signup/signup-social/signup-social.component';
import { SignupComponent } from './auth/signup/signup.component';
import { SignupFormComponent } from './auth/signup/signup-form/signup-form.component';
import { LoginFormComponent } from './auth/login/login-form/login-form.component';
import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';

@NgModule({
  declarations: [
    AuthComponent,
    LoginComponent,
    LoginFormComponent,
    LoginSocialComponent,
    ResetPasswordComponent,
    SignupComponent,
    SignupFormComponent,
    SignupSocialComponent,
    VerifyEmailComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
  exports: [
    VerifyEmailComponent
  ],
  providers: []
})
export class CoreModule { }
