import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CustomValidators } from 'src/app/shared/services/custom-validators';
import { UserService } from '../signup.service';
import { User } from 'src/app/shared/model/user.model';
import { tap } from 'rxjs';

@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss']
})
export class SignupFormComponent implements OnInit {
  userRegisterForm: FormGroup;
  hidePassword = true;
  submitted = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private alertService: AlertService,
    private router: Router,
  ) {
    this.userRegisterForm = this.createSignupForm();
  }

  ngOnInit(): void {
  }

  get f(): { [key: string]: AbstractControl } {
    return this.userRegisterForm.controls;
  }

  createSignupForm(): FormGroup {
    return this.fb.group(
      {
        checkCgu: [
          false,
          [Validators.requiredTrue]
        ],
        username: [
          '',
          [Validators.email, Validators.required]
        ],
        password: [
          '',
          [Validators.required,
          // Vérifie si le mot-de-passe entré contient un nombre
          CustomValidators.patternValidator(/\d/, {
            hasNumber: true
          }),
          // Vérifie si le mot-de-passe entré contient une lettre majuscule
          CustomValidators.patternValidator(/[A-Z]/, {
            hasCapitalCase: true
          }),
          // Vérifie si le mot-de-passe entré contient une lettre minuscule
          CustomValidators.patternValidator(/[a-z]/, {
            hasSmallCase: true
          }),
          Validators.minLength(6)]

        ],
        confirmation_password: ['', [Validators.required]],
        confirmation_username: [
          '',
          [Validators.email, Validators.required]
        ]
      },
      {
        validators: [CustomValidators.match('password', 'confirmation_password'), CustomValidators.match('username', 'confirmation_username'),]
      }
    );
  }

  submitFormulaireInscription() {
    this.submitted = true;
    if (this.userRegisterForm.invalid) {
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
      this.alertService.errorAutoClear("Veuillez remplir les champs indiqués", true);
      return;
    }
    this.loading = true;
    const user: User = this.userRegisterForm.value;
    this.userService.createUser(user).pipe(tap({
      next: () => {
        this.loading = false;
        this.router.navigate(['../login']);
        this.alertService
          .success('Votre inscription à été prise en compte. Vous venez de recevoir un mail de confirmation. Vous pouvez vous connecter.', true);
      },
      error: (error) => {
        window.scroll({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
        this.alertService.error(error.error.message, true);
        this.loading = false;
      }
    }

    ),
    ).subscribe();
  }

}
