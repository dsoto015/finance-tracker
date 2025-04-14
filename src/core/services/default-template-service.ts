import { Injectable } from '@angular/core';
import { v4 as uuid } from 'uuid';
import { ElectronService } from './electron-service';
import { HttpClient } from '@angular/common/http';
import { CategoryBlock, MonthExpense } from '../models/expenses.model';

@Injectable({ providedIn: 'root' })
export class DefaultTemplateService {

  constructor(private electron: ElectronService, private http: HttpClient) {
  }
    
  async loadDefaults(): Promise<CategoryBlock[]> {
    const isElectron = !!window?.electron?.loadExpenses;
    let data: CategoryBlock[];
    if (isElectron) {
        data = await window.electron.loadDefaults() ?? [];  
        console.log(data);
        //return data;
        return data.map((category, catIndex) => ({
            id: uuid(),
            name: category.name,
            rows: category.rows.map((row, rowIndex) => ({
              id: uuid(),
              name: row.name,
              value: row.value ?? null,
              order: rowIndex,
              recurring: row.recurring
            }))
          }));
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
