import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { LoginSocialComponent } from './auth/login/login-social/login-social.component';
import { LoginComponent } from './auth/login/login.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { SignupSocialComponent } from './auth/signup/signup-social/signup-social.component';
import { SignupComponent } from './auth/signup/signup.component';
import { SignupFormComponent } from './auth/signup/signup-form/signup-form.component';
import { LoginFormComponent } from './auth/login/login-form/login-form.component';
import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';
import { UnlockAccountComponent } from './auth/unlock-account/unlock-account.component';
import { ResendUnlockEmailComponent } from './auth/resend-unlock-email/resend-unlock-email.component';

@NgModule({
  declarations: [
    LoginComponent,
    LoginFormComponent,
    LoginSocialComponent,
    ResetPasswordComponent,
    SignupComponent,
    SignupFormComponent,
    SignupSocialComponent,
    VerifyEmailComponent,
    UnlockAccountComponent,
    ResendUnlockEmailComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
  ],
  exports: [
    VerifyEmailComponent,
    UnlockAccountComponent,
    ResendUnlockEmailComponent
  ],
  providers: []
})
export class CoreModule { }
