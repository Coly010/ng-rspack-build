import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcomeComponent } from './nx-welcome.component';
import { ScssInlineTestComponent } from './scss-inline-test';

@Component({
  imports: [NxWelcomeComponent, RouterModule, ScssInlineTestComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'rsbuild-csr-css';
}
