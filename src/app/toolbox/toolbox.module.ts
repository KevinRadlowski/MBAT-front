import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ContactFormComponent } from './contact/contact-form/contact-form.component';
import { ContactComponent } from './contact/contact.component';
import { FaqComponent } from './faq/faq.component';
import { ToolboxRoutingModule } from './toolbox-routing.module';
import { ToolboxComponent } from './toolbox.component';

@NgModule({
  declarations: [
    ToolboxComponent,
    ContactComponent,
    FaqComponent,
    ContactFormComponent
  ],
  imports: [
    CommonModule,
    ToolboxRoutingModule
  ],
  providers: [  ]
})
export class ToolboxModule { }
