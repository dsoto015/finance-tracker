import { Component, computed, inject, signal } from '@angular/core';
import { IncomeService } from '../../../core/services/income.service';
import { ExpenseService } from '../../../core/services/expense.service';
import { SavingsService } from '../../../core/services/savings-service';

import { ChartConfiguration } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart } from 'chart.js';
import { MonthExpense } from '../../../core/models/expenses.model';
Chart.register(ChartDataLabels);

// Chart config constants
const BAR_CHART_OPTIONS: ChartConfiguration<'bar'>['options'] = {
  responsive: true,
  plugins: {
    legend: { display: true },
    datalabels: { display: false }
  }
};

const LINE_CHART_OPTIONS: ChartConfiguration<'line'>['options'] = {
  responsive: true,
  plugins: {
    legend: { display: true },
    datalabels: { display: false }
  }
};

const PIE_CHART_OPTIONS: ChartConfiguration<'pie'>['options'] = {
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

@Component({
  selector: 'app-summary',
  standalone: false,
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent {
  private readonly incomeService = inject(IncomeService);
  private readonly expensesService = inject(ExpenseService);
  private readonly savingsService = inject(SavingsService);

  date = signal(new Date());
  months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  readonly currentYearSignal = computed(() => this.date().getFullYear());

  readonly totalIncomeSignal = this.incomeService.totalIncomeSignal;
  readonly expensesSignal = this.expensesService.expenses;
  readonly savingsSignal = this.savingsService.totalSavingsSignal;

  private aggregateMonthly<T>(items: T[], getMonth: (item: T) => number, getAmount: (item: T) => number): number[] {
    const monthlyTotals = Array(12).fill(0);
    items.forEach(item => {
      const month = getMonth(item);
      monthlyTotals[month] += getAmount(item);
    });
    return monthlyTotals;
  }

  private groupTopCategories(totals: Record<string, number>, topN = 4): { labels: string[], data: number[] } {
    const filtered = Object.entries(totals).filter(([, value]) => value > 0);
    const sorted = filtered.sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, topN);
    const labels = top.map(([name]) => name);
    const data = top.map(([, value]) => value);
    return { labels, data };
  }

  private computePieChartData(expenses: MonthExpense[]): { labels: string[], datasets: { data: number[] }[] } {
    const categoryTotals: Record<string, number> = {};
    expenses.forEach(e => {
      e.categories.forEach(cat => {
        const total = (cat.rows ?? []).filter(row => !row.recurring)
          .reduce((sum, row) => sum + (Number(row.value) || 0), 0);
        categoryTotals[cat.name] = (categoryTotals[cat.name] || 0) + total;
      });
    });
    const { labels, data } = this.groupTopCategories(categoryTotals, 4);
    return { labels, datasets: [{ data }] };
  }


  readonly monthlyIncomeTotalsSignal = computed(() => {
    const year = this.currentYearSignal();
    const yearIncome = this.totalIncomeSignal().find(y => y.year === year);
    return yearIncome ?
      this.aggregateMonthly(yearIncome.monthIncome, m => m.month, m => m.income.reduce((sum, inc) => sum + +inc.amount, 0))
      : Array(12).fill(0);
  });

  readonly monthlyExpensesTotalsSignal = computed(() => {
    const year = this.currentYearSignal();
    const expenses = this.expensesSignal().filter(e => e.year === year);
    return this.aggregateMonthly(expenses, e => e.month, e => e.categories.reduce((sum, cat) => sum + (cat.total || 0), 0));
  });

  readonly monthlyExpensesNorecurringSignal = computed(() => {
    const year = this.currentYearSignal();
    const expenses = this.expensesSignal().filter(e => e.year === year);
    return this.aggregateMonthly(expenses, e => e.month, e => {
      let total = 0;
      e.categories.forEach(cat => {
        cat.rows.forEach(row => {
          if (!row.recurring) {
            const value = Number(row.value);
            if (!isNaN(value)) total += value;
          }
        });
      });
      return total;
    });
  });

  readonly barChartDataSignal = computed(() => ({
    labels: this.months,
    datasets: [
      { data: this.monthlyIncomeTotalsSignal(), label: 'Income', backgroundColor: '#42A5F5' },
      { data: this.monthlyExpensesTotalsSignal(), label: 'Expenses (with bills)', backgroundColor: '#EF5350' },
      { data: this.monthlyExpensesNorecurringSignal(), label: 'Expenses (no bills)', backgroundColor: '#FFA726' }
    ]
  }));

  readonly barChartOptions = BAR_CHART_OPTIONS;
  readonly barChartType: 'bar' = 'bar';

  readonly lineChartDataSignal = computed(() => ({
    labels: this.months,
    datasets: [
      { data: this.monthlyIncomeTotalsSignal(), label: 'Income', fill: false, borderColor: '#42A5F5', tension: 0.4 }
    ]
  }));

  readonly lineChartOptions = LINE_CHART_OPTIONS;
  readonly lineChartType: 'line' = 'line';

  readonly pieChartOptions = PIE_CHART_OPTIONS;
  readonly pieChartType: 'pie' = 'pie';

  readonly pieChartDataYearSignal = computed(() => {
    const year = this.currentYearSignal();
    const expenses = this.expensesSignal().filter(e => e.year === year);
    return this.computePieChartData(expenses);
  });

  readonly selectedMonthSignal = signal<number | null>(1);

  readonly pieChartDataMonthSignal = computed(() => {
    const year = this.currentYearSignal();
    const month = this.selectedMonthSignal();
    if (month === null) return { labels: [], datasets: [{ data: [] }] };
    const monthExpense = this.expensesSignal().find(e => e.year === year && e.month === month);
    if (!monthExpense) return { labels: [], datasets: [{ data: [] }] };
    const categoryTotals: Record<string, number> = {};
    monthExpense.categories.forEach(cat => {
      categoryTotals[cat.name] = (categoryTotals[cat.name] || 0) + (cat.total || 0);
    });
    const { labels, data } = this.groupTopCategories(categoryTotals);
    return { labels, datasets: [{ data }] };
  });

  readonly monthlySavingsSignal = computed(() => {
    const year = this.currentYearSignal();
    const savings = this.savingsSignal().filter(s => s.year === year);
    const items = savings.flatMap(s => s.monthSavings.map(m => ({ month: m.month, total: m.savings.reduce((sum, save) => sum + +save.amount, 0) })));
    return this.aggregateMonthly(items, i => i.month, i => i.total).map((total, month) => ({ month, total }));
  });

  readonly savingsChartDataSignal = computed(() => ({
    labels: this.months,
    datasets: [
      {
        label: 'Savings',
        data: this.monthlySavingsSignal().map(m => m.total),
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  }));

  readonly savingsChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      tooltip: {
        callbacks: {
          label: (context: any) => `Savings: ${context.raw.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: 'Amount (USD)' },
      },
      x: {
        title: { display: true, text: 'Month' },
      },
    },
  };

  private setYear(year: number): void {
    this.date.update(() => new Date(year, 0, 1));
    this.incomeService.fillMissingMonths(year);
  }

  chosenYearHandler(normalizedYear: Date, datepicker: any): void {
    this.setYear(normalizedYear.getFullYear());
    datepicker.close();
  }

  nextYear(): void { this.setYear(this.currentYearSignal() + 1); }
  previousYear(): void { this.setYear(this.currentYearSignal() - 1); }

  load() {
    console.log(this.totalIncomeSignal());
    console.log(this.expensesSignal());
  }
}
