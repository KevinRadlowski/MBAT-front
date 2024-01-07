import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthLoginInfo } from '../../helpers/login-info';
import { AuthService } from '../../services/auth.service';
import { TokenStorageService } from '../../services/token-storage.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit {
  public formConnect: FormGroup;
  hidePassword = true;
  errorMessage = '';
  role!: String;
  roles: string[] = [];
  loading = false;
  private loginInfo!: AuthLoginInfo;
  @Output() isLoginFailed: EventEmitter<any> = new EventEmitter();

  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.formConnect = this.connectForm();
  }

  get f() { return this.formConnect.controls; }

  ngOnInit(): void {
  }

  connectForm(): FormGroup {
    return this.fb.group(
      {
        username: [
          null,
          Validators.compose([Validators.required])
        ],
        password: [
          null,
          Validators.compose([Validators.required])
        ]
      }
    );
  }


  submitFormulaireConnexion() {
    this.loginInfo = this.formConnect.value;
    this.loading = true;
    this.authService.login(this.loginInfo).subscribe({
      next: (data) => {
        this.tokenStorage.saveToken(data.accessToken);
        this.tokenStorage.saveUser(data.username);
        this.isLoginFailed.emit(false);
      },
      error: (error) => {
        this.errorMessage = error.error.message;
        this.isLoginFailed.emit(true);
        this.loading = false;
      },
      complete: () => this.router.navigate(['../index'])

    }
    );
  }

}
