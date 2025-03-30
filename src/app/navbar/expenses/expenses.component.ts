import { Component } from '@angular/core';

@Component({
  selector: 'app-expenses',
  standalone: false,
  templateUrl: './expenses.component.html',
  styleUrl: './expenses.component.scss'
})
export class ExpensesComponent {
  displayedColumns = ['category', 'jan', 'feb', 'mar']; // Add more months
  dataSource = [
    { category: 'Paycheck', jan: 9782, feb: 9659, mar: 9992 },
    { category: 'Interest Income', jan: 366, feb: 336, mar: 0 },
    { category: 'Refunds', jan: 69, feb: 0, mar: 2227 },
    // Add more rows...
  ];
}
