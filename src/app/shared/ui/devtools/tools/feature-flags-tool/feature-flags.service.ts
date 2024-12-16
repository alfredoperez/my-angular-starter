import { Injectable, Signal, computed, signal } from '@angular/core';
import { DevToolsStorageService } from '../../utils/storage.service';
import { FeatureFlag } from './feature-flags.models';

@Injectable({ providedIn: 'root' })
export class DevToolbarFeatureFlagsService {
  private readonly STORAGE_KEY = 'feature-flags';

  public appFlags = signal<FeatureFlag[]>([]);
  public forcedFlags = signal<Record<string, boolean>>({});

  public flags: Signal<FeatureFlag[]> = computed(() => {
    const currentFlags = this.appFlags();
    const forcedFlags = this.forcedFlags();

    return currentFlags.map((flag) => ({
      ...flag,
      isForced: flag.id in forcedFlags,
      isEnabled: flag.id in forcedFlags ? forcedFlags[flag.id] : flag.isEnabled,
    }));
  });

  constructor(private storageService: DevToolsStorageService) {
    this.loadForcedFlags();
  }

  public set(flags: FeatureFlag[]): void {
    this.appFlags.set(flags);
  }

  public getAppFlags(): Signal<FeatureFlag[]> {
    return this.appFlags;
  }

  public setFlag(flagId: string, isEnabled: boolean): void {
    const currentForced = this.forcedFlags();
    const updatedFlags = {
      ...currentForced,
      [flagId]: isEnabled,
    };

    this.forcedFlags.set(updatedFlags);
    this.storageService.set(this.STORAGE_KEY, updatedFlags);
  }

  public removeFlag(flagId: string): void {
    const currentForced = this.forcedFlags();
    const updatedFlags = {
      ...currentForced,
      [flagId]: false,
    };
    this.forcedFlags.set(updatedFlags);
    this.storageService.set(this.STORAGE_KEY, updatedFlags);
  }

  private loadForcedFlags(): void {
    const savedFlags = this.storageService.get<Record<string, boolean>>(
      this.STORAGE_KEY,
    );
    if (savedFlags) {
      this.forcedFlags.set(savedFlags);
    }
  }
}
