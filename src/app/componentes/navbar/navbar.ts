import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgIf } from '@angular/common';
import { AuthService } from '../../servicios/auth';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, MatToolbarModule, MatButtonModule, NgIf],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  darkMode: boolean = false;
  private authService = inject(AuthService);

  constructor(private router: Router) {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.darkMode = true;
      document.body.classList.add('dark-mode');
    } else {
      this.darkMode = false;
      document.body.classList.remove('dark-mode');
    }
  }

  user = this.authService.userSignal;

  get isPaciente() {
    return this.user()?.rol === 'paciente';
  }
  get isEspecialista() {
    return this.user()?.rol === 'especialista';
  }
  get isAdmin() {
    return this.user()?.rol === 'admin';
  }

  get homeRoute(): string {
    if (this.isAdmin) return '/admin';
    if (this.isEspecialista) return '/especialista';
    if (this.isPaciente) return '/paciente';
    return '/home';
  }

  get isHome(): boolean {
    return this.router.url === '/home';
  }

  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    if (this.darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/home']);
  }
}
