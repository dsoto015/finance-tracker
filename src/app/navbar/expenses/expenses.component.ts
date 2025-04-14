import { Component } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { FinanceDataService } from '../../../core/services/finance-data-service';
import { CategoryBlock, MonthExpense, SubcategoryRow } from '../../../core/models/expenses.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { DefaultTemplateService } from '../../../core/services/default-template-service';

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
  defaultCategories: CategoryBlock[] = [];
  monthExpenses: MonthExpense[] = [];
  currentMonthExpense: MonthExpense;
  selectedMonth: Date = new Date();
  currentMonthName: string = '';
  totalSpent = 0;
  totalSpentWithoutRecurring = 0;

  get editVerbiage(): string {
    return this.isEditable ? 'Lock Rows' : 'Unlock Rows';
  }

  constructor(private financeDataService: FinanceDataService,
              private defaultTemplateService: DefaultTemplateService) {
    this.currentMonthExpense = this.getCurrentMonthExpense();
  }
  
  async ngOnInit(): Promise<void> {
    this.monthExpenses = await this.financeDataService.loadExpenses() as MonthExpense[];
    this.defaultCategories = await this.defaultTemplateService.loadDefaults() as CategoryBlock[]
    this.currentMonthExpense = this.getCurrentMonthExpense();
    this.currentMonthName = this.getMonthName(this.selectedMonth);
    this.updateTotalMonthSpent();
    this.updateForm(this.selectedMonth);
  }

  getCurrentMonthExpense(): MonthExpense {
    const foundMonthExpense = this.monthExpenses.find(x => x.month === this.selectedMonth.getMonth())
    if(foundMonthExpense != undefined) {
      return foundMonthExpense;
    }
    
    const monthData = {
      id: uuid(),
      month: this.selectedMonth.getMonth(),
      year: this.selectedMonth.getFullYear(),
      totalSpent: 0,
      categories: this.defaultCategories
    };
    this.monthExpenses.push(monthData);
    return monthData;
  }

  updateForm(selectedMonth: Date): void {
    this.updateCategories(selectedMonth);
    this.sortRows();
  }

  sortRows() {
    this.currentMonthExpense.categories.forEach(z => z.rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
  }

  updateCategories(selectedMonth: Date): void {
    this.updateAllCategoryTotals();
    this.categories = this.currentMonthExpense ? this.currentMonthExpense.categories : [];
  }

  updateTotalMonthSpent(): void {
    let monthData = this.getCurrentMonthExpense();

    const total = monthData.categories.reduce((catAcc, category) => {
      const rowTotal = category.rows.reduce((rowAcc, row) => rowAcc + Number(row.value ?? 0), 0);
      return catAcc + rowTotal;
    }, 0);
    
    const totalMinusRecurring = monthData.categories.reduce((catAcc, category) => {
      const rowTotal = category.rows.reduce((rowAcc, row) => {
        return row.recurring ? rowAcc : rowAcc + Number(row.value ?? 0);
      }, 0);
      return catAcc + rowTotal;
    }, 0);    
    
    this.totalSpentWithoutRecurring = totalMinusRecurring;
    this.totalSpent = total;
  }

  updateAllCategoryTotals(): void {
    this.currentMonthExpense.categories.forEach(x => this.updateCategoryTotal(x), );
  }

  addRow(categoryId: string): void {
    const category = this.getCategory(categoryId);
    if (category) {
      const nextOrder = category.rows.length;
      category.rows = [...category.rows, { id: uuid(), name: '', value: 0, order: nextOrder, recurring: false }];
    }
  }

  deleteRow(categoryId: string, rowId: string): void {
    const category = this.getCategory(categoryId);
    if (category !== undefined) {
      category.rows = category.rows.filter(row => row.id !== rowId);
      
      this.updateTotalMonthSpent();
      this.updateCategoryTotal(category);
    }
  }

  drop(event: CdkDragDrop<SubcategoryRow[]>, category: { rows: SubcategoryRow[] }): void {
    if (event.previousIndex !== event.currentIndex) {
      const updatedRows = [...category.rows];
      moveItemInArray(updatedRows, event.previousIndex, event.currentIndex);
      updatedRows.forEach((row, index) => row.order = index);
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
    this.updateTotalMonthSpent();
  }

  addCategory(): void {
    this.categories.push({ 
      id: uuid(),
      name: 'NEW CATEGORY',
      rows: [ 
        {
          id: uuid(),
          order: 0,
          name: "",
          value: null,
          recurring: false,
        }
      ] });
    this.isEditable = true;
  }

  deleteCategory(categoryId: string): void {
    const categoryToDelete = this.categories.find(x => x.id == categoryId);
    if(categoryToDelete === undefined)
      return;
    
    categoryToDelete.rows.forEach(x => this.deleteRow(categoryId, x.id));
    this.updateTotalMonthSpent();
    this.categories = this.categories.filter(x => x.id !== categoryToDelete.id);
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
    this.selectedMonth = monthDate;
    this.currentMonthExpense = this.getCurrentMonthExpense();
    this.updateTotalMonthSpent();
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

  saveChanges(): void {
    this.financeDataService.save(this.monthExpenses);
    this.isEditable = false;
  }
}
