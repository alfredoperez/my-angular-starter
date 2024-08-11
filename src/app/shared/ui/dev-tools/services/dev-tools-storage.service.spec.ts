import { TestBed } from '@angular/core/testing';
import { MockBuilder } from 'ng-mocks';
import { DevToolsStorageService } from './dev-tools-storage.service';
import * as mocks from './dev-tools-storage.service.mocks';

describe('DevToolsStorageService', () => {
  let service: DevToolsStorageService;

  beforeEach(async () => {
    await MockBuilder(DevToolsStorageService);
    service = TestBed.inject(DevToolsStorageService);

    service.clear();
  });

  describe('set', () => {
    it('should set a value in storage', () => {
      const spy = spyOn(service, 'set');
      service.set(mocks.data.key, mocks.data.value);
      expect(spy).toHaveBeenCalledWith(mocks.data.key, mocks.data.value);
    });
  });

  describe('get', () => {
    it('should get a value from storage', () => {
      spyOn(service, 'getStorage').and.returnValue({
        [mocks.data.key]: mocks.data.value,
      });
      const result = service.get(mocks.data.key);
      expect(result).toBe(mocks.data.value);
    });
  });

  describe('remove', () => {
    it('should remove a value from storage', () => {
      const spy = spyOn(service, 'saveStorage');
      spyOn(service, 'getStorage').and.returnValue({
        [mocks.data.key]: mocks.data.value,
      });
      service.remove(mocks.data.key);
      expect(spy).toHaveBeenCalledWith({});
    });
  });

  describe('clear', () => {
    it('should clear the storage', () => {
      const spy = spyOn(localStorage, 'removeItem');
      service.clear();
      expect(spy).toHaveBeenCalledWith(service['storageKey']);
    });
  });
});
