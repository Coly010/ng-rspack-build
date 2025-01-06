import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../ui/navbar.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { DrawerComponent } from '../ui/drawer.component';

@Component({
  imports: [RouterModule, NavbarComponent, DrawerComponent, MatSidenavModule],
  selector: 'app-root',
  template: ` <app-navbar (toggleMenu)="drawer.toggle()"></app-navbar>
    <mat-drawer-container autosize>
      <mat-drawer #drawer mode="side" class="sidenav">
        <app-drawer></app-drawer>
      </mat-drawer>

      <mat-drawer-content class="sidenav-content">
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </mat-drawer-content>
    </mat-drawer-container>`,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {}
