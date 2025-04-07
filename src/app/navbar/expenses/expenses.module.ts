import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTable, MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { FormsModule } from '@angular/forms';

import { ExpensesComponent } from './expenses.component';
import { DragDropModule } from '@angular/cdk/drag-drop';


@NgModule({
  declarations: [ExpensesComponent],
  imports: [
    CommonModule,
    MatSlideToggleModule,
    MatInputModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    FormsModule,
    MatTable,
    DragDropModule,
    MatDatepickerModule, 
    MatNativeDateModule
  ],
  exports: [ExpensesComponent]
})
export class ExpensesModule { }
