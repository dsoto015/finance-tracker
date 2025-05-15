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
    0
    // const totals: Record<number, number> = {};
    // for (const entry of this.monthIncome()) {
    //   const m = entry.month;
    //   totals[m] = (totals[m] || 0) + (entry.amount || 0);
    // }
    // return Array.from({ length: 12 }, (_, i) => ({
    //   month: i,
    //   total: totals[i] || 0
    // }));
  });

  readonly yearToDateTotal = computed(() =>
     this.monthIncome(). .reduce((sum, e) => sum + (e.amount || 0), 0)
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
    this.incomeService.updateIncome(rowAmount, monthId, rowIndex);
  }
}
