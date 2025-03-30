import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SetupComponent } from './navbar/setup/setup.component';
import { IncomeComponent } from './navbar/income/income.component';
import { ExpensesComponent } from './navbar/expenses/expenses.component';

export const routes: Routes = [
  {
    path: 'setup',
    component: SetupComponent,
    title: "Setup"
  },
  {
    path: 'income',
    component: IncomeComponent,
    title: "Income"
  },
  {
    path: 'expenses',
    component: ExpensesComponent,
    title: "Expenses"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
