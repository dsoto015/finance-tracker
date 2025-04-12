import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { v4 as uuid } from 'uuid';
import { FinanceDataService } from '../../../core/services/finance-data-service';
import { CategoryBlock, MonthExpenese, SubcategoryRow } from '../../../core/models/expenses.model';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';
import { MOCK_MONTH } from '../../../../src//core/mock-data/mock-data';

@Component({
  selector: 'app-expenses',
  standalone: false,
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss']
})
export class ExpensesComponent {

  @ViewChild('table', { static: true }) table!: MatTable<any>;

  displayedColumns: string[] = ['actions', 'name', 'value'];
 
  isEditable: boolean = false;
  editVerbiage: string = "Unlock Rows";
  categories: CategoryBlock[] = [];
  monthExpense: MonthExpenese[];
  selectedMonth: Date = new Date();
  currentMonth: any;
  totalSpent: number = 0;
  categoryTotal: number = 0;

  
  constructor(private financeDataService: FinanceDataService) { 
    this.monthExpense = MOCK_MONTH
  }

  ngOnInit() {
    this.currentMonth = this.selectedMonth.toLocaleDateString('default', {month: 'long'});
    this.totalSpent = this.updateTotalMonthSpent(this.selectedMonth);
    this.updateForm(this.selectedMonth)
  }

  updateForm(selectedMonth: Date) {
    this.updateCategories(selectedMonth);
  }

  updateCategories(selectedMonth: Date) {
    this.updateAllCategoryTotals(selectedMonth);
    const match = this.monthExpense.filter(x => x.month === this.selectedMonth.getMonth() + 1).at(0);
    if (match) {
      this.categories = match.categories;
    } else {
      this.categories = []; // or handle however you'd like
    }
  }

  updateTotalMonthSpent(currentMonth: Date): number {
    console.log("passed in month: ", currentMonth);
    const monthData = this.monthExpense.find(x => x.month === currentMonth.getMonth() + 1);
  
    if (monthData !== undefined) {
      console.log("data matched: ", monthData);
  
      const total = monthData.categories.reduce((catAcc, category) => {
      const rowTotal = category.rows.data.reduce((rowAcc, row) => rowAcc + (row.value ?? 0), 0);
      return catAcc + rowTotal;
      }, 0);
  
      console.log("Calculated total: ", total);
      return total;
    }
  
    console.log("Month NOT found in dataset: ", monthData);
    return 0;
  }
  
  updateAllCategoryTotals(currentMonth: Date) {
    const monthData = this.monthExpense.find(x => x.month === currentMonth.getMonth() + 1);
    monthData?.categories.forEach(x => this.updateCategoryTotal(x))
  }

  addRow(categoryId: string) {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      const currentData = category.rows.data;
      const newData = [...currentData, { id: uuid(), name: '', value: 0 }];
      category.rows.data = newData;
      category.rows._updateChangeSubscription();
    }
  }

  deleteRow(categoryId: string, rowId: string) {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      const updatedData = category.rows.data.filter(row => row.id !== rowId);
      category.rows.data = updatedData;
      category.rows._updateChangeSubscription();
    }
  }


  drop(event: CdkDragDrop<SubcategoryRow[]>, category: { rows: MatTableDataSource<SubcategoryRow> }) {
    if (event.previousIndex !== event.currentIndex) {
      const updatedRows = [...category.rows.data];
      moveItemInArray(updatedRows, event.previousIndex, event.currentIndex);
      category.rows.data = updatedRows;
      category.rows._updateChangeSubscription();
    }
  }

  allowOnlyNumbers(event: KeyboardEvent) {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

  toggleEdit() {
    this.isEditable = !this.isEditable;
    if (this.isEditable) {
      this.editVerbiage = "Lock Rows"
    }
    else {
      this.editVerbiage = "Unlock Rows"
    }
  }


  updateCategoryTotal(category: { rows: MatTableDataSource<SubcategoryRow> }) {
    const total = category.rows.data.reduce((acc, row) => acc + (Number(row.value) || 0), 0);
    console.log("category total: ", total);
    this.categoryTotal = total;    
  }



  addCategory(): void {
    const newCategory = {
      id: uuid(),
      name: 'NEW CATEGORY',
      rows: new MatTableDataSource<SubcategoryRow>([])
    };
  
    this.categories.push(newCategory);
  }

  deleteCategory(categoryId: string) {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      this.categories = this.categories.filter(x => x.id != categoryId)
    }
  }

  chosenMonthHandler(normalizedMonth: Date, datepicker: any) {
    this.selectedMonth = normalizedMonth;
    datepicker.close();

    this.loadMonthData(normalizedMonth);
  }

  onMonthChange(event: any) {
    const newDate = new Date(event.value);
    this.selectedMonth = newDate;
    this.loadMonthData(newDate);
  }

  loadMonthData(monthDate: Date) {
    // 🧠 Replace this with a call to your service later
    console.log('Loading data for:', monthDate);
    // this.financeDataService.getByMonth(monthDate)... etc
    this.currentMonth = monthDate.toLocaleDateString('default', {month: 'long'});
    this.totalSpent = this.updateTotalMonthSpent(monthDate);
    this.updateForm(monthDate)
  }

}
