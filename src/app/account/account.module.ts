import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { AccountComponent } from './account.component';
import { ConfidentialityComponent } from './confidentiality/confidentiality.component';
import { SubscriptionComponent } from './subscription/subscription.component';
import { PersonalInformationsComponent } from './personal-informations/personal-informations.component';
import { AccountsComponent } from './accounts/accounts.component';

@NgModule({
  declarations: [
    AccountComponent,
    ConfidentialityComponent,
    SubscriptionComponent,
    PersonalInformationsComponent,
    AccountsComponent
  ],
  imports: [
    CommonModule,
    SharedModule
  ],
  providers: []
})
export class AccountModule { }
