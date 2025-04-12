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
      this.categories = [];
    }
  }

  updateTotalMonthSpent(currentMonth: Date): number {
    console.log("passed in month: ", currentMonth);
    let monthData = this.monthExpense.find(x => x.month === currentMonth.getMonth() + 1);
  
    if(monthData == undefined) {
      let newMonthData = {
        id: uuid(),
        month: currentMonth.getMonth() + 1,
        year: currentMonth.getFullYear(),
        totalSpent: 0,
        categories: []
      };
  
      this.monthExpense.push(newMonthData);    
      monthData = newMonthData;
    }
  
    const total = monthData.categories.reduce((catAcc, category) => {
      const rowTotal = category.rows.reduce((rowAcc, row) => rowAcc + Number(row.value ?? 0), 0);
      return catAcc + rowTotal;
    }, 0);
  
    console.log("Calculated total: ", total);
    return total;
      
  }
  
  updateAllCategoryTotals(currentMonth: Date) {
    const monthData = this.monthExpense.find(x => x.month === currentMonth.getMonth() + 1);
    monthData?.categories.forEach(x => this.updateCategoryTotal(x))
  }

  addRow(categoryId: string) {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      const currentData = category.rows;
      const newData = [...currentData, { id: uuid(), name: '', value: 0 }];
      category.rows = newData;
    }
  }

  deleteRow(categoryId: string, rowId: string) {
    const category = this.categories.find(c => c.id === categoryId);
    if (category) {
      const updatedData = category.rows.filter(row => row.id !== rowId);
      category.rows= updatedData;
    }
  }


  drop(event: CdkDragDrop<SubcategoryRow[]>, category: { rows: SubcategoryRow[] }) {
    if (event.previousIndex !== event.currentIndex) {
      const updatedRows = [...category.rows];
      moveItemInArray(updatedRows, event.previousIndex, event.currentIndex);
      category.rows = updatedRows;
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


  updateCategoryTotal(category: CategoryBlock) {
    const total = category.rows.reduce((acc, row) => acc + (Number(row.value) || 0), 0);
    console.log("category total: ", total);
    category.total = total;
    this.totalSpent = this.updateTotalMonthSpent(this.selectedMonth);
  }



  addCategory(): void {
    const newCategory = {
      id: uuid(),
      name: 'NEW CATEGORY',
      rows: []
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

  clearValue(categoryId: string, rowId: string) {
    const currentMonthData = this.monthExpense.find(x => x.month === this.selectedMonth.getMonth() + 1);
  
    if (!currentMonthData) return;
  
    const category = currentMonthData.categories.find(c => c.id === categoryId);
    if (!category) return;
  
    const row = category.rows.find(r => r.id === rowId);
    if (!row) return;
  
    row.value = null;
    this.updateCategoryTotal(category);
  }
  
}

