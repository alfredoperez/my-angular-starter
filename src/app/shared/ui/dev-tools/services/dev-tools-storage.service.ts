import { Injectable } from '@angular/core';

/**
 * A service for storing and retrieving data using the browser's local storage.
 *
 * NOTE: This service is only used by the Dev Tools.
 *
 * @example
 * const storageService = new DevToolsStorageService();
 *
 * // Set a value
 * storageService.set('username', 'john_doe');
 *
 * // Get a value
 * const username = storageService.get('username');
 * console.log(username); // Outputs: 'john_doe'
 *
 * // Remove a value
 * storageService.remove('username');
 *
 * // Clear all storage data
 * storageService.clear();
 */
@Injectable({ providedIn: 'root' })
export class DevToolsStorageService {
  private storageKey = 'dev-tools';

  /**
   * Sets the value for a given key in the storage.
   *
   * @param key - The key to set the value for.
   * @param value - The value to be set.
   *
   * @returns This method does not return any value.
   */
  set<T>(key: string, value: T): void {
    const storage = this.getStorage();
    storage[key] = value;
    this.saveStorage(storage);
  }

  /**
   * Retrieves the value associated with the specified key from the storage.
   *
   * @param key - The key of the value to retrieve from the storage.
   * @return The value associated with the specified key, or undefined if the key does not exist.
   */
  get<T>(key: string): T | undefined {
    const storage = this.getStorage();
    return storage[key] as T;
  }

  /**
   * Removes a specific key-value pair from the storage.
   *
   * @param key The key to be removed from the storage.
   *
   * @return This method does not return any value.
   */
  remove(key: string): void {
    const storage = this.getStorage();
    delete storage[key];
    this.saveStorage(storage);
  }
  /**
   * Clears all the data stored in the localStorage.
   *
   * @return This method does not return any value.
   */
  clear(): void {
    localStorage.removeItem(this.storageKey);
  }

  private getStorage() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : {};
  }

  private saveStorage(data: unknown): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }
}
