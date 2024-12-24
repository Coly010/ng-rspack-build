import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcomeComponent } from './nx-welcome.component';
import { SimpleComponent } from './simple/simple.component';
import { StatefulComponent } from './stateful/stateful.component';

@Component({
  imports: [
    NxWelcomeComponent,
    RouterModule,
    SimpleComponent,
    StatefulComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'rsbuild-app';
}
