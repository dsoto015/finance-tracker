import { Component, computed, inject, signal } from '@angular/core';
import { IncomeService } from '../../../core/services/income.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { YearIncome } from '../../../core/models/income.model';
import { ChartConfiguration, ChartType, Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(ChartDataLabels);

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
      legend: { display: true },
      datalabels: { display: false }
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
      legend: { display: true },
      datalabels: { display: false }

    }
  };

  readonly lineChartType: 'line' = 'line';


  // Pie chart for expenses by category (year view)
  readonly pieChartDataYearSignal = computed(() => {
    const year = this.currentYearSignal();
    const expenses = this.expensesSignal();
    const categoryTotals: { [name: string]: number } = {};

    expenses
    .filter(e => e.year === year)
    .forEach(e => {
      e.categories.forEach(cat => {
        // Sum only non-recurring rows in this category
        const nonRecurringTotal = (cat.rows ?? [])
          .filter(row => !row.recurring)
          .reduce((sum, row) => sum + (Number(row.value) || 0), 0);
        categoryTotals[cat.name] = (categoryTotals[cat.name] || 0) + nonRecurringTotal;
      });
    });

    // Show top 6 categories, group the rest as "Other"
    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 6);
    const otherTotal = sorted.slice(6).reduce((sum, [, v]) => sum + v, 0);

    const labels = top.map(([name]) => name);
    const data = top.map(([, value]) => value);

    if (otherTotal > 0) {
      labels.push('Other');
      data.push(otherTotal);
    }

    return {
      labels,
      datasets: [{ data }]
    };
  });

  readonly selectedMonthSignal = signal<number | null>(1);

  readonly pieChartDataMonthSignal = computed(() => {
    const year = this.currentYearSignal();
    const month = this.selectedMonthSignal();
    if (month === null) return { labels: [], datasets: [{ data: [] }] };

    const expenses = this.expensesSignal();
    const monthExpense = expenses.find(e => e.year === year && e.month === month);
    if (!monthExpense) return { labels: [], datasets: [{ data: [] }] };

    const categoryTotals: { [name: string]: number } = {};
    monthExpense.categories.forEach(cat => {
      categoryTotals[cat.name] = (categoryTotals[cat.name] || 0) + (cat.total || 0);
    });

    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 6);
    const otherTotal = sorted.slice(6).reduce((sum, [, v]) => sum + v, 0);

    const labels = top.map(([name]) => name);
    const data = top.map(([, value]) => value);

    if (otherTotal > 0) {
      labels.push('Other');
      data.push(otherTotal);
    }

    return {
      labels,
      datasets: [{ data }]
    };
  });

  // Pie chart options and type
  readonly pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true },
      datalabels: {
        color: '#333',
        formatter: (value, context) => {
          const label = context.chart.data.labels?.[context.dataIndex] || '';
          return `${label}: ${value}`;
        },
        font: { weight: 'bold' }
      }
    }
  };
  readonly pieChartType: 'pie' = 'pie';

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

