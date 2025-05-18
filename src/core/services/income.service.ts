import { Injectable, signal, computed, inject } from '@angular/core';
import { MonthExpense } from '../models/expenses.model';
import { HttpClient } from '@angular/common/http';
import { Income, YearIncome } from '../models/income.model';
import { v4 as uuid } from 'uuid';
import { DefaultTemplateService } from './default-template-service';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private defaultTemplateService = inject(DefaultTemplateService);

  private _totalIncomeSignal = signal<YearIncome[]>([]);
  readonly totalIncomeSignal = computed(() => this._totalIncomeSignal());

  defaultSources: Income[] = [];

  constructor(private http: HttpClient) {
    this.loadIncome();
  }

  async loadIncome(): Promise<YearIncome[]> {
    this.defaultSources = await this.defaultTemplateService.loadDefaultIncomeSources();
    this.defaultSources.map((income) => income.amount = 0);
    
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

    this._totalIncomeSignal.set(data);    
    let currentYear = new Date().getFullYear();
    this.fillMissingMonths(currentYear);
    return data;
  }

  updateIncome(year: number, rowAmount: number, monthId: string, rowIndex: number): void {
    const updated = this._totalIncomeSignal().map(yearIncome => {
      if (yearIncome.year !== year) return yearIncome;
      return {
        ...yearIncome,
        monthIncome: yearIncome.monthIncome.map((month, idx) => {
          if (month.id !== monthId) return month;
          if (idx === rowIndex) {
            return { ...month, amount: rowAmount };
          }
          return month;
        })
      };
    });

    this._totalIncomeSignal.update(() => updated);
    this.save(updated);
  }  

  fillMissingMonths(year: number): void {
    const current = this._totalIncomeSignal();

    let yearIncome = current.find(y => y.year === year);

    if (!yearIncome) {
      yearIncome = {
        id: uuid(),
        year,
        monthIncome: []
      };
      current.push(yearIncome);
    }

    const existingMonths = new Set(yearIncome.monthIncome.map(m => m.month));
      
    for (let m = 0; m < 12; m++) {
      if (!existingMonths.has(m)) {
        yearIncome.monthIncome.push({
          id: uuid(),
          month: m,
          income: this.defaultSources.map(x => ({ ...x }))
        });
      }
    }

    yearIncome.monthIncome.sort((a, b) => a.month - b.month);
    this._totalIncomeSignal.update(() => ([...current]));
  }

  addRow(year: number, monthId: string) {
    const updated = this._totalIncomeSignal().map(yearIncome => {
      if (yearIncome.year !== year) return yearIncome;
      return {
        ...yearIncome,
        monthIncome: yearIncome.monthIncome.map((month) => {
          if (month.id !== monthId) return month;
          const newIncome = [...month.income, { source: 'Source', amount: 0 } as Income];
          return { ...month, income: newIncome };
        })
      };
    });

    this._totalIncomeSignal.update(() => updated);
    this.save(updated);
  }

  removeRow(year: number, monthId: string, rowIndex: number) {
    const updated = this._totalIncomeSignal().map(yearIncome => {
      if (yearIncome.year !== year) return yearIncome;
      return {
        ...yearIncome,
        monthIncome: yearIncome.monthIncome.map((month) => {
          if (month.id !== monthId) return month;
        const newIncome = month.income.filter((_, idx) => idx !== rowIndex);
          return { ...month, income: newIncome };
        })
      };
    });

    this._totalIncomeSignal.update(() => updated);
    this.save(updated);  
  }  

  async save(data: YearIncome[]): Promise<void> {
    if (window?.electron?.saveIncome) {
      const success = await window.electron.saveIncome(data);
      console.log("save successful?", success);
    } else {
      this._totalIncomeSignal.update(() => data);
      console.log('save successful', data);
    }
  }
}