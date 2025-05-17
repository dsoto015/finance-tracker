import { Component, computed, inject, signal } from '@angular/core';
import { IncomeService } from '../../../core/services/income.service';
import { YearIncome, MonthIncome } from '../../../core/models/income.model';

@Component({
  selector: 'app-income',
  standalone: false,
  templateUrl: './income.component.html',
  styleUrl: './income.component.scss'
})
export class IncomeComponent {
  private incomeService = inject(IncomeService);
  date = signal(new Date());

  

  readonly currentYearSignal = computed(() => 
    this.date().getFullYear()
  );

  readonly totalIncomeSignal = this.incomeService.totalIncomeSignal;
  
  readonly monthIncomeSignal = computed(() =>
    this.totalIncomeSignal()
      .filter(x => x.year === this.currentYearSignal())
      .flatMap(y => y.monthIncome)
  );

  readonly getMonthNameSignal = computed(() =>
    this.monthIncomeSignal().map((month) => ({
      name: new Date(this.currentYearSignal(), month.month).toLocaleDateString('default', { month: 'long' })
    }))
  );

  readonly monthTotalSignal = computed(() => {
    return this.monthIncomeSignal().map(month => {
      const total = month.income
        .reduce((sum, x) => sum + +x.amount, 0);
      return {
        ...month,
        total
      };
    });
  });

  readonly yearToDateTotalSignal = computed(() =>
    this.monthTotalSignal().reduce((sum, x) => sum +  +x.total, 0)
  );

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

  saveChanges(): void {
    console.log('Saving changes…');
  }

  updateTotalAmount(rowAmount: number, monthId: string, rowIndex: number): void {
    console.log('recompute');
    this.incomeService.updateIncome(this.currentYearSignal(), rowAmount, monthId, rowIndex);
  }
}
