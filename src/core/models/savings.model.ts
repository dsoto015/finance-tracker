export interface YearSavings {
  id: string;
  year: number;
  monthSavings: MonthSavings[];
}

export interface MonthSavings {
  id: string,
  month: number,
  savings: Savings[]
}

export interface Savings {
  source: string, 
  amount: number
}