import { Injectable, signal, computed } from '@angular/core';
import { ElectronService } from './electron-service';
import { MonthExpense } from '../models/expenses.model';
import { HttpClient } from '@angular/common/http';
import { Income } from '../models/income.model';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private _totalIncome = signal<Income[]>([]);
  readonly totalIncome = computed(() => this._totalIncome());

  constructor(private electron: ElectronService, private http: HttpClient) {
    this.loadIncome();
  }

  async loadIncome(): Promise<Income[]> {
    const isElectron = !!window?.electron?.loadIncome;
    let data: Income[] = [];
  
    if (isElectron) {
      console.log('[Electron] Loading income');
      data = await window.electron.loadIncome() ?? [];
    } else {
      console.log('[ng serve] Loading mock income');
      try {
        const result = await this.http
          .get<Income[]>('/mock-data/mock-income.json')
          .toPromise();  
        data = result ?? [];
      } catch (err) {
        console.warn('Failed to load mock data, using empty array');
        data = [];
      }
    }
  
    this._totalIncome.set(data);
    return data;
  }
}