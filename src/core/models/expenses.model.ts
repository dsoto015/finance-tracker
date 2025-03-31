import { MatTableDataSource } from '@angular/material/table';

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
