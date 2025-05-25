import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SetupComponent } from './navbar/setup/setup.component';
import { IncomeComponent } from './navbar/income/income.component';
import { ExpensesComponent } from './navbar/expenses/expenses.component';
import { SummaryComponent } from './navbar/summary/summary.component';
import { SavingsComponent } from './navbar/savings/savings.component';

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
    path: 'savings',
    component: SavingsComponent,
    title: "Savings"
  },
  {
    path: 'expenses',
    component: ExpensesComponent,
    title: "Expenses",
  },
  {
    path: 'summary',
    component: SummaryComponent,
    title: "Summary"
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
