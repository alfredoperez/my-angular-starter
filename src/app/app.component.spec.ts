import { render, screen } from '@testing-library/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';
import { FeatureFlagsService } from './shared/data/feature-flags/feature-flags.service';
import { DevToolbarComponent } from 'ngx-dev-toolbar';
import { PageContainerComponent } from './shared/ui';
import { TopBarComponent } from './shared/ui/layout/top-bar.component';

describe('AppComponent', () => {
  const defaultRenderOptions = {
    imports: [
      DevToolbarComponent,
      PageContainerComponent,
      TopBarComponent
    ],
    providers: [
      provideAnimations(),
      provideRouter([]),
      {
        provide: FeatureFlagsService,
        useValue: {
          initializeFlags: jest.fn()
        }
      }
    ]
  };

  it('should create the app and render components', async () => {
    await render(AppComponent, defaultRenderOptions);

    // Check if the main container exists
    const mainContainer = document.querySelector('.min-h-screen.bg-gray-50');
    expect(mainContainer).toBeInTheDocument();
  });

  it('should initialize feature flags on init', async () => {
    const mockInitializeFlags = jest.fn();

    const { fixture } = await render(AppComponent, {
      ...defaultRenderOptions,
      providers: [
        ...defaultRenderOptions.providers.slice(0, 2),
        {
          provide: FeatureFlagsService,
          useValue: {
            initializeFlags: mockInitializeFlags
          }
        }
      ]
    });

    fixture.detectChanges();
    expect(mockInitializeFlags).toHaveBeenCalled();
  });
});
