import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import packageJson from '../../../package.json';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})


export class NavbarComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  reason = '';
  version = packageJson.version;

  close(reason: string) {
    this.reason = reason;
    this.sidenav.close();
  }
}
