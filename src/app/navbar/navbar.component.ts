import { Component, DoCheck, OnInit } from '@angular/core';
import { TokenStorageService } from '../core/auth/services/token-storage.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, DoCheck {
  info: any;
  isLogged = false;

  constructor(
    private token: TokenStorageService
  ) { }

  ngOnInit(): void {
    this.checkIfUserIsLogged();
  }

  ngDoCheck() {
    this.checkIfUserIsLogged();
  }


  checkIfUserIsLogged() {
    setTimeout(() => {
      this.info = {
        username: this.token.getUser(),
      };
      if (this.info.username) { this.isLogged = true; }
      else { this.isLogged = false; }
    }, 100)
  }
}