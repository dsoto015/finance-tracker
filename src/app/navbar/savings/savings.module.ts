import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { MAT_DATE_FORMATS, MatDateFormats, MatNativeDateModule } from '@angular/material/core';
import { SavingsComponent } from './savings.component';

export const YEAR_ONLY_DATE_FORMATS: MatDateFormats = {
  parse: {
    dateInput: { year: 'numeric' }, 
  },
  display: {
    dateInput: { year: 'numeric' }, 
    monthYearLabel: { year: 'numeric' },
    dateA11yLabel: { year: 'numeric' }, 
    monthYearA11yLabel: { year: 'numeric' },
  },
};

@NgModule({
  declarations: [SavingsComponent],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: YEAR_ONLY_DATE_FORMATS }
  ],
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
    FormsModule,
    ReactiveFormsModule,
    MatNativeDateModule
  ],
  exports: [SavingsComponent]
})
export class SavingsModule { }
