import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/shared/services/alert.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  alertMessage$: Observable<any> | undefined;

  constructor(private alertService: AlertService) { }

  ngOnInit(): void {
    this.alertMessage$ = this.alertService.getMessage();
    this.alertMessage$.subscribe(message => {
      if (message) {
        console.log('Message reçu sur la page de connexion :', message); // Vérification
      }
    });
  }
}
