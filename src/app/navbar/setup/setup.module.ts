import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { FormsModule } from '@angular/forms';

import { SetupComponent } from './setup.component';


@NgModule({
  declarations: [SetupComponent],
  imports: [
    CommonModule,
    MatSlideToggleModule,
    MatInputModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    FormsModule 
  ],
  exports: [SetupComponent]
})
export class SetupModule { }
