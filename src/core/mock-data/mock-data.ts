import { MatTableDataSource } from '@angular/material/table';
import { v4 as uuid } from 'uuid';
import { CategoryBlock, MonthExpenese, SubcategoryRow } from '../models/expenses.model';


export const MOCK_CATEGORIES_ONE: CategoryBlock[] = [
  {
    id: uuid(),
    name: 'Travel',
    rows: [
      { id: uuid(), name: 'TV', value: 14 },
      { id: uuid(), name: 'Water', value: 30 },
    ]
  },
  {
    id: uuid(),
    name: 'Fun',
    rows: [
      { id: uuid(), name: 'Bills', value: 100 },
      { id: uuid(), name: 'Insurance', value: 20000 },
    ]
  }
];

export const MOCK_CATEGORIES_TWO: CategoryBlock[] = [
  {
    id: uuid(),
    name: 'Housing',
    rows: [
      { id: uuid(), name: 'Rent', value: 1200 },
      { id: uuid(), name: 'Utilities', value: 150 },
    ]
  },
  {
    id: uuid(),
    name: 'Transportation',
    rows: [
      { id: uuid(), name: 'Gas', value: 100 },
      { id: uuid(), name: 'Insurance', value: 200 },
    ]
  },
  {
    id: uuid(),
    name: 'Food',
    rows: [
      { id: uuid(), name: 'Groceries', value: 300 },
      { id: uuid(), name: 'Dining Out', value: 100 },
    ]
  }
];


export const MOCK_MONTH: MonthExpenese[] = [
  {
    id: uuid(),
    month: 3,
    year: 2025,
    totalSpent: 1000,
    categories: MOCK_CATEGORIES_ONE
  },
  {
    id: uuid(),
    month: 4,
    year: 2025,
    totalSpent: 2000,
    categories: MOCK_CATEGORIES_TWO
  }
];
