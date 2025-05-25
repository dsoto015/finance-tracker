import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { v4 as uuid } from 'uuid';
import { DefaultTemplateService } from './default-template-service';
import { Savings, YearSavings } from '../models/savings.model';

@Injectable({
  providedIn: 'root'
})
export class SavingsService {
  private defaultTemplateService = inject(DefaultTemplateService);

  private _totalSavingsSignal = signal<YearSavings[]>([]);
  readonly totalSavingsSignal = computed(() => this._totalSavingsSignal());

  defaultSources: Savings[] = [];

  constructor(private http: HttpClient) {
    this.loadSavings();
  }

  async loadSavings(): Promise<YearSavings[]> {
    this.defaultSources = await this.defaultTemplateService.loadDefaultSavingsSources();
    this.defaultSources.map((savings) => savings.amount = 0);
    
    const isElectron = !!window?.electron?.loadSavings;
    let data = [];

    if (isElectron) {
      console.log('[Electron] Loading savings');
      data = await window.electron.loadSavings() ?? [];
    } else {
      console.log('[ng serve] Loading mock savings');
      try {
        const result = await this.http
          .get<YearSavings[]>('/mock-data/mock-savings.json')
          .toPromise();
        data = result ?? [];
      } catch (err) {
        console.warn('Failed to load mock data, using empty array');
        data =[];
      }
    }

    this._totalSavingsSignal.set(data);    
    let currentYear = new Date().getFullYear();
    this.fillMissingMonths(currentYear);
    return data;
  }

  updateSavings(year: number, rowAmount: number, monthId: string, rowIndex: number): void {
    const updated = this._totalSavingsSignal().map(yearSavings => {
      if (yearSavings.year !== year) return yearSavings;
      return {
        ...yearSavings,
        monthSavings: yearSavings.monthSavings.map((month, idx) => {
          if (month.id !== monthId) return month;
          if (idx === rowIndex) {
            return { ...month, amount: rowAmount };
          }
          return month;
        })
      };
    });

    this._totalSavingsSignal.update(() => updated);
    this.save(updated);
  }  

  fillMissingMonths(year: number): void {
    const current = this._totalSavingsSignal();

    let yearSavings = current.find(y => y.year === year);

    if (!yearSavings) {
      yearSavings = {
        id: uuid(),
        year,
        monthSavings: []
      };
      current.push(yearSavings);
    }

    const existingMonths = new Set(yearSavings.monthSavings.map(m => m.month));
      
    for (let m = 0; m < 12; m++) {
      if (!existingMonths.has(m)) {
        yearSavings.monthSavings.push({
          id: uuid(),
          month: m,
          savings: this.defaultSources.map(x => ({ ...x }))
        });
      }
    }

    yearSavings.monthSavings.sort((a, b) => a.month - b.month);
    this._totalSavingsSignal.update(() => ([...current]));
  }

  addRow(year: number, monthId: string) {
    const updated = this._totalSavingsSignal().map(yearSavings => {
      if (yearSavings.year !== year) return yearSavings;
      return {
        ...yearSavings,
        monthSavings: yearSavings.monthSavings.map((month) => {
          if (month.id !== monthId) return month;
          const newSavings = [...month.savings, { source: 'Source', amount: 0 } as Savings];
          return { ...month, savings: newSavings };
        })
      };
    });

    this._totalSavingsSignal.update(() => updated);
    this.save(updated);
  }

  removeRow(year: number, monthId: string, rowIndex: number) {
    const updated = this._totalSavingsSignal().map(yearSavings => {
      if (yearSavings.year !== year) return yearSavings;
      return {
        ...yearSavings,
        monthSavings: yearSavings.monthSavings.map((month) => {
          if (month.id !== monthId) return month;
        const newSavings = month.savings.filter((_, idx) => idx !== rowIndex);
          return { ...month, savings: newSavings };
        })
      };
    });

    this._totalSavingsSignal.update(() => updated);
    this.save(updated);  
  }  

  async save(data: YearSavings[]): Promise<void> {
    if (window?.electron?.saveSavings) {
      const success = await window.electron.saveSavings(data);
      console.log("save successful?", success);
    } else {
      this._totalSavingsSignal.update(() => data);
      console.log('save successful', data);
    }
  }
}