import { MediaMatcher } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { TokenStorageService } from './core/auth/services/token-storage.service';
import { Router } from '@angular/router';
import { UserService } from './core/auth/signup/signup.service';
import { ThemeService } from './shared/services/theme.service';
import { AlertService } from './shared/services/alert.service';
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
  @ViewChild('accountButton') accountButton!: ElementRef;
  isExpanded = true;
  showSubmenu: boolean = false;
  isShowing = false;
  showSubSubMenu: boolean = false;
  isLogged = false;
  hideSidenav = false; // Nouvelle variable pour gérer l'affichage de la sidenav
  showAccountMenu = false;
  dropdownPosition = {};
  firstName: String = '';

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher,
    private token: TokenStorageService,
    private router: Router,
    private userService: UserService,
    private themeService: ThemeService,
    private alertService: AlertService
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
    const currentTheme = this.themeService.getCurrentTheme();

    this.token.isAuthenticated$.subscribe(isLoggedIn => {
      this.isLogged = isLoggedIn;

      this.loadUserInfo();
    });

    this.router.events.subscribe(() => {
      this.checkIfOnAccountPage();
    });
  }

    // Charge les informations de l'utilisateur depuis le stockage du token
    loadUserInfo(): void {
      const user = this.token.getUser();
      if (user) {
        this.userService.getUser(user.username).subscribe({
          next: (userData: any) => {
            this.firstName = userData.firstName;
          },
          error: (err: any) => this.alertService.error('Erreur lors de la récupération des informations utilisateur.')
        });
      }
    }

  checkIfOnAccountPage() {
    const currentUrl = this.router.url;
    this.hideSidenav = currentUrl.startsWith('/my-account');
  }

  checkIfUserIsLogged() {

    this.token.isAuthenticated$.subscribe(isLoggedIn => {
      this.isLogged = isLoggedIn;
    });
  }

  toggleAccountMenu() {
    this.showAccountMenu = !this.showAccountMenu;
    if (this.showAccountMenu) {
      const buttonRect = this.accountButton.nativeElement.getBoundingClientRect();
      this.dropdownPosition = {
        top: `${buttonRect.bottom + window.scrollY}px`,
        left: `${buttonRect.left + window.scrollX}px`
      };
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;
    if (!this.accountButton.nativeElement.contains(target)) {
      this.showAccountMenu = false;
    }
  }
  
  toggleMenu(isHovered: boolean) {
    this.showAccountMenu = isHovered;
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
    this.userService.logout().subscribe({
      next: (res) => {
        this.token.signOut();
        this.router.navigate(['/login']); // Redirection vers la page de login après déconnexion
      },
      error: (err) => {
        console.error('Error during logout', err);
      }
    });
  }

}
