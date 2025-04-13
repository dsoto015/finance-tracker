import { Injectable } from '@angular/core';

declare global {
  interface Window {
    electron: {
      loadExpenses: () => Promise<any>;
      saveExpenses: (data: any) => Promise<{ success: boolean }>;
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
}
