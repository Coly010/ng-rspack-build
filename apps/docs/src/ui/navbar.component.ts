import { Component, output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  imports: [MatToolbarModule, MatIconModule, MatButtonModule],
  selector: 'app-navbar',
  styles: [
    `
      .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .home {
          color: var(--mat-sys-primary);
          text-decoration: none;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 2rem;

          &:hover {
            background-color: var(--mat-sys-surface-container);
          }
        }
      }
    `,
  ],
  template: `
    <mat-toolbar>
      <nav class="navbar">
        <button
          mat-icon-button
          aria-label="Toggle menu"
          (click)="toggleMenu.emit()"
        >
          <mat-icon>menu</mat-icon>
        </button>
        <a class="home" href="/">
          <img
            src="logo-small.png"
            alt="Angular Rspack and Rsbuild Tools"
            width="36"
          />
          <span>Angular Rspack and Rsbuild Tools</span>
        </a>
      </nav>
    </mat-toolbar>
  `,
})
export class NavbarComponent {
  toggleMenu = output();
}
