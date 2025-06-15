import { Component, inject, Inject, model, signal, WritableSignal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DefaultTemplateService } from '../../../../core/services/default-template-service';
import { CategoryBlock, SubcategoryRow } from '../../../../core/models/expenses.model';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-expense-settings',
  standalone: false,
  templateUrl: './expense-settings.component.html',
  styleUrl: './expense-settings.component.scss'
})
export class ExpenseSettingsComponent {
  private defaultTemplateService = inject(DefaultTemplateService);
  private readonly dialogRef = inject(MatDialogRef<ExpenseSettingsComponent>);
  private readonly data = inject(MAT_DIALOG_DATA) as { category: string, note: string };
  private readonly recurringByRow: Record<string, WritableSignal<boolean>> = {};

  defaultCategories: CategoryBlock[] = [];

  async ngOnInit(): Promise<void> {
    this.defaultCategories = await this.defaultTemplateService.loadDefaultExpenses();
    for (const cat of this.defaultCategories) {
      for (const row of cat.rows) {
        this.recurringByRow[row.id] = signal<boolean>(row.recurring);
      }
    }
  }

  isRecurring(row: SubcategoryRow): boolean {
    return this.recurringByRow[row.id]?.() ?? false;
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }

  isChecked(categoryId: string, rows: SubcategoryRow[]) {
    console.log("checking checked on default categories: ", this.defaultCategories);
  }

  onSubmitClick(): void {
    this.dialogRef.close(this.data.note);
  }

  onCheckChanged(row: SubcategoryRow, isChecked: boolean) {
    console.log("changed to ", isChecked);
    row.recurring = isChecked;
    this.recurringByRow[row.id].set(isChecked);
  }

  addRow(category: CategoryBlock) {

    console.log("adding row to ", category.name);
    const nextOrder = category.rows.length;
    category.rows = [...category.rows, { id: uuid(), name: 'New', value: 0, order: nextOrder, recurring: false }];
  }


}
