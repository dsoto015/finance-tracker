import { Component, computed, Inject, signal } from '@angular/core';
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
  categories: CategoryBlock[] = [];
  defaultCategories: CategoryBlock[] = [];
  monthExpenses: MonthExpense[] = [];
  currentMonthExpense!: MonthExpense;
  selectedMonth: Date = new Date();
  currentMonthName: string = '';
  totalSpent = 10;
  totalSpentWithoutRecurring = 0;

  isEditableSignal = signal(false);
  editVerbiageComputedSignal = computed(() => this.isEditableSignal() ? 'Lock Rows' : 'Unlock Rows');

  toggleEditable(): void {
    this.isEditableSignal.update(() => !this.isEditableSignal());
  }

  constructor(private financeDataService: FinanceDataService,
              private defaultTemplateService: DefaultTemplateService) {
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
    const foundMonthExpense = this.monthExpenses.find(x => x.month === this.selectedMonth.getMonth() && x.year == this.selectedMonth.getFullYear());
    if(foundMonthExpense != undefined) {
      return foundMonthExpense;
    }
    const monthData = {
      id: uuid(),
      month: this.selectedMonth.getMonth(),
      year: this.selectedMonth.getFullYear(),
      totalSpent: 0,
      categories: this.defaultCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        rows: cat.rows.map(row => ({
          id: uuid(),
          name: row.name,
          value: row.value ?? null,
          order: row.order,
          recurring: row.recurring ?? false
        })),
        total: 0
      }))
    };
    this.monthExpenses.push(monthData);
    return monthData;
  }

  saveInput(categoryId: string, rowId: string, amount: number): void {
    // Find the category and row by their IDs
    const category = this.getCategory(categoryId);
    const row = category?.rows.find(r => r.id === rowId);
    // If both category and row are found, update the value
    if (row) {
      row.value = amount;
      this.updateCategoryTotal(category!);
    }
    console.log('save value:', amount);
    this.updateForm(this.selectedMonth);
    this.saveChanges();
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
    // const charCode = event.charCode;
    // if (charCode < 48 || charCode > 57) {
    //   event.preventDefault();
    // }
  }

  toggleEdit(): void {
    this.isEditableSignal.update(() => !this.isEditableSignal());
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
    this.isEditableSignal.update(() => true);
  }

  deleteCategory(categoryId: string): void {
    const categoryToDelete = this.categories.find(x => x.id == categoryId);
    if(categoryToDelete === undefined)
      return;
    
    categoryToDelete.rows.forEach(x => this.deleteRow(categoryId, x.id));
    this.updateTotalMonthSpent();
    this.categories = this.categories.filter(x => x.id !== categoryToDelete.id);
    this.saveChanges();
  }

  onChosenMonth(normalizedMonth: Date, datepicker: any): void {
    // this.saveChanges();
    this.selectedMonth = normalizedMonth;
    datepicker.close();
    this.loadMonthData(normalizedMonth);
  }

  loadMonthData(monthDate: Date): void {
    this.currentMonthName = this.getMonthName(monthDate);
    this.selectedMonth = monthDate;
    this.currentMonthExpense = this.getCurrentMonthExpense();
    console.log('loadMonthData, new month: ', this.currentMonthExpense);
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

  nextMonth() {
    this.saveChanges();
    const nextMonth = this.selectedMonth.getMonth() + 1;
    const normalizedMonth = new Date(this.selectedMonth.getFullYear(), nextMonth, 1);
    console.log('nextMonth', nextMonth);
    this.loadMonthData(normalizedMonth);
  }

  prevMonth() {
    this.saveChanges();
    const previousMonth = this.selectedMonth.getMonth() - 1;
    const normalizedMonth = new Date(this.selectedMonth.getFullYear(), previousMonth, 1);
    console.log('previousMonth', previousMonth);
    this.loadMonthData(normalizedMonth);
  }

  saveChanges(): void {
    console.log('Saving changes..total spent is: ', this.totalSpent);
    this.currentMonthExpense.totalSpent = this.totalSpent;
    this.financeDataService.save(this.monthExpenses);
    this.isEditableSignal.update(() => false);
  }
}
