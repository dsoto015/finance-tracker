import { MatTableDataSource } from '@angular/material/table';

export interface MonthExpenese {
  totalSpent: number;
  month: number;
  year: number;
  categories: CategoryBlock[]
}

export interface SubcategoryRow {
  id: string;
  name: string;
  value: number | null;
}

export interface CategoryBlock {
  id: string;
  name: string;
  rows: MatTableDataSource<SubcategoryRow>; // ✅ Just ONE instance per category
}