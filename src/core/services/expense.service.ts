import { Injectable, signal, computed } from '@angular/core';
import { ElectronService } from './electron-service';
import { MonthExpense } from '../models/expenses.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private _expenses = signal<MonthExpense[]>([]);
  readonly expenses = computed(() => this._expenses());

  constructor(private electron: ElectronService, private http: HttpClient) {
    this.loadExpenses();
  }

  async loadExpenses(): Promise<MonthExpense[]> {
    const isElectron = !!window?.electron?.loadExpenses;
    let data: MonthExpense[] = [];
  
    if (isElectron) {
      console.log('[Electron] Loading expenses');
      data = await window.electron.loadExpenses() ?? [];
    } else {
      console.log('[ng serve] Loading mock expenses');
      try {
        const result = await this.http
          .get<MonthExpense[]>('/mock-data/mock-data.json')
          .toPromise();  
        data = result ?? [];
      } catch (err) {
        console.warn('Failed to load mock data, using empty array');
        data = [];
      }
    }
  
    this._expenses.set(data);
    return data;
  }
  
  async save(data: MonthExpense[]): Promise<void> {
    if (window?.electron?.saveExpenses) {
      const success = await window.electron.saveExpenses(data);
      console.log("save successful?", success);
    } else {
      this._expenses.update(() => data);
      console.log('save successful', data);
    }  
  }
}
