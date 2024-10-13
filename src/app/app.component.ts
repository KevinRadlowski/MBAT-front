import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, OnDestroy, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { TokenStorageService } from './core/auth/services/token-storage.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'MBAT';
  info: any;
  mobileQuery: MediaQueryList;
  isDesktopFormat: boolean = false;
  @ViewChild('sidenav') sidenav!: MatSidenav;
  isExpanded = true;
  showSubmenu: boolean = false;
  isShowing = false;
  showSubSubMenu: boolean = false;
  isLogged = false;
  hideSidenav = false; // Nouvelle variable pour gérer l'affichage de la sidenav

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private token: TokenStorageService,
    private router: Router // Injecter le Router
    ) {
    this.mobileQuery = media.matchMedia('(max-width: 600px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    this.isDesktopFormat = media.matchMedia('(max-width: 600px)') ? true : false;
  }

  onActivate(event: Event) {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }

  private _mobileQueryListener: () => void;


  ngOnDestroy(): void {
    this.mobileQuery.removeListener(this._mobileQueryListener);
  }


  ngOnInit(): void {
    this.token.isAuthenticated$.subscribe(isLoggedIn => {
      this.isLogged = isLoggedIn;
    });

  this.router.events.subscribe(() => {
      this.checkIfOnAccountPage();
  });
  }


   // Nouvelle méthode pour vérifier si l'utilisateur est sur la page "my-account"
   checkIfOnAccountPage() {
    const currentUrl = this.router.url;
    this.hideSidenav = currentUrl.startsWith('/my-account');
  }

  checkIfUserIsLogged() {

    this.token.isAuthenticated$.subscribe(isLoggedIn => {
      this.isLogged = isLoggedIn;
    });
  }
  

  mouseenter() {
    if (!this.isExpanded) {
      this.isShowing = true;
    }
  }

  mouseleave() {
    if (!this.isExpanded) {
      this.isShowing = false;
    }
  }

  logout() {
    this.token.signOut();
    window.location.reload(); // Recharge la page après la déconnexion
  }

}
