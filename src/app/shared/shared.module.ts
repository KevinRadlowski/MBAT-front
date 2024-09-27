import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from './material.module';
import { AlertComponent } from './alert/alert.component';
import { LoaderComponent } from './loader/loader.component';

@NgModule({ declarations: [
        AlertComponent,
        LoaderComponent
    ],
    exports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        AlertComponent,
        RouterModule,
        LoaderComponent
    ], imports: [CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule], 
    providers: [
        provideHttpClient(), // Configuration recommandée
        // provideHttpClient(withInterceptorsFromDi()), // Configuration recommandée
    // {
    //   provide: HTTP_INTERCEPTORS,
    //   useClass: MyInterceptor, // Remplacez par vos intercepteurs
    //   multi: true,
    // }
    ] })
export class SharedModule { }
