import { Injectable } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { ElectronService } from './electron-service';
import { HttpClient } from '@angular/common/http';
import { CategoryBlock, MonthExpense } from '../models/expenses.model';
import { Income, YearIncome } from '../models/income.model';
import { Savings } from '../models/savings.model';

@Injectable({ providedIn: 'root' })
export class DefaultTemplateService {

  constructor(private electron: ElectronService, private http: HttpClient) {
  }
    
  async loadDefaultExpenses(): Promise<CategoryBlock[]> {
    const isElectron = !!window?.electron?.loadExpenses;
    let data: CategoryBlock[];
    if (isElectron) {
        data = await window.electron.loadDefaults() ?? [];        
    } else {
      console.log('[ng serve] Loading mock expenses');
      try {
        const result = await this.http
          .get<CategoryBlock[]>('/mock-data/mock-default-categories.json')
          .toPromise();  
        data = result ?? [];
      } catch (err) {
        console.warn('Failed to load mock data, using empty array');
        data = [];
      }
    }

    data = data.map((category, catIndex) => ({
      id: uuid(),
      name: category.name,
      rows: category.rows.map((row, rowIndex) => ({
        id: uuid(),
        name: row.name,
        value: row.value ?? null,
        order: rowIndex,
        recurring: row.recurring ?? false
      })), 
      note: null
    }));
    console.log("service returned: ", data);
    return data;
  }

  async loadDefaultIncomeSources(): Promise<Income[]> {
    const isElectron = !!window?.electron?.loadIncomeDefaultSources;
    let data: Income[];
    if (isElectron) {
        data = await window.electron.loadIncomeDefaultSources() ?? [];        
    } else {
      console.log('[ng serve] Loading mock expenses');
      try {
        const result = await this.http
          .get<[]>('/mock-data/mock-income-sources.json')
          .toPromise();  
        data = result ?? [];
      } catch (err) {
        console.warn('Failed to load mock data, using empty array');
        data = [];
      }
    }
    
    return data;
  }

  async loadDefaultSavingsSources(): Promise<Savings[]> {
    const isElectron = !!window?.electron?.loadSavingsDefaultSources;
    let data: Savings[];
    if (isElectron) {
        data = await window.electron.loadSavingsDefaultSources() ?? [];        
    } else {
      console.log('[ng serve] Loading mock savings');
      try {
        const result = await this.http
          .get<[]>('/mock-data/mock-savings-sources.json')
          .toPromise();  
        data = result ?? [];
      } catch (err) {
        console.warn('Failed to load mock data, using empty array');
        data = [];
      }
    }
    
    return data;
  }

  saveDefaults(template: CategoryBlock[]): void {
    const stripped = template.map(cat => ({
      name: cat.name,
      rows: cat.rows.map(row => ({
        name: row.name,
        value: row.value
      }))
    }));

    window?.electron?.saveDefaults?.({ categories: stripped });
  }
}
