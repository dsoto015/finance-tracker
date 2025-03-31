import { Component, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { v4 as uuid } from 'uuid';
import { FinanceDataService } from '../../../core/services/finance-data-service';
import { CategoryBlock, SubcategoryRow } from '../../../core/models/expenses.model';
import { CdkDragDrop, CdkDropList, CdkDrag, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-expenses',
  standalone: false,
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss']
})
export class ExpensesComponent {
  @ViewChild('table', { static: true }) table!: MatTable<any>;

  displayedColumns: string[] = ['actions', 'name', 'value'];
  categories: {
    id: string;
    name: string;
    rows: MatTableDataSource<SubcategoryRow>
    }[] = [
      {
        id: uuid(),
        name: 'Housing',
        rows: new MatTableDataSource<SubcategoryRow>([
          { id: uuid(), name: 'Rent', value: 1200 },
          { id: uuid(), name: 'Utilities', value: 150 },
        ])
      },
      {
        id: uuid(),
        name: 'Transportation',
        rows: new MatTableDataSource<SubcategoryRow>([
          { id: uuid(), name: 'Gas', value: 100 },
          { id: uuid(), name: 'Insurance', value: 200 },
        ])
      },
      {
        id: uuid(),
        name: 'Food',
        rows: new MatTableDataSource<SubcategoryRow>([
          { id: uuid(), name: 'Groceries', value: 300 },
          { id: uuid(), name: 'Dining Out', value: 100 },
        ])
      }
    ];
  isEditable: boolean = false;
  editVerbiage: string = "Unlock Rows";

  constructor(private financeDataService: FinanceDataService) { }

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

  getCategoryTotal(category: { rows: MatTableDataSource<SubcategoryRow> }): number {
    return category.rows.data.reduce((acc, row) => acc + (Number(row.value) || 0), 0);
  }

}
