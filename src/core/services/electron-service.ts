import { Injectable } from '@angular/core';

declare global {
  interface Window {
    electron: {
      loadExpenses: () => Promise<any>;
      saveExpenses: (data: any) => Promise<{ success: boolean }>;
      loadDefaults: () => Promise<any>;
      saveDefaults: (data: any) => Promise<{ success: boolean }>;
      loadIncome: () => Promise<any>;
      saveIncome: (data: any) => Promise<{ success: boolean }>;
      loadIncomeDefaultSources: () => Promise<any>;
      loadSavingsDefaultSources: () => Promise<any>;
      saveSavings(data: any): Promise<{ success: boolean; }>;
      loadSavings(): Promise<any>;
    };
  }
}

@Injectable({ providedIn: 'root' })
export class ElectronService {
  loadExpenses(): Promise<any> {
    return window.electron?.loadExpenses() ?? Promise.resolve([]);
  }

  saveExpenses(data: any): Promise<{ success: boolean }> {
    return window.electron?.saveExpenses(data) ?? Promise.resolve({ success: false });
  }

  loadDefaults(): Promise<any> {
    return window.electron?.loadDefaults() ?? Promise.resolve([]);
  }

  saveDefaults(data: any): Promise<{ success: boolean }> {
    return window.electron?.saveDefaults(data) ?? Promise.resolve({ success: false });
  }

  loadIncome(): Promise<any> {
    return window.electron?.loadIncome() ?? Promise.resolve([]);
  }

  saveIncome(data: any): Promise<{ success: boolean }> {
    return window.electron?.saveIncome(data) ?? Promise.resolve({ success: false });
  }

  loadIncomeDefaultSources(): Promise<any> {
    return window.electron?.loadIncomeDefaultSources() ?? Promise.resolve([]);
  }

  loadSavingsDefaultSources(): Promise<any> {
    return window.electron?.loadSavingsDefaultSources() ?? Promise.resolve([]);
  }

  loadSavings(): Promise<any> {
    return window.electron?.loadSavings() ?? Promise.resolve([]);
  }

  saveSavings(data: any): Promise<{ success: boolean }> {
    return window.electron?.saveSavings(data) ?? Promise.resolve({ success: false });
  }
}
