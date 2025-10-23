# Async Testing Patterns

## Purpose
Test asynchronous operations including API calls, timers, delays, and dynamic content using findBy queries and waitFor.

## Critical Rules

- ALWAYS use `findBy*` queries for content that appears asynchronously
- ALWAYS use `waitFor` when waiting for assertions to pass
- ALWAYS use `jest.useFakeTimers()` for testing timers/delays
- NEVER use `setTimeout` in tests - use `waitFor` or fake timers

## Finding Async Content

<pattern context="findby-queries">
import { Component, inject, signal } from '@angular/core';

@Component({
  selector: 'app-user-profile',
  template: `
    <button (click)="loadProfile()">Load Profile</button>
    @if (loading()) {
      <p>Loading...</p>
    }
    @if (profile()) {
      <h1>{{ profile()?.name }}</h1>
      <p>{{ profile()?.email }}</p>
    }
  `
})
export class UserProfileComponent {
  private userService = inject(UserService);

  loading = signal(false);
  profile = signal<User | null>(null);

  loadProfile() {
    this.loading.set(true);
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.profile.set(user);
        this.loading.set(false);
      }
    });
  }
}

// Test
describe('UserProfileComponent', () => {
  async function setup() {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };

    const mockUserService = {
      getProfile: jest.fn().mockReturnValue(of(mockUser))
    };

    await render(UserProfileComponent, {
      componentProviders: [
        { provide: UserService, useValue: mockUserService }
      ]
    });

    return { mockUserService, mockUser };
  }

  test('should load and display profile', async () => {
    const { mockUser } = await setup();

    await userEvent.click(screen.getByRole('button', { name: /load profile/i }));

    // findByText waits up to 1000ms for element to appear
    const heading = await screen.findByRole('heading', { name: mockUser.name });
    expect(heading).toBeInTheDocument();

    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
  });

  test('should show loading state', async () => {
    await setup();

    await userEvent.click(screen.getByRole('button', { name: /load profile/i }));

    // With synchronous observable, loading is brief
    // For real async, you'd see this:
    // expect(screen.getByText(/loading/i)).toBeInTheDocument();

    // Wait for profile to load
    await screen.findByRole('heading', { name: /john doe/i });

    // Loading should be gone
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});
</pattern>

## Custom Timeout

<pattern context="custom-timeout">
test('should wait longer for slow operations', async () => {
  await setup({ slowResponse: true });

  await userEvent.click(screen.getByRole('button', { name: /load/i }));

  // Default timeout is 1000ms, increase for slow operations
  const result = await screen.findByText(
    /data loaded/i,
    {},
    { timeout: 5000 } // Wait up to 5 seconds
  );

  expect(result).toBeInTheDocument();
});
</pattern>

## Using waitFor

<pattern context="waitfor-pattern">
import { waitFor } from '@testing-library/angular';

test('should wait for multiple conditions', async () => {
  await setup();

  await userEvent.click(screen.getByRole('button', { name: /load/i }));

  // Wait for multiple conditions to be true
  await waitFor(() => {
    expect(screen.getByText(/loaded/i)).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });
});

test('should wait with custom interval and timeout', async () => {
  await setup();

  await userEvent.click(screen.getByRole('button', { name: /process/i }));

  await waitFor(
    () => {
      expect(screen.getByText(/complete/i)).toBeInTheDocument();
    },
    {
      timeout: 3000,    // Max wait time
      interval: 100     // Check every 100ms
    }
  );
});
</pattern>

## Delayed Responses

<pattern context="delayed-response">
test('should handle delayed API response', async () => {
  const mockService = {
    getData: jest.fn().mockReturnValue(
      of([{ id: 1, name: 'Item' }]).pipe(
        delay(500) // Simulate 500ms network delay
      )
    )
  };

  await render(DataComponent, {
    componentProviders: [
      { provide: DataService, useValue: mockService }
    ]
  });

  await userEvent.click(screen.getByRole('button', { name: /load/i }));

  // Loading appears immediately
  expect(screen.getByText(/loading/i)).toBeInTheDocument();

  // Wait for data to appear
  const item = await screen.findByText('Item', {}, { timeout: 1000 });
  expect(item).toBeInTheDocument();

  // Loading should be gone
  expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
});
</pattern>

## Fake Timers

<pattern context="fake-timers">
describe('TimerComponent', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should show message after 3 seconds', async () => {
    await render(TimerComponent);

    await userEvent.click(screen.getByRole('button', { name: /start timer/i }));

    // Message not shown yet
    expect(screen.queryByText(/time's up/i)).not.toBeInTheDocument();

    // Advance timers by 3 seconds
    jest.advanceTimersByTime(3000);

    // Message should now appear
    expect(await screen.findByText(/time's up/i)).toBeInTheDocument();
  });

  test('should update countdown every second', async () => {
    await render(CountdownComponent, {
      componentInputs: { startFrom: 5 }
    });

    await userEvent.click(screen.getByRole('button', { name: /start/i }));

    expect(screen.getByText(/5/i)).toBeInTheDocument();

    jest.advanceTimersByTime(1000);
    expect(await screen.findByText(/4/i)).toBeInTheDocument();

    jest.advanceTimersByTime(1000);
    expect(await screen.findByText(/3/i)).toBeInTheDocument();

    // Fast forward to end
    jest.advanceTimersByTime(3000);
    expect(await screen.findByText(/0/i)).toBeInTheDocument();
  });

  test('should debounce search input', async () => {
    const mockSearch = jest.fn().mockReturnValue(of([]));

    await render(SearchComponent, {
      componentProviders: [
        MockProvider(SearchService, { search: mockSearch })
      ]
    });

    const searchInput = screen.getByLabelText(/search/i);

    // Type quickly
    await userEvent.type(searchInput, 'test');

    // Search not called yet (debounced)
    expect(mockSearch).not.toHaveBeenCalled();

    // Advance past debounce time (300ms)
    jest.advanceTimersByTime(300);

    // Now search should be called once
    await waitFor(() => {
      expect(mockSearch).toHaveBeenCalledTimes(1);
      expect(mockSearch).toHaveBeenCalledWith('test');
    });
  });
});
</pattern>

## Polling / Intervals

<pattern context="polling-intervals">
describe('PollingComponent', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should poll for updates every 5 seconds', async () => {
    const mockService = {
      getStatus: jest.fn()
        .mockReturnValueOnce(of({ status: 'pending' }))
        .mockReturnValueOnce(of({ status: 'processing' }))
        .mockReturnValueOnce(of({ status: 'complete' }))
    };

    await render(StatusPollerComponent, {
      componentProviders: [
        { provide: StatusService, useValue: mockService }
      ]
    });

    await userEvent.click(screen.getByRole('button', { name: /start polling/i }));

    // First call immediate
    expect(await screen.findByText(/pending/i)).toBeInTheDocument();

    // Second call after 5 seconds
    jest.advanceTimersByTime(5000);
    expect(await screen.findByText(/processing/i)).toBeInTheDocument();

    // Third call after another 5 seconds
    jest.advanceTimersByTime(5000);
    expect(await screen.findByText(/complete/i)).toBeInTheDocument();

    expect(mockService.getStatus).toHaveBeenCalledTimes(3);
  });
});
</pattern>

## Animation Testing

<pattern context="animation-testing">
describe('AnimatedComponent', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('should show element after fade-in animation', async () => {
    await render(AnimatedComponent);

    await userEvent.click(screen.getByRole('button', { name: /show/i }));

    // Element appears immediately but may be transparent
    const element = screen.getByTestId('animated-content');
    expect(element).toBeInTheDocument();

    // Advance past animation duration (e.g., 300ms)
    jest.advanceTimersByTime(300);

    // Animation complete
    await waitFor(() => {
      expect(element).toHaveStyle({ opacity: '1' });
    });
  });
});
</pattern>

## Retry Logic

<pattern context="retry-logic">
test('should retry failed request', async () => {
  const mockService = {
    getData: jest.fn()
      .mockReturnValueOnce(throwError(() => new Error('Failed')))
      .mockReturnValueOnce(throwError(() => new Error('Failed')))
      .mockReturnValueOnce(of([{ id: 1, name: 'Success' }]))
  };

  await render(RetryComponent, {
    componentProviders: [
      { provide: DataService, useValue: mockService }
    ]
  });

  await userEvent.click(screen.getByRole('button', { name: /load/i }));

  // First attempt fails
  expect(await screen.findByText(/failed/i)).toBeInTheDocument();

  // Auto-retry after delay (if implemented)
  // Or manual retry
  await userEvent.click(screen.getByRole('button', { name: /retry/i }));

  // Eventually succeeds
  expect(await screen.findByText('Success')).toBeInTheDocument();
  expect(mockService.getData).toHaveBeenCalledTimes(2);
});
</pattern>

## Concurrent Requests

<pattern context="concurrent-requests">
test('should handle multiple concurrent requests', async () => {
  const mockService = {
    getUsers: jest.fn().mockReturnValue(of([{ id: 1, name: 'User' }])),
    getPosts: jest.fn().mockReturnValue(of([{ id: 1, title: 'Post' }])),
    getComments: jest.fn().mockReturnValue(of([{ id: 1, text: 'Comment' }]))
  };

  await render(DashboardComponent, {
    componentProviders: [
      { provide: DataService, useValue: mockService }
    ]
  });

  await userEvent.click(screen.getByRole('button', { name: /load all/i }));

  // All requests fire concurrently
  expect(mockService.getUsers).toHaveBeenCalled();
  expect(mockService.getPosts).toHaveBeenCalled();
  expect(mockService.getComments).toHaveBeenCalled();

  // Wait for all to complete
  await waitFor(() => {
    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Post')).toBeInTheDocument();
    expect(screen.getByText('Comment')).toBeInTheDocument();
  });
});
</pattern>

## Error Recovery

<pattern context="error-recovery">
test('should recover from error and continue', async () => {
  let callCount = 0;
  const mockService = {
    getData: jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return throwError(() => new Error('Temporary error'));
      }
      return of([{ id: 1, name: 'Data' }]);
    })
  };

  await render(ResilientComponent, {
    componentProviders: [
      { provide: DataService, useValue: mockService }
    ]
  });

  // First attempt
  await userEvent.click(screen.getByRole('button', { name: /load/i }));
  expect(await screen.findByRole('alert')).toHaveTextContent(/error/i);

  // Retry
  await userEvent.click(screen.getByRole('button', { name: /retry/i }));

  // Success
  expect(await screen.findByText('Data')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
</pattern>

## Anti-patterns

<avoid>
// ❌ Using setTimeout in tests
await userEvent.click(button);
setTimeout(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
}, 1000);
// ✅ Instead: Use findBy or waitFor
await screen.findByText('Loaded');

// ❌ Using getBy for async content
await userEvent.click(button);
expect(screen.getByText('Loading...')).toBeInTheDocument(); // May fail
// ✅ Instead: Use findBy
expect(await screen.findByText('Loading...')).toBeInTheDocument();

// ❌ Not cleaning up fake timers
jest.useFakeTimers(); // In test
// No cleanup - affects other tests
// ✅ Instead: Clean up in afterEach
afterEach(() => { jest.useRealTimers(); });

// ❌ Arbitrary waits
await new Promise(resolve => setTimeout(resolve, 1000));
// ✅ Instead: Wait for specific condition
await waitFor(() => expect(screen.getByText('Done')).toBeInTheDocument());
</avoid>

## Best Practices

<example>
// ✅ Use findBy for async content
const element = await screen.findByText('Loaded');

// ✅ Use waitFor for complex conditions
await waitFor(() => {
  expect(screen.getByText('Complete')).toBeInTheDocument();
  expect(screen.getAllByRole('listitem')).toHaveLength(5);
});

// ✅ Set up and tear down fake timers properly
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

// ✅ Test loading states
expect(screen.getByText(/loading/i)).toBeInTheDocument();
await screen.findByText('Loaded');
expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();

// ✅ Use custom timeouts for slow operations
await screen.findByText('Data', {}, { timeout: 5000 });
</example>
