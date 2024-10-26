import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-unlock-account',
  templateUrl: './unlock-account.component.html',
  styleUrls: ['./unlock-account.component.scss']
})
export class UnlockAccountComponent implements OnInit {
  message!: string;
  redirectIn: number = 10; // Temps avant redirection en secondes
  interval: any;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) { }

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      this.http.get(`http://192.168.56.101:8080/api/unlock?token=${token}`)
        .subscribe({
          next: (response: any) => {
            this.message = 'Votre compte a été déverrouillé avec succès. Vous serez redirigé vers la page de connexion dans quelques secondes.';
            this.startRedirectCountdown();
          },
          error: (error: any) => {
            this.message = 'Erreur lors du déverrouillage du compte. Veuillez réessayer plus tard.';
            this.startRedirectCountdown();
          }
        });
    } else {
      this.message = 'Jeton invalide.';
    }
  }

  startRedirectCountdown(): void {
    this.interval = setInterval(() => {
      this.redirectIn--;
      if (this.redirectIn === 0) {
        clearInterval(this.interval);
        this.router.navigate(['/login']); // Redirection vers la page de connexion
      }
    }, 1000);
  }

  manualRedirect(): void {
    clearInterval(this.interval);
    this.router.navigate(['/login']);
  }
}
