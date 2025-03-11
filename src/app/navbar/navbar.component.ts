import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})


export class NavbarComponent {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  reason = '';

  close(reason: string) {
    this.reason = reason;
    this.sidenav.close();
  }
}
