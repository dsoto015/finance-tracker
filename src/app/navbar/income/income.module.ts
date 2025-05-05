import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { FormsModule } from '@angular/forms';

import { IncomeComponent } from './income.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTable, MatTableModule } from '@angular/material/table';


@NgModule({
  declarations: [IncomeComponent],
  imports: [
    CommonModule,
    MatSlideToggleModule,
    MatInputModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDatepickerModule,     
    FormsModule
  ],
  exports: [IncomeComponent]
})
export class IncomeModule { }
