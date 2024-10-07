import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, Observable, switchMap, tap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';
import { EventBusService } from 'src/app/shared/services/event-bus.service';
import { environment } from 'src/environments/environment';
import { EventData } from 'src/app/shared/model/event.class';
import { UserService } from '../signup/signup.service';

const TOKEN_HEADER_KEY = 'Authorization';       // for Spring Boot back-end

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);


    constructor(
        private tokenStorage: TokenStorageService,
        private router: Router,
        private userService: UserService,
        private eventBusService: EventBusService
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let authReq = req.clone({
            url: environment.apiUrl + req.url
        });
        const token = this.tokenStorage.getToken();
        if (token != null) {
            authReq = req.clone({ headers: req.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + token) });
        }

        // return next.handle(authReq).pipe(
        //     catchError((error) => {
        //         if (
        //             error instanceof HttpErrorResponse &&
        //             !authReq.url.includes('user/signin') &&
        //             error.status === 401
        //         ) {
        //             return this.handle401Error(authReq, next);
        //         }

        //         return throwError(() => error);
        //     })
        // );


        return next.handle(authReq).pipe(
            catchError(error => {
              if (error instanceof HttpErrorResponse && error.status === 401) {
                return this.handle401Error(req, next);
              }
              return throwError(() => error);
            })
          );

    }

    private addTokenHeader(request: HttpRequest<any>, token: string) {
        return request.clone({
          headers: request.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + token)
        });
      }

    // private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    //     if (!this.isRefreshing) {
    //         this.isRefreshing = true;

    //         if (this.token.isAuthenticatedUser()) {
    //             this.eventBusService.emit(new EventData('logout', null));
    //         }
    //     }

    //     return next.handle(request);
    // }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          this.refreshTokenSubject.next(null);
    
          const refreshToken = this.tokenStorage.getRefreshToken();
          if (refreshToken) {
            return this.userService.refreshToken(refreshToken).pipe(
              switchMap((token: any) => {
                this.isRefreshing = false;
                this.tokenStorage.saveToken(token.accessToken, 'Bearer', false);
                this.refreshTokenSubject.next(token.accessToken);
                return next.handle(this.addTokenHeader(request, token.accessToken));
              }),
              catchError((err) => {
                this.isRefreshing = false;
                this.tokenStorage.signOut();
                this.router.navigate(['/login']);
                return throwError(() => err);
              })
            );
          }
        }
        return throwError(() => new Error('Could not refresh token'));
      }
}

export const authInterceptorProviders = [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
];