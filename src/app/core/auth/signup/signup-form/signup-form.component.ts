import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService } from 'src/app/shared/services/alert.service';
import { CustomValidators } from 'src/app/shared/services/custom-validators';
import { UserService } from '../signup.service';
import { User } from 'src/app/shared/model/user.model';
import { debounceTime, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss']
})
export class SignupFormComponent implements OnInit {
  userRegisterForm: FormGroup;
  submitted = false;
  isLoading = false;
  emailExists = false;
  hidePassword = true;
  passwordStrength: number = 0;
  steps: number[] = [1, 2, 3, 4];
  currentStep: number = 1;

  securityQuestions: string[] = [
    'Quel est le nom de votre premier animal de compagnie ?',
    'Quel est le nom de la rue où vous avez grandi ?',
    'Quel est le prénom de votre meilleur(e) ami(e) d’enfance ?',
    'Quelle est votre destination de vacances favorite ?',
    'Quel est votre plat préféré ?',
    'Quel est le nom de votre premier enseignant(e) ?',
    'Quelle est la couleur de votre première voiture ?',
    'Dans quelle ville vos parents se sont-ils rencontrés ?',
    'Quel est le nom de votre personnage de livre ou de film préféré ?',
    'Quel est le métier que vous vouliez faire enfant ?'
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private alertService: AlertService,
    private router: Router
  ) {
    this.userRegisterForm = this.createSignupForm();
    this.securityGroup.get('password')?.valueChanges.subscribe(() => {
      this.updatePasswordStrength();
    });
  }

  ngOnInit(): void {
    // Vérification de l'email en temps réel
    this.basicInfoGroup.get('email')?.valueChanges.pipe(
      debounceTime(1500),
      switchMap(value => this.userService.checkEmailExists(value)),
      tap((exists: boolean) => {
        this.emailExists = exists;
        if (exists) {
          this.alertService.error('Cet email est déjà utilisé.');
          this.basicInfoGroup.get('email')?.setErrors({ emailExists: true });
        } else {
          this.alertService.clear();
          this.basicInfoGroup.get('email')?.setErrors(null);
        }
      })
    ).subscribe();
  }

  createSignupForm(): FormGroup {
    return this.fb.group({
      basicInfoGroup: this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', Validators.pattern('^[0-9]{10}$')]
      }),
      securityGroup: this.fb.group({
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required]
      }, { validators: CustomValidators.match('password', 'confirmPassword') }),
      securityQuestionGroup: this.fb.group({
        securityQuestion: ['', Validators.required],
        securityAnswer: ['', Validators.required]
      }),
      conditionsGroup: this.fb.group({
        acceptTerms: [false, Validators.requiredTrue],
        acceptPrivacy: [false, Validators.requiredTrue]
      })
    });
  }

  get basicInfoGroup(): FormGroup {
    return this.userRegisterForm.get('basicInfoGroup') as FormGroup;
  }

  get securityGroup(): FormGroup {
    return this.userRegisterForm.get('securityGroup') as FormGroup;
  }

  get securityQuestionGroup(): FormGroup {
    return this.userRegisterForm.get('securityQuestionGroup') as FormGroup;
  }

  get conditionsGroup(): FormGroup {
    return this.userRegisterForm.get('conditionsGroup') as FormGroup;
  }


  submitFormulaireInscription(): void {
    this.submitted = true;
    if (this.userRegisterForm.invalid) {
      this.alertService.errorAutoClear("Veuillez remplir les champs indiqués", true);
      return;
    }

    this.isLoading = true;
    const user: User = this.userRegisterForm.getRawValue();
    console.log(this.userRegisterForm.getRawValue());

    const userPayload = {
      username: this.basicInfoGroup.get('email')?.value,
      phone: this.basicInfoGroup.get('phone')?.value,
      firstName: this.basicInfoGroup.get('firstName')?.value,
      lastName: this.basicInfoGroup.get('lastName')?.value,
      password: this.securityGroup.get('password')?.value,
      securityQuestion: this.securityQuestionGroup.get('securityQuestion')?.value,
      securityAnswer: this.securityQuestionGroup.get('securityAnswer')?.value
    };

    this.userService.createUser(userPayload).pipe(
      tap({
        next: () => {
          this.isLoading = false;
          this.router.navigate(['../login']);
          this.alertService.success('Inscription réussie. Un mail de confirmation a été envoyé.', true);
        },
        error: (error) => {
          const errorMessage = error.error.message || 'Erreur lors de l\'inscription. Veuillez vérifier les informations et réessayer.';
          this.alertService.error(errorMessage, true);
          this.isLoading = false;
        }
      })
    ).subscribe();
  }

  nextStep(): void {
    switch (this.currentStep) {
      case 1:
        if (this.basicInfoGroup.valid) {
          this.currentStep++;
          this.alertService.clear();
        } else {
          this.basicInfoGroup.markAllAsTouched();
          this.alertService.error('Veuillez remplir tous les champs de l’étape Informations de base.');
        }
        break;
      case 2:
        if (this.securityGroup.valid) {
          this.currentStep++;
          this.alertService.clear();
        } else {
          this.securityGroup.markAllAsTouched();
          const passwordControl = this.securityGroup.get('password');
          const confirmPasswordControl = this.securityGroup.get('confirmPassword');

          if (!passwordControl?.value) {
            this.alertService.error('Veuillez remplir les champs de l’étape Sécurité');
          } else if (passwordControl.value !== confirmPasswordControl?.value) {
            this.alertService.error('La confirmation du mot de passe ne correspond pas');
          } else {
            this.alertService.error('Veuillez remplir correctement les champs de l’étape Sécurité.');
          }
        }
        break;
      case 3:
        if (this.securityQuestionGroup.valid) {
          this.currentStep++;
          this.alertService.clear();
        } else {
          this.securityQuestionGroup.markAllAsTouched();
          this.alertService.error('Veuillez choisir la question de sécurité et indiquer votre réponse.');
        }
        break;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.alertService.clear();
    }
  }

  updatePasswordStrength(): void {
    const password = this.securityGroup.get('password')?.value || '';
    this.passwordStrength = this.calculatePasswordStrength(password);
  }

  calculatePasswordStrength(password: string): number {
    let poolSize = 0;
    if (/[a-z]/.test(password)) poolSize += 26;
    if (/[A-Z]/.test(password)) poolSize += 26;
    if (/\d/.test(password)) poolSize += 10;
    if (/[@$!%*?&#]/.test(password)) poolSize += 32;
    const entropy = password.length * Math.log2(poolSize);
    return entropy < 28 ? 1 : entropy < 36 ? 2 : entropy < 60 ? 3 : entropy < 128 ? 4 : 5;
  }

  getPasswordStrengthLabel(strength: number): string {
    return ['TRÈS FAIBLE', 'FAIBLE', 'MOYENNE', 'FORTE', 'TRÈS FORTE'][strength - 1];
  }
}
