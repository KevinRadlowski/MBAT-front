import { Component, OnInit } from '@angular/core';
import { AlertService } from 'src/app/shared/services/alert.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(
    private alertService: AlertService,
  ) { }

  ngOnInit(): void {
  }

  alert() {
    this.alertService.errorAutoClear("Veuillez remplir les champs indiqués", true);
  }

}
