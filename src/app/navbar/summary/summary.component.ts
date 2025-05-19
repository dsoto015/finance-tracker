import { Component, computed, inject, signal } from '@angular/core';
import { IncomeService } from '../../../core/services/income.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { YearIncome } from '../../../core/models/income.model';
import { ChartConfiguration, ChartType } from 'chart.js';

@Component({
  selector: 'app-summary',
  standalone: false,
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent {
  private readonly incomeService = inject(IncomeService);
  private readonly expensesService = inject(ExpenseService);  
  
  date = signal(new Date());
  months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

  readonly currentYearSignal = computed(() =>
    this.date().getFullYear()
  );

  readonly totalIncomeSignal = this.incomeService.totalIncomeSignal;
  readonly expensesSignal = this.expensesService.expenses;

  readonly monthlyIncomeTotalsSignal = computed(() => {
    const year = this.currentYearSignal();
    const yearIncome = this.totalIncomeSignal().find(y => y.year === year);
    const monthlyTotals = Array(12).fill(0);
    if (yearIncome) {
      yearIncome.monthIncome.forEach(m => {
        monthlyTotals[m.month] = m.income.reduce((sum, inc) => sum + +inc.amount, 0);
      });
    }
    return monthlyTotals;
  });

  readonly monthlyExpensesTotalsSignal = computed(() => {
    const year = this.currentYearSignal();
    const expenses = this.expensesSignal();
    const monthlyTotals = Array(12).fill(0);
    expenses
      .filter(e => e.year === year)
      .forEach(e => {
        monthlyTotals[e.month] = e.categories.reduce(
          (sum, cat) => sum + (cat.total || 0),
          0
        );
      });
    return monthlyTotals;
  });

  readonly monthlyExpensesNoRecurringSignal = computed(() => {
    const year = this.currentYearSignal();
    const expenses = this.expensesSignal();
    const monthlyTotals = Array(12).fill(0);
    expenses
      .filter(e => e.year === year)
      .forEach(e => {
        let total = 0;
        e.categories.forEach(cat => {
          cat.rows.forEach(row => {
            if (!row.recurring) {
              const value = Number(row.value);
              if (!isNaN(value)) {
                total += value;
              }
            }
          });
        });
        monthlyTotals[e.month] = total;
      });
    return monthlyTotals;
  });

  readonly barChartDataSignal = computed<ChartConfiguration<'bar'>['data']>(() => ({
    labels: this.months,
    datasets: [
      {
        data: this.monthlyIncomeTotalsSignal(),
        label: 'Income',
        backgroundColor: '#42A5F5'
      },
      {
        data: this.monthlyExpensesTotalsSignal(),
        label: 'Expenses (with recurring)',
        backgroundColor: '#EF5350'
      },
      {
        data: this.monthlyExpensesNoRecurringSignal(),
        label: 'Expenses (no recurring)',
        backgroundColor: '#FFA726'
      }
    ]
  }));

  readonly barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true }
    }
  };

  readonly barChartType: 'bar' = 'bar';

  readonly lineChartDataSignal = computed<ChartConfiguration<'line'>['data']>(() => ({
    labels: this.months,
    datasets: [
      {
        data: this.monthlyIncomeTotalsSignal(),
        label: 'Income',
        fill: false,
        borderColor: '#42A5F5',
        tension: 0.4
      }
    ]
  }));

  readonly lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true }
    }
  };

  readonly lineChartType: 'line' = 'line';

  chosenYearHandler(normalizedYear: Date, datepicker: any): void {
    const newDate = new Date(normalizedYear.getFullYear(), 0, 1);
    this.date.update(() => newDate);
    this.incomeService.fillMissingMonths(normalizedYear.getFullYear());
    datepicker.close();
  }

  nextYear(): void {
    this.loadYear(this.currentYearSignal() + 1);
  }

  previousYear(): void {
    this.loadYear(this.currentYearSignal() - 1);
  }

  loadYear(year: number) {
    this.date.update(() => new Date(year, 0, 1));
    this.incomeService.fillMissingMonths(year);
  }

  load() {
    console.log(this.totalIncomeSignal());
    console.log(this.expensesSignal());
  }


}

