import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlertService } from '../services/alert.service';
import { UserService } from 'src/app/core/auth/signup/signup.service';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent implements OnInit, OnDestroy {
  private subscription!: Subscription;
  message: any;

  constructor(private alertService: AlertService, private userService: UserService) {}

  ngOnInit() {
    this.subscription = this.alertService.getMessage().subscribe((message: any) => {
      this.message = message;
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  
  resendUnlockEmail(): void {
    if (this.message && this.message.email) {
        this.userService.resendUnlockEmail(this.message.email).subscribe({
            next: () => {
                this.message = {
                    type: 'success',
                    text: 'Un nouveau mail de déverrouillage a été envoyé à votre adresse e-mail.'
                };
            },
            error: () => {
                this.message = {
                    type: 'error',
                    text: 'Erreur lors de l\'envoi du mail de déverrouillage. Veuillez réessayer plus tard.'
                };
            }
        });
    }
}

}
