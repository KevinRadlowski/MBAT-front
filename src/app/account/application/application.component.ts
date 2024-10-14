import { Component } from '@angular/core';
import { UserService } from 'src/app/core/auth/signup/signup.service';
import { Theme, ThemeService } from 'src/app/shared/services/theme.service';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrl: './application.component.scss'
})
export class ApplicationComponent {
  themes: Theme[] = [];
  selectedTheme: string = 'theme-default';
  notificationsEnabled: boolean = true;

  constructor(
    private themeService: ThemeService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    // Récupérer les thèmes disponibles depuis le fichier JSON
    this.themeService.getAvailableThemes().subscribe((themes: Theme[]) => {
      this.themes = themes;
    });

    // Récupérer le thème actuel
    this.themeService.getCurrentTheme().subscribe((theme) => {
      this.selectedTheme = theme;
    });
  }

  onThemeChange(theme: string): void {
    this.selectedTheme = theme;
    this.themeService.setTheme(theme); // Mettre à jour le thème en local (frontend)

    // Appeler l'API pour mettre à jour le thème de l'utilisateur côté backend
    this.userService.updateUserTheme(theme).subscribe({
      next: (response) => {
        console.log('Thème utilisateur mis à jour avec succès', response);
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du thème utilisateur', err);
      }
    });
  }

  onSaveSettings(): void {
    console.log('Paramètres sauvegardés:', { theme: this.selectedTheme, notifications: this.notificationsEnabled });
  }
}

