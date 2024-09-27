import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private subject = new BehaviorSubject<any>(null); // Utilisation de BehaviorSubject pour garder le dernier message
  private keepAfterNavigationChange = false;

  constructor(private router: Router) {
    // Gère les changements de route pour conserver ou supprimer le message
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (this.keepAfterNavigationChange) {
          this.keepAfterNavigationChange = false;
        } else {
          this.clear();
        }
      }
    });
  }

  success(message: string, keepAfterNavigationChange = false, timeout: number = 5000) {
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.subject.next({ type: 'success', text: message });
    setTimeout(() => {
      this.clear();
    }, timeout);
  }

  error(message: string, keepAfterNavigationChange = false) {
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.subject.next({ type: 'error', text: message });
  }

  // Affiche une erreur et la supprime automatiquement après un certain délai
  errorAutoClear(message: string, keepAfterNavigationChange = false, timeout: number = 5000) {
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.subject.next({ type: 'error', text: message });
    setTimeout(() => {
      this.clear();
    }, timeout);
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  clear() {
    this.subject.next(null);
  }
}
