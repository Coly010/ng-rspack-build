import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../ui/navbar.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DrawerComponent } from '../ui/drawer.component';
import { FooterComponent } from '../ui/footer.component';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  imports: [
    RouterModule,
    NavbarComponent,
    DrawerComponent,
    FooterComponent,
    MatSidenavModule,
  ],
  selector: 'app-root',
  template: ` <app-navbar (toggleMenu)="drawer.toggle()"></app-navbar>
    <mat-drawer-container autosize>
      <mat-drawer #drawer mode="side" class="sidenav">
        <app-drawer></app-drawer>
      </mat-drawer>

      <mat-drawer-content class="sidenav-content">
        <div class="content">
          <router-outlet></router-outlet>
          <app-footer></app-footer>
        </div>
      </mat-drawer-content>
    </mat-drawer-container>`,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {}
