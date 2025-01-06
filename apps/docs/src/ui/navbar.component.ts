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
      }
    `,
  ],
  template: `
    <mat-toolbar color="primary">
      <nav class="navbar">
        <button
          mat-icon-button
          aria-label="Toggle menu"
          (click)="toggleMenu.emit()"
        >
          <mat-icon>menu</mat-icon>
        </button>
        <span>Rspack/Rsbuild for Angular</span>
      </nav>
    </mat-toolbar>
  `,
})
export class NavbarComponent {
  toggleMenu = output();
}
