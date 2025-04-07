import { MatTableDataSource } from '@angular/material/table';
import { v4 as uuid } from 'uuid';
import { CategoryBlock, SubcategoryRow } from '../models/expenses.model';

export const MOCK_CATEGORIES: CategoryBlock[] = [
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
