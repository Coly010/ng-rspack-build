import { Component, output } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';

@Component({
  imports: [MatToolbarModule, MatIconModule, MatButtonModule, RouterLink],
  selector: 'app-navbar',
  styles: [
    `
      .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex: 1 1 auto;

        .github-link {
          svg {
            fill: #000;
            @media (prefers-color-scheme: dark) {
              fill: #fff;
            }
          }
        }

        .flex-spacer {
          flex: 1 1 auto;
        }

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

          .home-text {
            display: none;
            @media (min-width: 960px) {
              display: inline;
            }
          }

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
        <a class="home" routerLink="/">
          <img
            src="logo-small.png"
            alt="Angular Rspack and Rsbuild Tools"
            width="36"
          />
          <span class="home-text">Angular Rspack and Rsbuild Tools</span>
        </a>

        <div class="flex-spacer">&nbsp;</div>

        <a
          mat-icon-button
          aria-label="Github Repo"
          href="https://github.com/Coly010/ng-rspack-build"
          target="_blank"
          class="github-link"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 96 96"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z"
            />
          </svg>
        </a>
      </nav>
    </mat-toolbar>
  `,
})
export class NavbarComponent {
  toggleMenu = output();
}
