# SIFERS Methodology for Testing

## Purpose
Structure tests with a single setup function that explicitly returns state, reducing clutter and flakiness while making state expectations clear.

## What is SIFERS?

**SIFERS** = **Simple Injectable Functions Explicitly Returning State**

Core principle: Replace scattered `beforeEach`/`afterEach` blocks with a single `setup()` function per test file that returns all the state and utilities needed for testing.

## Benefits

- **Clear state expectations**: Each test explicitly shows what state it needs
- **Reduced clutter**: No more scattered setup code across multiple hooks
- **Fewer flaky tests**: Each test gets fresh state, no shared mutation
- **Better IDE support**: Returned state provides autocomplete and type safety
- **Easier debugging**: State creation is explicit and traceable

## Core Pattern

<pattern context="sifers-setup">
interface SetupOptions {
  initialCount?: number;
  userName?: string;
  // Add any optional configuration
}

async function setup(options: SetupOptions = {}) {
  const { initialCount = 0, userName = 'John Doe' } = options;

  // Create mocks
  const mockService = { /* ... */ };

  // Render component
  await render(MyComponent, {
    componentInputs: { count: initialCount },
    componentProviders: [
      { provide: MyService, useValue: mockService }
    ]
  });

  // Return everything tests need
  return {
    mockService,
    initialCount,
    userName,
    // Query helpers (optional)
    getSubmitButton: () => screen.getByRole('button', { name: /submit/i }),
    getCountDisplay: () => screen.getByText(/count:/i)
  };
}

// Use in tests
test('should increment count', async () => {
  const { getCountDisplay, getSubmitButton } = await setup({ initialCount: 5 });

  expect(getCountDisplay()).toHaveTextContent('5');
  await userEvent.click(getSubmitButton());
  expect(getCountDisplay()).toHaveTextContent('6');
});
</pattern>

## Comparison: Before vs After

<example>
// ❌ Before - Traditional approach with beforeEach
describe('CounterComponent', () => {
  let fixture: ComponentFixture<CounterComponent>;
  let component: CounterComponent;
  let mockService: jest.Mocked<CounterService>;

  beforeEach(async () => {
    mockService = createMock<CounterService>();
    await TestBed.configureTestingModule({
      declarations: [CounterComponent],
      providers: [{ provide: CounterService, useValue: mockService }]
    }).compileComponents();

    fixture = TestBed.createComponent(CounterComponent);
    component = fixture.componentInstance;
  });

  test('should increment', () => {
    component.count = 5;
    component.increment();
    expect(component.count).toBe(6);
  });
});

// ✅ After - SIFERS approach
describe('CounterComponent', () => {
  async function setup(options: { initialCount?: number } = {}) {
    const mockService = createMock<CounterService>();

    await render(CounterComponent, {
      componentInputs: { count: options.initialCount ?? 0 },
      componentProviders: [
        { provide: CounterService, useValue: mockService }
      ]
    });

    return {
      mockService,
      getCount: () => screen.getByText(/count:/i),
      getIncrementBtn: () => screen.getByRole('button', { name: /increment/i })
    };
  }

  test('should increment count', async () => {
    const { getCount, getIncrementBtn } = await setup({ initialCount: 5 });

    expect(getCount()).toHaveTextContent('5');
    await userEvent.click(getIncrementBtn());
    expect(getCount()).toHaveTextContent('6');
  });
});
</example>

## Advanced Pattern: Query Helpers

<pattern context="query-helpers">
// Return query helpers for better maintainability
async function setup() {
  await render(UserFormComponent);

  return {
    // Selectors encapsulated in functions
    form: {
      getNameInput: () => screen.getByLabelText(/name/i),
      getEmailInput: () => screen.getByLabelText(/email/i),
      getSubmitBtn: () => screen.getByRole('button', { name: /submit/i })
    },
    messages: {
      getSuccess: () => screen.queryByText(/success/i),
      getError: () => screen.queryByText(/error/i)
    }
  };
}

test('should show success message', async () => {
  const { form, messages } = await setup();

  await userEvent.type(form.getNameInput(), 'John');
  await userEvent.type(form.getEmailInput(), 'john@example.com');
  await userEvent.click(form.getSubmitBtn());

  expect(await messages.getSuccess()).toBeInTheDocument();
});
</pattern>

## Options Pattern

<pattern context="setup-options">
// Flexible setup with options for different scenarios
interface SetupOptions {
  userRole?: 'admin' | 'user';
  hasData?: boolean;
  isLoading?: boolean;
}

async function setup(options: SetupOptions = {}) {
  const {
    userRole = 'user',
    hasData = true,
    isLoading = false
  } = options;

  const mockAuthService = {
    currentUser: signal({ role: userRole })
  };

  const mockDataService = {
    data: signal(hasData ? [{ id: 1 }] : []),
    isLoading: signal(isLoading)
  };

  await render(DashboardComponent, {
    componentProviders: [
      { provide: AuthService, useValue: mockAuthService },
      { provide: DataService, useValue: mockDataService }
    ]
  });

  return {
    mockAuthService,
    mockDataService
  };
}

// Tests specify exactly what state they need
test('admin sees admin panel', async () => {
  await setup({ userRole: 'admin' });
  expect(screen.getByText(/admin panel/i)).toBeInTheDocument();
});

test('shows loading state', async () => {
  await setup({ isLoading: true });
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
});
</pattern>

## Integration with ng-mocks

<pattern context="with-ng-mocks">
import { MockBuilder } from 'ng-mocks';

async function setup() {
  // Build dependencies once in setup
  const dependencies = MockBuilder(MyComponent, MyModule)
    .mock(MyService, { getData: jest.fn() })
    .build();

  await render(MyComponent, dependencies);

  return {
    // Return mocked services for assertions
    mockService: dependencies.get(MyService)
  };
}

test('should call service', async () => {
  const { mockService } = await setup();

  await userEvent.click(screen.getByRole('button', { name: /load/i }));

  expect(mockService.getData).toHaveBeenCalled();
});
</pattern>

## Anti-patterns

<avoid>
// ❌ Shared mutable state between tests
let mockService: MockService; // Shared across tests

beforeEach(() => {
  mockService.reset();
});

// ❌ Multiple beforeEach blocks
beforeEach(() => { /* setup 1 */ });
beforeEach(() => { /* setup 2 */ });
beforeEach(() => { /* setup 3 */ });

// ❌ Complex afterEach cleanup
afterEach(() => {
  cleanupMocks();
  resetState();
  clearTimers();
});

// ✅ Instead: Use setup() function
async function setup() {
  const mockService = createFreshMock(); // New instance per test
  await render(Component, {
    componentProviders: [{ provide: Service, useValue: mockService }]
  });
  return { mockService };
}
</avoid>

## When to Deviate

SIFERS isn't always necessary:

<example>
// Simple tests without setup complexity
test('should render title', async () => {
  await render(SimpleComponent, {
    componentInputs: { title: 'Hello' }
  });

  expect(screen.getByText('Hello')).toBeInTheDocument();
});

// Only use setup() when:
// - Multiple tests need similar setup
// - Setup is complex (mocks, providers, configuration)
// - Tests need different variations of setup
</example>

## Complete Example

See `examples/sifers-complete.md` for a full working example combining SIFERS + Angular Testing Library + ng-mocks.
