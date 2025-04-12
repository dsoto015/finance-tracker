import { Component, ViewChild } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { FinanceDataService } from '../../../core/services/finance-data-service';
import { CategoryBlock, MonthExpense, SubcategoryRow } from '../../../core/models/expenses.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MOCK_MONTH } from '../../../../src/core/mock-data/mock-data';

@Component({
  selector: 'app-expenses',
  standalone: false,
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss']
})
export class ExpensesComponent {

  displayedColumns: string[] = ['actions', 'name', 'value'];
  isEditable = false;
  categories: CategoryBlock[] = [];
  monthExpense: MonthExpense[];
  selectedMonth: Date = new Date();
  currentMonthName: string = '';
  totalSpent = 0;
  
  get editVerbiage(): string {
    return this.isEditable ? 'Lock Rows' : 'Unlock Rows';
  }

  constructor(private financeDataService: FinanceDataService) {
    this.monthExpense = MOCK_MONTH;
  }

  ngOnInit(): void {
    this.currentMonthName = this.getMonthName(this.selectedMonth);
    this.totalSpent = this.updateTotalMonthSpent(this.selectedMonth);
    this.updateForm(this.selectedMonth);
  }

  updateForm(selectedMonth: Date): void {
    this.updateCategories(selectedMonth);
  }

  updateCategories(selectedMonth: Date): void {
    this.updateAllCategoryTotals(selectedMonth);
    const match = this.monthExpense.find(x => x.month === selectedMonth.getMonth());
    this.categories = match ? match.categories : [];
  }

  updateTotalMonthSpent(currentMonth: Date): number {
    let monthData = this.monthExpense.find(x => x.month === currentMonth.getMonth());

    if (!monthData) {
      monthData = {
        id: uuid(),
        month: currentMonth.getMonth(),
        year: currentMonth.getFullYear(),
        totalSpent: 0,
        categories: []
      };
      this.monthExpense.push(monthData);
    }

    return monthData.categories.reduce((catAcc, category) => {
      const rowTotal = category.rows.reduce((rowAcc, row) => rowAcc + Number(row.value ?? 0), 0);
      return catAcc + rowTotal;
    }, 0);
  }

  updateAllCategoryTotals(currentMonth: Date): void {
    const monthData = this.monthExpense.find(x => x.month === currentMonth.getMonth());
    monthData?.categories.forEach(x => this.updateCategoryTotal(x));
  }

  addRow(categoryId: string): void {
    const category = this.getCategory(categoryId);
    if (category) {
      category.rows = [...category.rows, { id: uuid(), name: '', value: 0 }];
    }
  }

  deleteRow(categoryId: string, rowId: string): void {
    const category = this.getCategory(categoryId);
    if (category) {
      category.rows = category.rows.filter(row => row.id !== rowId);
    }
  }

  drop(event: CdkDragDrop<SubcategoryRow[]>, category: { rows: SubcategoryRow[] }): void {
    if (event.previousIndex !== event.currentIndex) {
      const updatedRows = [...category.rows];
      moveItemInArray(updatedRows, event.previousIndex, event.currentIndex);
      category.rows = updatedRows;
    }
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  toggleEdit(): void {
    this.isEditable = !this.isEditable;
  }

  updateCategoryTotal(category: CategoryBlock): void {
    const total = category.rows.reduce((acc, row) => acc + (Number(row.value) || 0), 0);
    category.total = total;
    this.totalSpent = this.updateTotalMonthSpent(this.selectedMonth);
  }

  addCategory(): void {
    this.categories.push({ id: uuid(), name: 'NEW CATEGORY', rows: [] });
    this.isEditable = true;
  }

  deleteCategory(categoryId: string): void {
    this.categories = this.categories.filter(x => x.id !== categoryId);
    this.totalSpent = this.updateTotalMonthSpent(this.selectedMonth);
  }

  chosenMonthHandler(normalizedMonth: Date, datepicker: any): void {
    this.selectedMonth = normalizedMonth;
    datepicker.close();
    this.loadMonthData(normalizedMonth);
  }

  onMonthChange(event: any): void {
    this.loadMonthData(new Date(event.value));
  }

  loadMonthData(monthDate: Date): void {
    this.currentMonthName = this.getMonthName(monthDate);
    this.totalSpent = this.updateTotalMonthSpent(monthDate);
    this.updateForm(monthDate);
  }

  clearValue(categoryId: string, rowId: string): void {
    const category = this.getCategory(categoryId);
    const row = category?.rows.find(r => r.id === rowId);
    if (row) {
      row.value = null;
      this.updateCategoryTotal(category!);
    }
  }

  getCategory(categoryId: string): CategoryBlock | undefined {
    return this.categories.find(c => c.id === categoryId);
  }

  getMonthName(date: Date): string {
    return date.toLocaleDateString('default', { month: 'long' });
  }
}
