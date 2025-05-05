import { Component, computed, signal } from '@angular/core';
import { IncomeService } from '../../../core/services/income.service';
import { Income } from '../../../core/models/income.model';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-income',
  standalone: false,
  templateUrl: './income.component.html',
  styleUrl: './income.component.scss'
})
export class IncomeComponent {

  totalIncome = signal<Income[]>([]);
  date: Date = new Date();
  currentYear: Number = new Date().getFullYear();

  getMonthNameSignal = computed(() => 
    this.totalIncome().map((monthIncome) => ({
      name: new Date(monthIncome.year, monthIncome.month - 1).toLocaleDateString('default', { month: 'long' })
    }))
  );

  monthTotalSignal = computed(() =>
    this.totalIncome().map((monthIncome) => ({
      total: monthIncome.income.reduce((sum, entry) => sum + (entry.amount || 0), 0),
    }))
  );

  constructor(private incomeService: IncomeService,) {
  }

  async ngOnInit(): Promise<void> {
    let totalIncome = await this.incomeService.loadIncome() as Income[];
    this.totalIncome.set(totalIncome);
    console.log(this.totalIncome);
  }

  getMonthName(date: Date): string {
    return date.toLocaleDateString('default', { month: 'long' });
  }

  onChosenMonth(normalizedMonth: Date, datepicker: any): void {
    // this.saveChanges();
    datepicker.close();
    this.loadMonthData(normalizedMonth);
  }

  chosenYearHandler(normalizedYear: Date, dp: any) {
    const ctrlValue = this.date;
    console.log('chosenYearHandler', normalizedYear, dp);
    // ctrlValue.year(normalizedYear.year());
    // this.date.setValue(ctrlValue);
    dp.close();
    console.log(this.date, ctrlValue);
  }

  loadMonthData(monthDate: Date): void {
    this.currentYear = monthDate.getFullYear();
    // this.currentMonthExpense = this.get();
    // console.log('loadMonthData, new month: ', this.currentMonthExpense);
    // this.updateTotalMonthSpent();
    this.updateForm(monthDate);
  }

  nextMonth() {
    const nextYear = this.date.getFullYear() + 1;
    const normalizedYear = new Date(nextYear, 1, 1);
    console.log('nextMonth', nextYear);
    this.loadMonthData(normalizedYear);
  }

  prevMonth() {
    console.log('current year', this.date.getFullYear());
    const previousYear = this.date.getFullYear() - 1;
    console.log('prev year', previousYear);
    const normalizedYear = new Date(previousYear, 1, 1);
    console.log('previousMonth', normalizedYear);
    this.loadMonthData(normalizedYear);
  }

  updateForm(selectedMonth: Date): void {
    console.log('updateForm', selectedMonth);
  }

  saveChanges(): void {
    console.log('Saving changes..');
  }
}
