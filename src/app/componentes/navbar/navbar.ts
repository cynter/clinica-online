import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, MatToolbarModule, MatButtonModule, NgIf],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  darkMode: boolean = false;

  constructor(private router: Router) {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.darkMode = true;
      document.body.classList.add('dark-mode');
    }
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

  logout(): void {
    this.router.navigate(['/login']);
  }
}
