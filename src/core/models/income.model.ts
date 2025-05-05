export interface Income {
  id: string;
  month: number;
  year: number;
  income: MonthIncome[];
}

export interface MonthIncome {
  source: string;
  amount: number;
}