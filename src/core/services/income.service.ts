import { Injectable, signal, computed } from '@angular/core';
import { ElectronService } from './electron-service';
import { MonthExpense } from '../models/expenses.model';
import { HttpClient } from '@angular/common/http';
import { YearIncome } from '../models/income.model';
import { v4 as uuid } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private _totalIncome = signal<YearIncome[]>([]);
  readonly totalIncome = computed(() => this._totalIncome());

  constructor(private electron: ElectronService, private http: HttpClient) {
    this.loadIncome();
  }

  async loadIncome(): Promise<YearIncome[]> {
    const isElectron = !!window?.electron?.loadIncome;
    let data = [];

    if (isElectron) {
      console.log('[Electron] Loading income');
      data = await window.electron.loadIncome() ?? [];
    } else {
      console.log('[ng serve] Loading mock income');
      try {
        const result = await this.http
          .get<YearIncome[]>('/mock-data/mock-income.json')
          .toPromise();
        data = result ?? [];
      } catch (err) {
        console.warn('Failed to load mock data, using empty array');
        data =[];
      }
    }
    this._totalIncome.set(data);
    this.fillMissingMonths(2025);
    
    return data;
  }

  async save(data: YearIncome[]): Promise<void> {
    if (window?.electron?.saveIncome) {
      const success = await window.electron.saveIncome(data);
      console.log("save successful?", success);
    } else {
      this._totalIncome.update(() => data);
      console.log('save successful', data);
    }
  }

  updateIncome(rowAmount: number, monthId: number, rowIndex: number): void {
    // const updatedIncome = this._totalIncome().monthIncome.map((monthIncome) => {
    //   if (monthIncome.month === monthId) {
    //     return {
    //       ...monthIncome,
    //       monthIncome: monthIncome.map((entry, index) =>
    //         index === rowIndex
    //           ? { ...entry, amount: Number(rowAmount || 0) }
    //           : entry
    //       ),
    //     };
    //   }
    //   return monthIncome;
    // });

    // this._totalIncome.update(() => updatedIncome); // Update the signal
    // this.save(this.totalIncome()); // Persist the changes
  }

  fillMissingMonths(year: number): void {
    // const currentIncome = this._totalIncome();

    // // Filter income data for the given year
    // const yearIncome = currentIncome.filter((monthIncome) => monthIncome.year === year);
    // console.log("fillMissingMonths for ", year);
    // if (yearIncome.length === 0) {
      
    //   // If no months exist for the year, generate a full blank year
    //   const defaultIncome: Income[] = Array.from({ length: 12 }, (_, i) => ({
    //     id: uuid(),
    //     month: i + 1,
    //     year: year,
    //     income: [
    //       { source: 'Source 1', amount: 0 },
    //       { source: 'Source 2', amount: 0 },
    //     ],
    //   }));
    //   console.log("whole year didn't exist, adding default data: ", defaultIncome);
    //   // Replace the signal with the new year data
    //   this._totalIncome.update((currentIncome) => [
    //     ...currentIncome.filter((monthIncome) => monthIncome.year !== year), // Remove any existing data for the year
    //     ...defaultIncome,
    //   ]);
    //   return;
    // }

    // // If some months exist, find the missing months
    // const existingMonths = new Set(yearIncome.map((monthIncome) => monthIncome.month));
    // const missingMonths = Array.from({ length: 12 }, (_, i) => i + 1).filter((month) => !existingMonths.has(month));

    // // Generate default data for the missing months
    // const defaultIncome: Income[] = missingMonths.map((month) => ({
    //   id: `${year}-${month}`, // Unique ID based on year and month
    //   month: month,
    //   year: year,
    //   income: [
    //     { source: 'Source 1', amount: 0 },
    //     { source: 'Source 2', amount: 0 },
    //   ],
    // }));

    // if (defaultIncome.length > 0) {
    //   this._totalIncome.update((currentIncome) => [
    //     ...currentIncome, // Keep existing data
    //     ...defaultIncome.filter((newMonth) =>
    //       !currentIncome.some(
    //         (existingMonth) =>
    //           existingMonth.year === newMonth.year && existingMonth.month === newMonth.month
    //       )
    //     ), // Only add truly missing months
    //   ]);
    // }
  }
}