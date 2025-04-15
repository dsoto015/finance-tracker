import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummaryComponent } from './summary.component';
import { NgChartsModule } from 'ng2-charts';
import { MatCard, MatCardContent, MatCardHeader, MatCardSubtitle, MatCardTitle } from '@angular/material/card';


@NgModule({
  declarations: [SummaryComponent],
  imports: [
    CommonModule,
    NgChartsModule,
    MatCard,
    MatCardHeader,
    MatCardContent,
    MatCardSubtitle, 
    MatCardTitle
  ],
  exports: [SummaryComponent]
})
export class SummaryModule { }
