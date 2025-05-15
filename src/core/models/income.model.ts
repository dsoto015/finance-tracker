export interface YearIncome {
  id: string;
  year: number;
  monthIncome: MonthIncome[];
}

export interface MonthIncome {
  id: string,
  month: number,
  income: Income[]
}

export interface Income {
  source: string, 
  amount: number
}