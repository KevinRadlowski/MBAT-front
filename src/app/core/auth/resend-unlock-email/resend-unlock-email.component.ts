import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-resend-unlock-email',
  templateUrl: './resend-unlock-email.component.html',
})
export class ResendUnlockEmailComponent implements OnInit {
  message: string = '';

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    const email = this.route.snapshot.queryParamMap.get('email');
    
    if (email) {
      this.http.post('http://192.168.56.101:8080/api/user/resend-unlock-email', { email })
        .subscribe({
          next: () => {
            this.message = 'Un nouveau mail de déverrouillage a été envoyé à votre adresse.';
          },
          error: () => {
            this.message = 'Une erreur s\'est produite lors de l\'envoi du mail de déverrouillage.';
          }
        });
    } else {
      this.message = 'Email non trouvé';
    }
  }
}
