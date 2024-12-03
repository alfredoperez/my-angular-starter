import { Injectable, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';

interface DevToolbarState {
  isHidden: boolean;
  activeToolId: string | null;
  error: string | null;
  theme: 'light' | 'dark';
}

@Injectable({
  providedIn: 'root',
})
export class DevToolbarStateService {
  // Initial state
  private state = signal<DevToolbarState>({
    isHidden: true,
    activeToolId: null,
    error: null,
    theme: 'dark',
  });

  // Selectors
  readonly isVisible = computed(() => !this.state().isHidden);
  readonly activeToolId = computed(() => this.state().activeToolId);
  readonly hasActiveTool = computed(() => this.state().activeToolId !== null);
  readonly error = computed(() => this.state().error);
  readonly theme = computed(() => this.state().theme);
  // Action stream
  private toolActionSubject = new Subject<{ toolId: string | null }>();

  constructor() {
    // Handle tool activation/deactivation
    this.toolActionSubject
      .pipe(takeUntilDestroyed())
      .subscribe(({ toolId }) => {
        this.setActiveTool(toolId);
        this.setVisibility(!!toolId);
      });
  }

  // State updates
  public setVisibility(isVisible: boolean): void {
    this.state.update((state) => ({
      ...state,
      isHidden: !isVisible,
    }));
  }

  public setTheme(theme: 'light' | 'dark'): void {
    this.state.update((state) => ({
      ...state,
      theme,
    }));
  }

  public setActiveTool(toolId: string | null): void {
    this.state.update((state) => ({
      ...state,
      activeToolId: toolId,
    }));
  }

  private setError(error: string): void {
    this.state.update((state) => ({
      ...state,
      error,
    }));
  }

  // Public actions
  toggleTool(toolId: string | null): void {
    const currentToolId = this.activeToolId();
    this.toolActionSubject.next({
      toolId: currentToolId === toolId ? null : toolId,
    });
  }

  toggleVisibility(): void {
    this.state.update((state) => ({
      ...state,
      isHidden: !state.isHidden,
    }));
  }
}
