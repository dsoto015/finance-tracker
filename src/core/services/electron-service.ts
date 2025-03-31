import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  private electron = (window as any).electron;

  loadExpenses(): Promise<any[]> {
    return this.electron?.loadExpenses?.() || Promise.resolve([]);
  }

  saveExpenses(data: any[]): Promise<any> {
    return this.electron?.saveExpenses?.(data) || Promise.resolve({ success: false });
  }
}
