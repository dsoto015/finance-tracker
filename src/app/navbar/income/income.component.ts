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

  totalIncome = this.incomeService.totalIncome;
  date = signal(new Date());

  readonly currentYear = computed(() => 
    this.date().getFullYear()
  );

  readonly monthIncome = computed(() =>
  {
    let test = this.totalIncome()
      .filter(x => x.year === this.currentYear())
      .flatMap(y => y.monthIncome);
      console.log(test);
      return test;
  }
  );

  readonly monthIncomeByMonth = computed(() => {
    // Create an array with 12 slots (for each month)
    const groups: MonthIncome[][] = Array.from({ length: 12 }, () => []);
    this.monthIncome().forEach(entry => {
      // entry.month is 1-based, so subtract 1 for array index
      groups[entry.month - 1].push(entry);
    });
    return groups;
  });

  // readonly getMonthNameSignal = computed(() =>
  //   this.monthIncome().map((month) => ({
  //     name: new Date(month.month).toLocaleDateString('default', { month: 'long' })
  //   }))
  // );

  getMonthNameSignal = computed(() =>
    this.monthIncome().map((month) => ({
      name: new Date(this.currentYear(), month.month).toLocaleDateString('default', { month: 'long' })
    }))
  );

  readonly monthTotalSignal = computed(() => {
    return this.monthIncome().map(month => {
      const total = month.income
        .reduce((sum, x) => sum + +x.amount, 0);
      return {
        ...month,
        total
      };
    });
  });

  readonly yearToDateTotal = computed(() =>
     {
      let totalYtd = this.monthTotalSignal().reduce((sum, x) => sum +  +x.total, 0);
      console.log('total: ', totalYtd);
      return totalYtd;
     }
  );

  ngOnInit(): void {
    this.incomeService.fillMissingMonths(this.currentYear());
  }

  chosenYearHandler(normalizedYear: Date, datepicker: any): void {
    const newDate = new Date(normalizedYear.getFullYear(), 0, 1);
    this.date.update(() => newDate);
    this.incomeService.fillMissingMonths(normalizedYear.getFullYear());
    datepicker.close();
  }

  nextYear(): void {
    const next = this.currentYear() + 1;
    this.date.update(() => new Date(next, 0, 1));
    this.incomeService.fillMissingMonths(next);
  }

  previousYear(): void {
    const prev = this.currentYear() - 1;
    this.date.update(() => new Date(prev, 0, 1));
    this.incomeService.fillMissingMonths(prev);
  }

  saveChanges(): void {
    console.log('Saving changes…');
  }

  updateTotalAmount(rowAmount: number, monthId: number, rowIndex: number): void {
    console.log('recompute');
    this.incomeService.updateIncome(rowAmount, monthId, rowIndex);
  }
}
