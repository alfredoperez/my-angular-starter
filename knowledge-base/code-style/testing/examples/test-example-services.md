# Service Testing Patterns

## Purpose
Test components that depend on services using MockProvider, mock implementations, and proper dependency injection.

## Critical Rules

- ALWAYS use `MockProvider` from ng-mocks for service mocking
- ALWAYS use `jest.fn()` for service methods to track calls
- NEVER mock HttpClient directly - mock the service that uses it
- ALWAYS verify service calls through user interactions, not by calling methods directly

## Basic Service Mocking

<pattern context="basic-service-mock">
import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }
}

@Component({
  selector: 'app-user-list',
  template: `
    <button (click)="loadUsers()">Load Users</button>
    @for (user of users(); track user.id) {
      <p>{{ user.name }}</p>
    }
  `
})
export class UserListComponent {
  private userService = inject(UserService);
  users = signal<User[]>([]);

  loadUsers() {
    this.userService.getUsers().subscribe(users => {
      this.users.set(users);
    });
  }
}

// Test
describe('UserListComponent', () => {
  async function setup() {
    const mockUsers = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ];

    const mockUserService = {
      getUsers: jest.fn().mockReturnValue(of(mockUsers))
    };

    await render(UserListComponent, {
      componentProviders: [
        { provide: UserService, useValue: mockUserService }
      ]
    });

    return { mockUserService, mockUsers };
  }

  test('should load users from service', async () => {
    const { mockUserService, mockUsers } = await setup();

    await userEvent.click(screen.getByRole('button', { name: /load users/i }));

    expect(mockUserService.getUsers).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(screen.getByText(mockUsers[0].name)).toBeInTheDocument();
      expect(screen.getByText(mockUsers[1].name)).toBeInTheDocument();
    });
  });
});
</pattern>

## Service with Signal State

<pattern context="service-with-signals">
@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>(null);
  isAuthenticated = computed(() => this.currentUser() !== null);

  login(credentials: LoginCredentials): Observable<User> {
    return this.http.post<User>('/api/login', credentials).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  logout() {
    this.currentUser.set(null);
  }
}

// Test
describe('Component with AuthService', () => {
  interface SetupOptions {
    initialUser?: User | null;
  }

  async function setup(options: SetupOptions = {}) {
    const { initialUser = null } = options;

    const mockAuthService = {
      currentUser: signal(initialUser),
      isAuthenticated: computed(() => mockAuthService.currentUser() !== null),
      login: jest.fn().mockReturnValue(of({ id: 1, name: 'John' })),
      logout: jest.fn()
    };

    await render(HeaderComponent, {
      componentProviders: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    return { mockAuthService };
  }

  test('should show login button when not authenticated', async () => {
    await setup({ initialUser: null });

    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument();
  });

  test('should show logout button when authenticated', async () => {
    await setup({ initialUser: { id: 1, name: 'John' } });

    expect(screen.queryByRole('button', { name: /login/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    expect(screen.getByText(/welcome, john/i)).toBeInTheDocument();
  });

  test('should call logout when button clicked', async () => {
    const { mockAuthService } = await setup({
      initialUser: { id: 1, name: 'John' }
    });

    await userEvent.click(screen.getByRole('button', { name: /logout/i }));

    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});
</pattern>

## Multiple Service Dependencies

<pattern context="multiple-services">
async function setup() {
  const mockUserService = {
    getUsers: jest.fn().mockReturnValue(of([])),
    deleteUser: jest.fn().mockReturnValue(of(true))
  };

  const mockNotificationService = {
    show: jest.fn(),
    showError: jest.fn()
  };

  const mockAuthService = {
    currentUser: signal({ id: 1, role: 'admin' }),
    hasPermission: jest.fn().mockReturnValue(true)
  };

  await render(UserManagementComponent, {
    componentProviders: [
      { provide: UserService, useValue: mockUserService },
      { provide: NotificationService, useValue: mockNotificationService },
      { provide: AuthService, useValue: mockAuthService }
    ]
  });

  return {
    mockUserService,
    mockNotificationService,
    mockAuthService
  };
}

test('should show notification after successful delete', async () => {
  const { mockUserService, mockNotificationService } = await setup();

  // Setup users first
  mockUserService.getUsers.mockReturnValue(of([{ id: 1, name: 'John' }]));

  await userEvent.click(screen.getByRole('button', { name: /load/i }));
  await userEvent.click(screen.getByRole('button', { name: /delete john/i }));

  expect(mockUserService.deleteUser).toHaveBeenCalledWith(1);
  expect(mockNotificationService.show).toHaveBeenCalledWith('User deleted successfully');
});
</pattern>

## Error Handling

<pattern context="service-error-handling">
interface SetupOptions {
  shouldError?: boolean;
  errorMessage?: string;
}

async function setup(options: SetupOptions = {}) {
  const { shouldError = false, errorMessage = 'Service error' } = options;

  const mockDataService = {
    getData: jest.fn().mockReturnValue(
      shouldError
        ? throwError(() => new Error(errorMessage))
        : of([{ id: 1, name: 'Item' }])
    )
  };

  await render(DataComponent, {
    componentProviders: [
      { provide: DataService, useValue: mockDataService }
    ]
  });

  return { mockDataService };
}

test('should display error message on service failure', async () => {
  await setup({ shouldError: true, errorMessage: 'Failed to fetch data' });

  await userEvent.click(screen.getByRole('button', { name: /load/i }));

  expect(await screen.findByRole('alert')).toHaveTextContent(/failed to fetch data/i);
});

test('should recover from error on retry', async () => {
  const { mockDataService } = await setup({ shouldError: true });

  await userEvent.click(screen.getByRole('button', { name: /load/i }));

  expect(await screen.findByRole('alert')).toBeInTheDocument();

  // Mock success for retry
  mockDataService.getData.mockReturnValue(of([{ id: 1, name: 'Item' }]));

  await userEvent.click(screen.getByRole('button', { name: /retry/i }));

  expect(await screen.findByText('Item')).toBeInTheDocument();
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});
</pattern>

## Service Method Verification

<pattern context="verify-service-calls">
test('should call service with correct parameters', async () => {
  const mockUserService = {
    updateUser: jest.fn().mockReturnValue(of({ id: 1, name: 'Updated' }))
  };

  await render(UserEditComponent, {
    componentInputs: { userId: 1 },
    componentProviders: [
      { provide: UserService, useValue: mockUserService }
    ]
  });

  await userEvent.type(screen.getByLabelText(/name/i), 'John Updated');
  await userEvent.click(screen.getByRole('button', { name: /save/i }));

  expect(mockUserService.updateUser).toHaveBeenCalledWith(1, {
    name: 'John Updated'
  });

  expect(mockUserService.updateUser).toHaveBeenCalledTimes(1);
});

test('should not call service when form is invalid', async () => {
  const mockUserService = {
    updateUser: jest.fn()
  };

  await render(UserEditComponent, {
    componentProviders: [
      { provide: UserService, useValue: mockUserService }
    ]
  });

  // Submit without filling required field
  await userEvent.click(screen.getByRole('button', { name: /save/i }));

  expect(mockUserService.updateUser).not.toHaveBeenCalled();
});
</pattern>

## Async Service Operations

<pattern context="async-service">
test('should show loading state during service call', async () => {
  let resolveData: (value: any) => void;
  const dataPromise = new Promise(resolve => {
    resolveData = resolve;
  });

  const mockService = {
    getData: jest.fn().mockReturnValue(from(dataPromise))
  };

  await render(DataComponent, {
    componentProviders: [
      { provide: DataService, useValue: mockService }
    ]
  });

  await userEvent.click(screen.getByRole('button', { name: /load/i }));

  // Check loading state
  expect(screen.getByText(/loading/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /load/i })).toBeDisabled();

  // Resolve data
  resolveData!([{ id: 1, name: 'Item' }]);

  // Check loaded state
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
  });

  expect(screen.getByText('Item')).toBeInTheDocument();
});
</pattern>

## Service with State Management

<pattern context="service-state-management">
@Injectable({ providedIn: 'root' })
export class CartService {
  private itemsSubject = new BehaviorSubject<CartItem[]>([]);
  items$ = this.itemsSubject.asObservable();

  items = signal<CartItem[]>([]);

  addItem(item: CartItem) {
    const current = this.items();
    this.items.set([...current, item]);
  }

  removeItem(id: number) {
    this.items.update(items => items.filter(i => i.id !== id));
  }

  clear() {
    this.items.set([]);
  }
}

// Test
describe('CartComponent', () => {
  async function setup() {
    const mockCart = {
      items: signal<CartItem[]>([]),
      addItem: jest.fn((item) => {
        mockCart.items.update(items => [...items, item]);
      }),
      removeItem: jest.fn((id) => {
        mockCart.items.update(items => items.filter(i => i.id !== id));
      }),
      clear: jest.fn(() => {
        mockCart.items.set([]);
      })
    };

    await render(CartComponent, {
      componentProviders: [
        { provide: CartService, useValue: mockCart }
      ]
    });

    return { mockCart };
  }

  test('should add item to cart', async () => {
    const { mockCart } = await setup();

    await userEvent.click(screen.getByRole('button', { name: /add to cart/i }));

    expect(mockCart.addItem).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1 })
    );

    expect(screen.getByText(/1 item in cart/i)).toBeInTheDocument();
  });

  test('should remove item from cart', async () => {
    const { mockCart } = await setup();

    // Add item first
    mockCart.items.set([{ id: 1, name: 'Item' }]);

    await userEvent.click(screen.getByRole('button', { name: /remove/i }));

    expect(mockCart.removeItem).toHaveBeenCalledWith(1);
    expect(screen.getByText(/0 items in cart/i)).toBeInTheDocument();
  });
});
</pattern>

## MockProvider Pattern

<pattern context="mock-provider-pattern">
import { MockProvider } from 'ng-mocks';

// Simpler alternative to manual mocking
await render(Component, {
  componentProviders: [
    MockProvider(UserService, {
      getUsers: jest.fn().mockReturnValue(of([])),
      deleteUser: jest.fn().mockReturnValue(of(true))
    }),
    MockProvider(NotificationService, {
      show: jest.fn()
    })
  ]
});

// Access mocked service
const userService = TestBed.inject(UserService);
expect(userService.getUsers).toHaveBeenCalled();
</pattern>

## Anti-patterns

<avoid>
// ❌ Mocking HttpClient directly
const mockHttp = { get: jest.fn() };
// ✅ Instead: Mock the service that uses HttpClient

// ❌ Not using jest.fn() for tracking
const mockService = {
  getData: () => of([]) // Can't verify calls
};
// ✅ Instead: Use jest.fn()
const mockService = {
  getData: jest.fn().mockReturnValue(of([]))
};

// ❌ Calling service methods directly in tests
component.loadUsers(); // Testing implementation
// ✅ Instead: Trigger via user interaction
await userEvent.click(screen.getByRole('button', { name: /load/i }));

// ❌ Not returning mocks from setup
async function setup() {
  const mockService = { /* ... */ };
  await render(Component);
  // Mock not accessible in tests!
}
// ✅ Instead: Return mocks
async function setup() {
  const mockService = { /* ... */ };
  await render(Component);
  return { mockService };
}
</avoid>

## Best Practices

<example>
// ✅ Create reusable mock factories
function createMockUserService(overrides = {}) {
  return {
    getUsers: jest.fn().mockReturnValue(of([])),
    deleteUser: jest.fn().mockReturnValue(of(true)),
    ...overrides
  };
}

// ✅ Use options pattern for different scenarios
interface SetupOptions {
  users?: User[];
  isError?: boolean;
}

async function setup(options: SetupOptions = {}) {
  const mockService = createMockUserService({
    getUsers: jest.fn().mockReturnValue(
      options.isError
        ? throwError(() => new Error())
        : of(options.users ?? [])
    )
  });

  await render(Component, {
    componentProviders: [{ provide: UserService, useValue: mockService }]
  });

  return { mockService };
}

// ✅ Verify service calls through user interactions
await userEvent.click(loadButton);
expect(mockService.getData).toHaveBeenCalled();

// ✅ Use signals in mock services for reactive state
const mockService = {
  data: signal([]),
  loadData: jest.fn()
};
</example>
