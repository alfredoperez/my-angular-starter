import { TestBed } from '@angular/core/testing';
import { MockBuilder } from 'ng-mocks';
import { featureFlagMocks as mocks } from './feature-flags.mocks';
import { FeatureFlagsService } from './feature-flags.service';

describe('FeatureFlagsService', () => {
  let service: FeatureFlagsService;

  beforeEach(() => MockBuilder(FeatureFlagsService));
  beforeEach(() => (service = TestBed.inject(FeatureFlagsService)));

  describe('getAll', () => {
    it('should return all feature flags', () => {
      expect(service.getAll()).toEqual(mocks.data.featureFlags);
    });
  });

  describe('isEnabled', () => {
    it('should return true if feature flag is enabled', () => {
      spyOn(service, 'isEnabled').and.returnValue(true);
      expect(service.isEnabled('devtools')).toBeTrue();
      expect(service.isEnabled).toHaveBeenCalledWith('devtools');
    });

    it('should return false if feature flag is disabled', () => {
      spyOn(service, 'isEnabled').and.returnValue(false);
      expect(service.isEnabled('feature2')).toBeFalse();
      expect(service.isEnabled).toHaveBeenCalledWith('feature2');
    });
  });
});
