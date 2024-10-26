import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { TokenStorageService } from '../services/token-storage.service';
import { UserService } from '../signup/signup.service';
import { Router } from '@angular/router';

const TOKEN_HEADER_KEY = 'Authorization'; // Header key for token

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private tokenStorage: TokenStorageService,
    private userService: UserService,
    private router: Router
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.tokenStorage.getToken();
    let authReq = req;

    if (token && !this.tokenStorage.isTokenExpired(token)) {
      authReq = this.addTokenHeader(req, token); // Add token to header if valid
    }

    return next.handle(authReq).pipe(
      catchError((error) => {
        // Handle 401 errors and attempt token refresh
        if (error instanceof HttpErrorResponse && error.status === 401 && !req.url.includes('signin')) {
          return this.handle401Error(authReq, next);
        }
        return throwError(() => error);
      })
    );
  }

  // Add token to the request header
  private addTokenHeader(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({ headers: request.headers.set(TOKEN_HEADER_KEY, `Bearer ${token}`) });
  }

  // Handle 401 Unauthorized error and attempt token refresh
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = this.tokenStorage.getRefreshToken();

      if (refreshToken) {
        return this.userService.refreshToken(refreshToken).pipe(
          switchMap((data: any) => {
            this.isRefreshing = false;
            this.tokenStorage.saveAll(data, false);
            this.refreshTokenSubject.next(data.token);
            return next.handle(this.addTokenHeader(request, data.token));
          }),
          catchError((err) => {
            this.isRefreshing = false;
            this.tokenStorage.signOut();
            this.router.navigate(['/login']);
            return throwError(() => err);
          })
        );
      } else {
        this.isRefreshing = false;
        this.tokenStorage.signOut();
        this.router.navigate(['/login']);
        return throwError(() => new Error('Refresh token is missing'));
      }
    }

    // Wait for refresh token process to finish
    return this.refreshTokenSubject.pipe(
      filter((token) => token != null),
      take(1),
      switchMap((token) => next.handle(this.addTokenHeader(request, token)))
    );
  }
}

export const authInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
];
