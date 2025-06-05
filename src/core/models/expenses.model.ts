export interface MonthExpense {
  id: string;
  month: number;
  year: number;
  totalSpent: number;
  categories: CategoryBlock[]
}

export interface CategoryBlock {
  id: string;
  name: string;
  rows: SubcategoryRow[];
  total?: number;
  note: string | null
}

export interface SubcategoryRow {
  id: string;
  name: string;
  value: number | null;
  order: number;
  recurring: boolean
}

