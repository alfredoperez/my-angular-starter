# ng-mocks Integration with Angular Testing Library

## Purpose
Use ng-mocks utilities to simplify mocking Angular dependencies while testing with Angular Testing Library.

## Critical Rules

- ALWAYS use `MockBuilder` or `ngMocks.guts` to prepare dependencies before passing to `render()`
- ALWAYS use `MockProvider` for service mocking instead of manual mock objects
- NEVER use `TestBed` directly - let Angular Testing Library handle it
- ALWAYS pass ng-mocks dependencies as the second argument to `render()`

## MockBuilder Pattern

<pattern context="basic-mockbuilder">
import { render, screen } from '@testing-library/angular';
import { MockBuilder } from 'ng-mocks';

test('should render with mocked dependencies', async () => {
  // Build dependencies
  const dependencies = MockBuilder(MyComponent, MyModule).build();

  // Pass to render
  await render(MyComponent, dependencies);

  expect(screen.getByText(/hello/i)).toBeInTheDocument();
});
</pattern>

<pattern context="mockbuilder-with-mocks">
import { MockBuilder, MockInstance } from 'ng-mocks';

test('should mock specific services', async () => {
  // Configure mocks during build
  const dependencies = MockBuilder(MyComponent, MyModule)
    .mock(DataService, {
      getData: () => of([{ id: 1, name: 'Test' }])
    })
    .keep(AuthService) // Keep real implementation
    .build();

  await render(MyComponent, dependencies);

  expect(await screen.findByText('Test')).toBeInTheDocument();
});
</pattern>

## ngMocks.guts Pattern

Simpler alternative to MockBuilder for straightforward mocking:

<pattern context="ng-mocks-guts">
import { ngMocks } from 'ng-mocks';

test('should render with guts', async () => {
  // Automatically mocks everything except the target
  const dependencies = ngMocks.guts(MyComponent, MyModule);

  await render(MyComponent, dependencies);

  expect(screen.getByText(/hello/i)).toBeInTheDocument();
});
</pattern>

**When to use ngMocks.guts**:
- Simple mocking needs (mock everything except target)
- Quick tests without complex dependencies
- Standalone components with few dependencies

**When to use MockBuilder**:
- Need fine-grained control (keep/mock specific services)
- Complex dependency configuration
- Need to configure mock behavior

## MockProvider for Services

<pattern context="mock-provider">
import { MockProvider } from 'ng-mocks';

test('should use mock provider', async () => {
  const mockGetData = jest.fn().mockReturnValue(of([{ id: 1 }]));

  await render(MyComponent, {
    componentProviders: [
      MockProvider(DataService, {
        getData: mockGetData
      })
    ]
  });

  await userEvent.click(screen.getByRole('button', { name: /load/i }));

  expect(mockGetData).toHaveBeenCalled();
  expect(await screen.findByText(/data loaded/i)).toBeInTheDocument();
});
</pattern>

## Complete Integration Example

<pattern context="complete-integration">
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { MockBuilder, MockProvider, ngMocks } from 'ng-mocks';
import { signal } from '@angular/core';
import { of } from 'rxjs';

interface SetupOptions {
  initialData?: Array<{ id: number; name: string }>;
}

async function setup(options: SetupOptions = {}) {
  const { initialData = [] } = options;

  // Create mock service with jest functions
  const mockDataService = {
    data: signal(initialData),
    loadData: jest.fn().mockReturnValue(of(initialData)),
    deleteItem: jest.fn().mockReturnValue(of(true))
  };

  // Build dependencies with MockBuilder
  const dependencies = MockBuilder(UserListComponent, UserModule)
    .mock(DataService, mockDataService)
    .build();

  // Render with dependencies
  await render(UserListComponent, dependencies);

  return {
    mockDataService,
    // Query helpers
    getLoadButton: () => screen.getByRole('button', { name: /load/i }),
    getDeleteButton: (id: number) =>
      screen.getByRole('button', { name: new RegExp(`delete.*${id}`, 'i') }),
    getUserItems: () => screen.queryAllByRole('listitem')
  };
}

describe('UserListComponent', () => {
  test('should load data when button clicked', async () => {
    const { mockDataService, getLoadButton } = await setup({
      initialData: [{ id: 1, name: 'John' }]
    });

    await userEvent.click(getLoadButton());

    expect(mockDataService.loadData).toHaveBeenCalled();
    expect(await screen.findByText('John')).toBeInTheDocument();
  });

  test('should delete item', async () => {
    const { mockDataService, getDeleteButton } = await setup({
      initialData: [{ id: 1, name: 'John' }]
    });

    await userEvent.click(getDeleteButton(1));

    expect(mockDataService.deleteItem).toHaveBeenCalledWith(1);
  });
});
</pattern>

## Mocking Child Components

<pattern context="mock-components">
import { MockComponent } from 'ng-mocks';

test('should render with mocked children', async () => {
  await render(ParentComponent, {
    declarations: [
      MockComponent(ChildComponent),
      MockComponent(AnotherChildComponent)
    ]
  });

  // Child components are shallow mocked
  expect(screen.getByText(/parent content/i)).toBeInTheDocument();
});
</pattern>

## Accessing Mocked Services

<pattern context="access-mocks">
import { ngMocks } from 'ng-mocks';

test('should access and spy on mocked service', async () => {
  const dependencies = MockBuilder(MyComponent, MyModule)
    .mock(DataService)
    .build();

  await render(MyComponent, dependencies);

  // Access the mocked service instance
  const mockService = ngMocks.get(DataService);
  jest.spyOn(mockService, 'getData').mockReturnValue(of([]));

  await userEvent.click(screen.getByRole('button', { name: /refresh/i }));

  expect(mockService.getData).toHaveBeenCalled();
});
</pattern>

## Signal Mocking

<pattern context="mock-signals">
import { signal } from '@angular/core';

test('should mock service with signals', async () => {
  const mockUserService = {
    currentUser: signal({ name: 'John', role: 'admin' }),
    isAuthenticated: signal(true),
    login: jest.fn(),
    logout: jest.fn()
  };

  await render(HeaderComponent, {
    componentProviders: [
      { provide: UserService, useValue: mockUserService }
    ]
  });

  expect(screen.getByText(/welcome, john/i)).toBeInTheDocument();

  // Update signal during test
  mockUserService.currentUser.set({ name: 'Jane', role: 'user' });
  expect(await screen.findByText(/welcome, jane/i)).toBeInTheDocument();
});
</pattern>

## Standalone Components

<pattern context="standalone-mocking">
test('should mock standalone component imports', async () => {
  const dependencies = MockBuilder(StandaloneComponent)
    .mock(DataService)
    .mock(CommonModule) // Mock module imports
    .keep(FormsModule)  // Keep real forms module
    .build();

  await render(StandaloneComponent, dependencies);

  expect(screen.getByRole('button')).toBeInTheDocument();
});
</pattern>

## MockInstance for Global Setup

<pattern context="mock-instance">
import { MockInstance } from 'ng-mocks';

describe('UserComponent', () => {
  // Set up mock behavior for all tests
  beforeAll(() => {
    MockInstance(DataService, () => ({
      getData: jest.fn().mockReturnValue(of([]))
    }));
  });

  // Reset after all tests
  afterAll(() => {
    MockInstance.restore();
  });

  test('first test', async () => {
    const dependencies = MockBuilder(UserComponent, UserModule).build();
    await render(UserComponent, dependencies);
    // DataService is automatically mocked
  });

  test('second test', async () => {
    const dependencies = MockBuilder(UserComponent, UserModule).build();
    await render(UserComponent, dependencies);
    // Same mock behavior applies
  });
});
</pattern>

## Anti-patterns

<avoid>
// ❌ Using TestBed directly
const fixture = TestBed.createComponent(MyComponent);
// Instead: await render(MyComponent, dependencies);

// ❌ Not passing dependencies to render
const dependencies = MockBuilder(MyComponent, MyModule).build();
await render(MyComponent); // Missing dependencies!
// Instead: await render(MyComponent, dependencies);

// ❌ Manual service mocking without MockProvider
const mockService = { getData: () => {} }; // No type safety
// Instead: MockProvider(DataService, { getData: jest.fn() });

// ❌ Mixing TestBed and render
TestBed.configureTestingModule({ /* ... */ });
await render(MyComponent); // Don't mix approaches
</avoid>

## Best Practices

1. **Use MockBuilder for complex scenarios**: Fine-grained control over what to mock/keep
2. **Use ngMocks.guts for simple cases**: Quick mocking when you don't need control
3. **Use MockProvider with jest.fn()**: Better type safety and call tracking
4. **Mock at the right level**: Mock services, not HTTP calls (let services handle HTTP)
5. **Return mocked services from setup()**: Makes assertions easier

<example>
// ✅ Good pattern
async function setup() {
  const mockService = {
    getData: jest.fn().mockReturnValue(of([])),
    data: signal([])
  };

  const dependencies = MockBuilder(MyComponent, MyModule)
    .mock(DataService, mockService)
    .build();

  await render(MyComponent, dependencies);

  return { mockService }; // Return for assertions
}

test('should call service', async () => {
  const { mockService } = await setup();

  await userEvent.click(screen.getByRole('button', { name: /load/i }));

  expect(mockService.getData).toHaveBeenCalled();
});
</example>

## Reference

- **Complete example**: See `examples/test-example-complete.md` for full integration
- **Service mocking**: See `examples/test-example-services.md`
- **Standalone components**: See `examples/test-example-standalone.md`
