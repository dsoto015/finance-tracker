import { Injectable, signal, computed } from '@angular/core';
import { ElectronService } from './electron-service';

@Injectable({
  providedIn: 'root',
})
export class FinanceDataService {
  private _expenses = signal<any>([]);
  readonly expenses = computed(() => this._expenses());

  constructor(private electron: ElectronService) {
    this.loadFromDisk();
  }

  private async loadFromDisk() {
    const data = await this.electron.loadExpenses();
    this._expenses.set(data);
  }

  private async saveToDisk() {
    await this.electron.saveExpenses(this._expenses());
  }

  setExpenses(data: any) {
    this._expenses.set(data);
    this.saveToDisk();
  }

  addExpense(item: any) {
    this._expenses.update((curr) => {
      const updated = [...curr, item];
      this.saveToDisk();
      return updated;
    });
  }

  removeExpense(index: number) {
    //this._expenses.update((curr) => {
    //  const updated = curr.filter((_, i) => i !== index);
    //  this.saveToDisk();
    //  return updated;
    //});
  }
}
