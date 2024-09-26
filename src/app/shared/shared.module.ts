import { CommonModule } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from './material.module';
import { AlertComponent } from './alert/alert.component';

@NgModule({ declarations: [
        AlertComponent,
    ],
    exports: [
        HttpClientModule,
        CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        AlertComponent,
        RouterModule,
    ], imports: [CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class SharedModule { }
