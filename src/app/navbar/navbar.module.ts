import { NgModule } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { SetupModule } from './setup/setup.module';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar.component';


@NgModule({
  declarations: [NavbarComponent],
  imports: [
    CommonModule,
    SetupModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule],
  exports: [NavbarComponent]
})
export class NavbarModule { }
