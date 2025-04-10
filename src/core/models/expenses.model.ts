import { MatTableDataSource } from '@angular/material/table';

export interface MonthExpenese {
  id: string;
  month: number;
  year: number;
  totalSpent: number;
  categories: CategoryBlock[]
}

export interface CategoryBlock {
  id: string;
  name: string;
  rows: MatTableDataSource<SubcategoryRow>; // ✅ Just ONE instance per category
}

export interface SubcategoryRow {
  id: string;
  name: string;
  value: number | null;
}

