# Complete SIFERS + Angular Testing Library Example

## Purpose
**⭐ START HERE** - This is the recommended testing pattern for all tests in this project. Read this before writing any tests.

This example demonstrates the complete integration of:
- SIFERS methodology (setup function pattern)
- Angular Testing Library (semantic queries, userEvent)
- ng-mocks (MockBuilder, service mocking)
- Modern Angular patterns (signals, standalone components, inject())

## Complete Example: User List Component

### Component Under Test

```typescript
// user-list.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from './user.service';
import { User } from './user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <h1>User List</h1>

      <button
        type="button"
        (click)="onLoadUsers()"
        [disabled]="isLoading()">
        {{ isLoading() ? 'Loading...' : 'Load Users' }}
      </button>

      @if (error()) {
        <div role="alert">{{ error() }}</div>
      }

      @if (users().length > 0) {
        <ul>
          @for (user of users(); track user.id) {
            <li>
              <span>{{ user.name }} - {{ user.email }}</span>
              <button
                type="button"
                (click)="onDeleteUser(user.id)"
                [attr.aria-label]="'Delete ' + user.name">
                Delete
              </button>
            </li>
          }
        </ul>
      } @else if (!isLoading() && !error()) {
        <p>No users found</p>
      }
    </div>
  `
})
export class UserListComponent {
  private userService = inject(UserService);

  users = signal<User[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);

  onLoadUsers() {
    this.isLoading.set(true);
    this.error.set(null);

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load users');
        this.isLoading.set(false);
      }
    });
  }

  onDeleteUser(id: number) {
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.users.update(users => users.filter(u => u.id !== id));
      },
      error: () => {
        this.error.set('Failed to delete user');
      }
    });
  }
}
```

### Complete Test File

```typescript
// user-list.component.spec.ts
import { render, screen, waitFor } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { MockBuilder } from 'ng-mocks';
import { of, throwError } from 'rxjs';
import { UserListComponent } from './user-list.component';
import { UserService } from './user.service';
import { User } from './user.model';

describe('UserListComponent', () => {
  // 1. SETUP FUNCTION - Core of SIFERS pattern
  interface SetupOptions {
    users?: User[];
    loadError?: boolean;
    deleteError?: boolean;
  }

  async function setup(options: SetupOptions = {}) {
    const {
      users = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
      ],
      loadError = false,
      deleteError = false
    } = options;

    // 2. CREATE MOCKS with jest.fn() for tracking calls
    const mockUserService = {
      getUsers: jest.fn().mockReturnValue(
        loadError
          ? throwError(() => new Error('Load failed'))
          : of(users)
      ),
      deleteUser: jest.fn((id: number) =>
        deleteError
          ? throwError(() => new Error('Delete failed'))
          : of(true)
      )
    };

    // 3. BUILD DEPENDENCIES with MockBuilder
    const dependencies = MockBuilder(UserListComponent)
      .mock(UserService, mockUserService)
      .build();

    // 4. RENDER COMPONENT with dependencies
    await render(UserListComponent, dependencies);

    // 5. RETURN STATE - everything tests need
    return {
      mockUserService,
      users,
      // Query helpers for better test readability
      buttons: {
        getLoadButton: () => screen.getByRole('button', { name: /load users/i }),
        getDeleteButton: (name: string) =>
          screen.getByRole('button', { name: new RegExp(`delete ${name}`, 'i') })
      },
      content: {
        getHeading: () => screen.getByRole('heading', { name: /user list/i }),
        getErrorAlert: () => screen.queryByRole('alert'),
        getUserItems: () => screen.queryAllByRole('listitem'),
        getNoUsersMessage: () => screen.queryByText(/no users found/i)
      }
    };
  }

  // 2. TESTS - Each test gets exactly what it needs from setup()

  describe('Initial Render', () => {
    test('should render heading and load button', async () => {
      const { content, buttons } = await setup();

      expect(content.getHeading()).toBeInTheDocument();
      expect(buttons.getLoadButton()).toBeInTheDocument();
      expect(buttons.getLoadButton()).not.toBeDisabled();
    });

    test('should show no users message initially', async () => {
      const { content } = await setup();

      expect(content.getNoUsersMessage()).toBeInTheDocument();
      expect(content.getUserItems()).toHaveLength(0);
    });
  });

  describe('Loading Users', () => {
    test('should load and display users when button clicked', async () => {
      const { buttons, content, mockUserService, users } = await setup();

      // Click load button
      await userEvent.click(buttons.getLoadButton());

      // Verify service called
      expect(mockUserService.getUsers).toHaveBeenCalledTimes(1);

      // Wait for users to appear
      await waitFor(() => {
        expect(content.getUserItems()).toHaveLength(users.length);
      });

      // Verify user content
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
      expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
      expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    });

    test('should show loading state while fetching', async () => {
      const { buttons } = await setup();

      // Start loading (note: in real async test, would use delay)
      const loadButton = buttons.getLoadButton();
      await userEvent.click(loadButton);

      // In synchronous test, loading completes immediately
      // For real async, you'd check:
      // expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();
    });

    test('should handle load error', async () => {
      const { buttons, content } = await setup({ loadError: true });

      await userEvent.click(buttons.getLoadButton());

      await waitFor(() => {
        expect(content.getErrorAlert()).toBeInTheDocument();
        expect(content.getErrorAlert()).toHaveTextContent(/failed to load users/i);
      });

      expect(content.getUserItems()).toHaveLength(0);
    });

    test('should load empty user list', async () => {
      const { buttons, content } = await setup({ users: [] });

      await userEvent.click(buttons.getLoadButton());

      await waitFor(() => {
        expect(content.getNoUsersMessage()).toBeInTheDocument();
      });

      expect(content.getUserItems()).toHaveLength(0);
    });
  });

  describe('Deleting Users', () => {
    test('should delete user when delete button clicked', async () => {
      const { buttons, content, mockUserService } = await setup();

      // Load users first
      await userEvent.click(buttons.getLoadButton());
      await waitFor(() => expect(content.getUserItems()).toHaveLength(2));

      // Delete first user
      await userEvent.click(buttons.getDeleteButton('John Doe'));

      // Verify service called with correct ID
      expect(mockUserService.deleteUser).toHaveBeenCalledWith(1);

      // Verify user removed from list
      await waitFor(() => {
        expect(content.getUserItems()).toHaveLength(1);
      });

      expect(screen.queryByText(/john doe/i)).not.toBeInTheDocument();
      expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    });

    test('should handle delete error', async () => {
      const { buttons, content } = await setup({ deleteError: true });

      // Load users first
      await userEvent.click(buttons.getLoadButton());
      await waitFor(() => expect(content.getUserItems()).toHaveLength(2));

      // Try to delete
      await userEvent.click(buttons.getDeleteButton('John Doe'));

      // Verify error shown
      await waitFor(() => {
        expect(content.getErrorAlert()).toHaveTextContent(/failed to delete user/i);
      });

      // User still in list
      expect(content.getUserItems()).toHaveLength(2);
    });
  });

  describe('Complete User Flow', () => {
    test('should handle full user lifecycle', async () => {
      const { buttons, content, mockUserService } = await setup();

      // 1. Initial state
      expect(content.getNoUsersMessage()).toBeInTheDocument();

      // 2. Load users
      await userEvent.click(buttons.getLoadButton());
      await waitFor(() => expect(content.getUserItems()).toHaveLength(2));

      // 3. Verify both users displayed
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
      expect(screen.getByText(/jane smith/i)).toBeInTheDocument();

      // 4. Delete one user
      await userEvent.click(buttons.getDeleteButton('John Doe'));
      await waitFor(() => expect(content.getUserItems()).toHaveLength(1));

      // 5. Verify correct user deleted
      expect(screen.queryByText(/john doe/i)).not.toBeInTheDocument();
      expect(screen.getByText(/jane smith/i)).toBeInTheDocument();

      // 6. Delete remaining user
      await userEvent.click(buttons.getDeleteButton('Jane Smith'));
      await waitFor(() => expect(content.getNoUsersMessage()).toBeInTheDocument());

      // 7. Verify service called correctly
      expect(mockUserService.getUsers).toHaveBeenCalledTimes(1);
      expect(mockUserService.deleteUser).toHaveBeenCalledTimes(2);
      expect(mockUserService.deleteUser).toHaveBeenNthCalledWith(1, 1);
      expect(mockUserService.deleteUser).toHaveBeenNthCalledWith(2, 2);
    });
  });
});
```

## Key Patterns Demonstrated

### 1. SIFERS Setup Function
```typescript
async function setup(options: SetupOptions = {}) {
  // Destructure options with defaults
  const { users = DEFAULT_USERS, loadError = false } = options;

  // Create mocks
  const mockService = { /* ... */ };

  // Build and render
  const dependencies = MockBuilder(Component).mock(Service, mockService).build();
  await render(Component, dependencies);

  // Return everything needed
  return { mockService, helpers... };
}
```

### 2. Query Helpers
```typescript
// Group related queries in returned object
return {
  buttons: {
    getLoadButton: () => screen.getByRole('button', { name: /load/i }),
    getDeleteButton: (name: string) => screen.getByRole('button', { name: new RegExp(`delete ${name}`, 'i') })
  },
  content: {
    getHeading: () => screen.getByRole('heading'),
    getErrorAlert: () => screen.queryByRole('alert')
  }
};
```

### 3. Semantic Queries (Accessibility First)
```typescript
// ✅ Use roles and accessible labels
screen.getByRole('button', { name: /load users/i })
screen.getByRole('alert')
screen.getByRole('heading', { name: /user list/i })
screen.getAllByRole('listitem')

// In component: Use aria-label for icon buttons
<button [attr.aria-label]="'Delete ' + user.name">Delete</button>
```

### 4. User-Centric Testing
```typescript
// Test the complete user flow, not individual implementation details
test('should handle full user lifecycle', async () => {
  const { buttons, content } = await setup();

  // User sees no users
  expect(content.getNoUsersMessage()).toBeInTheDocument();

  // User clicks load
  await userEvent.click(buttons.getLoadButton());

  // User sees users
  await waitFor(() => expect(content.getUserItems()).toHaveLength(2));

  // User deletes a user
  await userEvent.click(buttons.getDeleteButton('John Doe'));

  // User sees one less user
  await waitFor(() => expect(content.getUserItems()).toHaveLength(1));
});
```

### 5. Test Organization
```typescript
describe('ComponentName', () => {
  // Setup function at top
  async function setup() { /* ... */ }

  // Group tests by feature/behavior
  describe('Initial Render', () => {
    test('should render heading', async () => { /* ... */ });
  });

  describe('Loading Users', () => {
    test('should load users', async () => { /* ... */ });
    test('should handle errors', async () => { /* ... */ });
  });

  describe('Complete Flow', () => {
    test('should handle full lifecycle', async () => { /* ... */ });
  });
});
```

## Benefits of This Pattern

1. **Clear State Management**: Each test explicitly states what state it needs via options
2. **No Shared State**: Fresh mocks and component per test
3. **Type Safety**: TypeScript provides autocomplete for returned helpers
4. **Maintainability**: Queries centralized in setup, easy to update
5. **Readability**: Tests read like user stories
6. **Accessibility**: Forces you to think about accessible markup
7. **Realistic**: userEvent simulates real user interactions

## Common Variations

### Simpler Setup (No Options)
```typescript
async function setup() {
  const mockService = { getData: jest.fn().mockReturnValue(of([])) };
  await render(Component, {
    componentProviders: [{ provide: Service, useValue: mockService }]
  });
  return { mockService };
}
```

### With Component Inputs
```typescript
async function setup(options: { title?: string } = {}) {
  const { title = 'Default' } = options;

  await render(Component, {
    componentInputs: { title }
  });

  return {
    getTitle: () => screen.getByRole('heading')
  };
}
```

### With Router
```typescript
async function setup() {
  const mockRouter = { navigate: jest.fn() };

  await render(Component, {
    componentProviders: [
      { provide: Router, useValue: mockRouter }
    ]
  });

  return { mockRouter };
}
```

## Next Steps

- For forms: See `examples/test-example-forms.md`
- For signals: See `examples/test-example-signals.md`
- For async: See `examples/test-example-async.md`
- For router: See `examples/test-example-router.md`

## Anti-patterns to Avoid

<avoid>
// ❌ Testing implementation details
expect(component.users().length).toBe(2);
// ✅ Instead: expect(screen.getAllByRole('listitem')).toHaveLength(2);

// ❌ Shared mutable state
let mockService: MockService; // Shared across tests
// ✅ Instead: Create fresh mock in setup()

// ❌ Accessing internals
component.users.set([...]);
// ✅ Instead: Interact through UI (click buttons, type, etc.)

// ❌ Multiple beforeEach blocks
beforeEach(() => { /* setup 1 */ });
beforeEach(() => { /* setup 2 */ });
// ✅ Instead: Single setup() function
</avoid>
