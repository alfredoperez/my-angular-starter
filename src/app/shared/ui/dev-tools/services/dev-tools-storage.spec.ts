import { TestBed } from '@angular/core/testing';
import { MockBuilder } from 'ng-mocks';
import { DevToolsStorageService } from '@my/shared/ui';

describe('DevToolsStorageService', () => {
  let service: DevToolsStorageService;

  beforeAll(() => MockBuilder(DevToolsStorageService));
  beforeEach(() => {
    service = TestBed.inject(DevToolsStorageService);
    service.clear();
  });
  afterEach(() => {
    localStorage.clear();
  });
  describe('set', () => {
    it('should set value correctly', () => {
      const data = { key3: 'value3' };
      service.set('key3', 'value3');
      expect(JSON.parse(localStorage.getItem('dev-tools') as string)).toEqual(
        data,
      );
    });
  });

  describe('get', () => {
    it('should get value correctly', () => {
      // Before setting the value
      const value = service.get('key1');
      expect(value).toBeUndefined();

      // After setting the value
      service.set('key1', 'value1');
      const newValue = service.get('key1');
      expect(newValue).toEqual('value1');
    });
  });

  describe('remove', () => {
    it('should remove key-value pair correctly', () => {
      // Before removing
      service.set('key1', 'value1');
      expect(service.get('key1')).toEqual('value1');

      // After removing
      service.remove('key1');
      const value = service.get('key1');
      expect(value).toBeUndefined();
    });
  });

  describe('clear', () => {
    it('should clear all data', () => {
      service.set('key1', 'value1');
      service.clear();
      expect(localStorage.getItem('dev-tools')).toBeNull();
    });
  });
});
