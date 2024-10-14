import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Theme {
  name: string;
  value: string;
  color: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeUrl = '/assets/themes/themes.json'; // URL du fichier JSON avec la liste des thèmes
  private themeLinkElement: HTMLLinkElement;
  private currentThemeSubject = new BehaviorSubject<string>('theme-default');

  constructor(private http: HttpClient) {
    this.themeLinkElement = document.createElement('link');
    this.themeLinkElement.rel = 'stylesheet';
    document.head.appendChild(this.themeLinkElement);

    // Applique le thème stocké ou le thème par défaut au démarrage
    const storedTheme = this.getStoredTheme();
    if (storedTheme) {
      this.setTheme(storedTheme);
    } else {
      this.setTheme('theme-default');
    }
  }

  // Setter pour le thème
  setTheme(themeName: string) {
    this.themeLinkElement.href = `assets/themes/${themeName}.scss`; // Appliquer le thème
    this.storeTheme(themeName); // Sauvegarder dans localStorage
    this.currentThemeSubject.next(themeName); // Mettre à jour le BehaviorSubject
  }

  // Sauvegarder le thème dans localStorage
  private storeTheme(themeName: string) {
    localStorage.setItem('selectedTheme', themeName);
  }

  // Récupérer le thème stocké
  private getStoredTheme(): string | null {
    return localStorage.getItem('selectedTheme');
  }

  // Récupérer la liste des thèmes depuis le fichier JSON
  getAvailableThemes(): Observable<Theme[]> {
    return this.http.get<Theme[]>(this.themeUrl);
  }

  // Récupérer le thème actuel comme Observable
  getCurrentTheme(): Observable<string> {
    return this.currentThemeSubject.asObservable();
  }

  // Obtenir directement la valeur du thème actuel (pas en tant qu'Observable)
  getCurrentThemeValue(): string {
    return this.currentThemeSubject.value;
  }
}
