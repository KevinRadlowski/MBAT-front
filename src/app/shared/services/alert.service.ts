import { Injectable } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Alert, AlertOptions, AlertType } from '../alert/alert.model';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private subject = new Subject<any>();
  private keepAfterNavigationChange = false;

  constructor(private router: Router) {
    // Clear alert message on route change
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (this.keepAfterNavigationChange) {
          // only keep for a single location change
          this.keepAfterNavigationChange = false;
        } else {
          // clear alert
          setTimeout(() => {
            this.clear();
          }, 5000);
        }
      }
    });
  }

  success(message: string, keepAfterNavigationChange = false) {
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.subject.next({ type: 'success', text: message });
    setTimeout(() => {
      this.clear();
    }, 5000);
  }

  error(message: string, keepAfterNavigationChange = false) {
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.subject.next({ type: 'error', text: message });
  }

  errorAutoClear(message: string, keepAfterNavigationChange = false) {
    this.keepAfterNavigationChange = keepAfterNavigationChange;
    this.subject.next({ type: 'error', text: message });
    setTimeout(() => {
      this.clear();
    }, 5000);
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  clear() {
    this.subject.next(null);
  }

//   private subject = new Subject<Alert>();
//   private defaultId = 'default-alert';

//   enable subscribing to alerts observable
//   onAlert(id = this.defaultId): Observable<Alert> {
//       return this.subject.asObservable().pipe(filter(x => x && x.id === id));
//   }

//   convenience methods
//   success(message: string, options?: AlertOptions) {
//       this.alert(new Alert({ ...options, type: AlertType.Success, message }));
//   }

//   error(message: string, options?: AlertOptions) {
//       this.alert(new Alert({ ...options, type: AlertType.Error, message }));
//   }

//   info(message: string, options?: AlertOptions) {
//       this.alert(new Alert({ ...options, type: AlertType.Info, message }));
//   }

//   warn(message: string, options?: AlertOptions) {
//       this.alert(new Alert({ ...options, type: AlertType.Warning, message }));
//   }

//   // main alert method    
//   alert(alert: Alert) {
//       alert.id = alert.id || this.defaultId;
//       this.subject.next(alert);
//   }

//   // clear alerts
//   clear(id = this.defaultId) {
//       this.subject.next(new Alert({ id }));
//   }
}

