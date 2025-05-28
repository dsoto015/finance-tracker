import { Component, computed, inject, signal } from '@angular/core';
import { SavingsService } from '../../../core/services/savings-service';
import { YearIncome, MonthIncome } from '../../../core/models/income.model';

@Component({
  selector: 'app-savings',
  standalone: false,
  templateUrl: './savings.component.html',
  styleUrl: './savings.component.scss'
})
export class SavingsComponent {

  date = signal(new Date()); 
  isEditableSignal = signal(false);

  private readonly savingsService = inject(SavingsService);

  readonly currentYearSignal = computed(() => 
    this.date().getFullYear()
  );

  readonly totalSavingsSignal = this.savingsService.totalSavingsSignal;
  
  readonly monthIncomeSignal = computed(() =>
    this.totalSavingsSignal()
      .filter(x => x.year === this.currentYearSignal())
      .flatMap(y => y.monthSavings)
  );

  readonly getMonthNameSignal = computed(() =>
    this.monthIncomeSignal().map((month) => ({
      name: new Date(this.currentYearSignal(), month.month).toLocaleDateString('default', { month: 'long' })
    }))
  );

  readonly monthTotalSignal = computed(() => {
    return this.monthIncomeSignal().map(month => {
      const total = month.savings
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

  editVerbiageComputedSignal = computed(() => this.isEditableSignal() ? 'Lock Rows' : 'Unlock Rows');

  toggleEditable(): void {
    this.isEditableSignal.update(() => !this.isEditableSignal());
  }  

  chosenYearHandler(normalizedYear: Date, datepicker: any): void {
    const newDate = new Date(normalizedYear.getFullYear(), 0, 1);
    this.date.update(() => newDate);
    this.savingsService.fillMissingMonths(normalizedYear.getFullYear());
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
    this.savingsService.fillMissingMonths(year);
  }

  saveChanges(): void {
    console.log('Saving changes…');
  }

  updateTotalAmount(rowAmount: number, monthId: string, rowIndex: number): void {
    console.log('recompute');
    this.savingsService.updateSavings(this.currentYearSignal(), rowAmount, monthId, rowIndex);
  }
  
  addRow(monthId: string) {
    this.savingsService.addRow(this.currentYearSignal(), monthId);
    this.isEditableSignal.update(() => false)
  }

  deleteRow(monthId: string, rowIndex: number) {
    this.savingsService.removeRow(this.currentYearSignal(), monthId, rowIndex);
    this.isEditableSignal.update(() => false)  }
}
