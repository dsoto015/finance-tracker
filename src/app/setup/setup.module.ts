import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { SetupComponent } from './setup.component';


@NgModule({
  declarations: [SetupComponent],
  imports: [
    CommonModule,
    MatSlideToggleModule
  ],
  exports: [SetupComponent]
})
export class SetupModule { }
