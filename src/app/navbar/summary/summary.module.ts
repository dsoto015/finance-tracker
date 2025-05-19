import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummaryComponent } from './summary.component';
import { NgChartsModule } from 'ng2-charts';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepicker, MatDatepickerInput, MatDatepickerToggle, MatYearView } from '@angular/material/datepicker';
import { MatIcon } from '@angular/material/icon';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [SummaryComponent],
  imports: [
    CommonModule,
    NgChartsModule,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardSubtitle, 
    MatCardTitle,
    MatFormField,
    MatDatepicker,
    MatIcon,
    MatDatepickerToggle,
    MatDatepickerInput,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule
  ],
  exports: [SummaryComponent]
})
export class SummaryModule { }
