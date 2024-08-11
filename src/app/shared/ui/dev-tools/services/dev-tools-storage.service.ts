import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DevToolsStorageService {
  private storageKey = 'dev-tools';

  set(key: string, value: unknown): void {
    const storage = this.getStorage();
    storage[key] = value;
    this.saveStorage(storage);
  }

  get(key: string): unknown {
    const storage = this.getStorage();
    return storage[key];
  }

  remove(key: string): void {
    const storage = this.getStorage();
    delete storage[key];
    this.saveStorage(storage);
  }

  clear(): void {
    localStorage.clear();
  }

  private getStorage() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : {};
  }

  private saveStorage(data: unknown): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }
}
