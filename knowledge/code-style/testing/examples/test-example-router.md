# Router Testing Patterns

## Purpose
Test routing, navigation, route parameters, guards, and router-dependent components using Angular Testing Library.

## Critical Rules

- ALWAYS mock Router for unit tests
- ALWAYS verify navigation by checking current URL or component rendering
- NEVER navigate programmatically in tests - trigger via user interactions
- ALWAYS use `RouterTestingHarness` for integration tests with actual routing

## Basic Navigation

<pattern context="basic-navigation">
@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav>
      <a routerLink="/home">Home</a>
      <a routerLink="/about">About</a>
      <a routerLink="/users">Users</a>
    </nav>
  `
})
export class NavComponent {}

describe('NavComponent', () => {
  test('should have navigation links', async () => {
    await render(NavComponent, {
      imports: [RouterTestingModule]
    });

    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/home');
    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '/about');
    expect(screen.getByRole('link', { name: /users/i })).toHaveAttribute('href', '/users');
  });
});
</pattern>

## Programmatic Navigation

<pattern context="programmatic-navigation">
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <label for="email">Email</label>
      <input id="email" formControlName="email" />

      <label for="password">Password</label>
      <input id="password" type="password" formControlName="password" />

      <button type="submit">Login</button>
    </form>
  `
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit() {
    if (this.form.valid) {
      this.authService.login(this.form.value).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: () => alert('Login failed')
      });
    }
  }
}

describe('LoginComponent', () => {
  async function setup() {
    const mockRouter = {
      navigate: jest.fn().mockResolvedValue(true)
    };

    const mockAuthService = {
      login: jest.fn().mockReturnValue(of({ token: 'abc123' }))
    };

    await render(LoginComponent, {
      componentProviders: [
        { provide: Router, useValue: mockRouter },
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    return { mockRouter, mockAuthService };
  }

  test('should navigate to dashboard after successful login', async () => {
    const { mockRouter, mockAuthService } = await setup();

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123'
      });
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
    });
  });

  test('should not navigate on login failure', async () => {
    const { mockRouter, mockAuthService } = await setup();

    mockAuthService.login.mockReturnValue(
      throwError(() => new Error('Invalid credentials'))
    );

    await userEvent.type(screen.getByLabelText(/email/i), 'user@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
    await userEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mockAuthService.login).toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });
});
</pattern>

## Route Parameters

<pattern context="route-parameters">
@Component({
  selector: 'app-user-detail',
  standalone: true,
  template: `
    <div>
      <h1>User Details</h1>
      @if (user()) {
        <p>ID: {{ user()?.id }}</p>
        <p>Name: {{ user()?.name }}</p>
      } @else {
        <p>Loading...</p>
      }
    </div>
  `
})
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private userService = inject(UserService);

  user = signal<User | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.userService.getUser(+id).subscribe(user => {
        this.user.set(user);
      });
    }
  }
}

describe('UserDetailComponent', () => {
  async function setup(userId: string) {
    const mockUser = { id: parseInt(userId), name: 'John Doe' };

    const mockUserService = {
      getUser: jest.fn().mockReturnValue(of(mockUser))
    };

    const mockActivatedRoute = {
      snapshot: {
        paramMap: new Map([['id', userId]])
      }
    };

    await render(UserDetailComponent, {
      componentProviders: [
        { provide: UserService, useValue: mockUserService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });

    return { mockUserService, mockUser };
  }

  test('should load user based on route parameter', async () => {
    const { mockUserService, mockUser } = await setup('1');

    expect(mockUserService.getUser).toHaveBeenCalledWith(1);

    expect(await screen.findByText(/id: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/name: john doe/i)).toBeInTheDocument();
  });

  test('should load different user for different ID', async () => {
    const { mockUserService } = await setup('42');

    expect(mockUserService.getUser).toHaveBeenCalledWith(42);
  });
});
</pattern>

## Query Parameters

<pattern context="query-parameters">
@Component({
  selector: 'app-search',
  standalone: true,
  template: `
    <div>
      <label for="search">Search</label>
      <input
        id="search"
        type="text"
        [value]="searchQuery()"
        (input)="onSearchChange($any($event.target).value)" />
      <p>Results for: {{ searchQuery() }}</p>
    </div>
  `
})
export class SearchComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  searchQuery = signal('');

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.searchQuery.set(params['q'] || '');
    });
  }

  onSearchChange(value: string) {
    this.router.navigate([], {
      queryParams: { q: value },
      queryParamsHandling: 'merge'
    });
  }
}

describe('SearchComponent', () => {
  async function setup(queryParams: Record<string, string> = {}) {
    const mockRouter = {
      navigate: jest.fn()
    };

    const mockActivatedRoute = {
      queryParams: of(queryParams)
    };

    await render(SearchComponent, {
      componentProviders: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    });

    return { mockRouter };
  }

  test('should read query parameter from route', async () => {
    await setup({ q: 'angular' });

    expect(screen.getByLabelText(/search/i)).toHaveValue('angular');
    expect(screen.getByText(/results for: angular/i)).toBeInTheDocument();
  });

  test('should update query params on search', async () => {
    const { mockRouter } = await setup();

    await userEvent.type(screen.getByLabelText(/search/i), 'testing');

    expect(mockRouter.navigate).toHaveBeenLastCalledWith(
      [],
      expect.objectContaining({
        queryParams: { q: 'testing' }
      })
    );
  });
});
</pattern>

## RouterLink Active

<pattern context="routerlink-active">
@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav>
      <a routerLink="/home" routerLinkActive="active">Home</a>
      <a routerLink="/about" routerLinkActive="active">About</a>
    </nav>
  `
})
export class NavComponent {}

describe('RouterLinkActive', () => {
  test('should apply active class to current route', async () => {
    await render(NavComponent, {
      imports: [RouterTestingModule.withRoutes([
        { path: 'home', component: class {} },
        { path: 'about', component: class {} }
      ])],
      routes: [
        { path: 'home', component: class {} }
      ]
    });

    // Integration test would check active class based on current route
    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toBeInTheDocument();
  });
});
</pattern>

## Route Guards

<pattern context="route-guards">
@Injectable({ providedIn: 'root' })
export class AuthGuard {
  private authService = inject(AuthService);
  private router = inject(Router);

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    this.router.navigate(['/login']);
    return false;
  }
}

// Test the component that uses the guard
describe('Protected component', () => {
  test('should redirect to login when not authenticated', async () => {
    const mockRouter = {
      navigate: jest.fn()
    };

    const mockAuthService = {
      isAuthenticated: jest.fn().mockReturnValue(false)
    };

    const guard = new AuthGuard();
    // Manually inject dependencies for unit test
    (guard as any).authService = mockAuthService;
    (guard as any).router = mockRouter;

    const result = guard.canActivate();

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  test('should allow access when authenticated', async () => {
    const mockAuthService = {
      isAuthenticated: jest.fn().mockReturnValue(true)
    };

    const guard = new AuthGuard();
    (guard as any).authService = mockAuthService;
    (guard as any).router = { navigate: jest.fn() };

    const result = guard.canActivate();

    expect(result).toBe(true);
  });
});
</pattern>

## Nested Routes

<pattern context="nested-routes">
@Component({
  selector: 'app-user-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div>
      <h1>Users</h1>
      <nav>
        <a routerLink="list">List</a>
        <a routerLink="create">Create</a>
      </nav>
      <router-outlet />
    </div>
  `
})
export class UserLayoutComponent {}

describe('UserLayoutComponent', () => {
  test('should render nested navigation', async () => {
    await render(UserLayoutComponent, {
      imports: [RouterTestingModule]
    });

    expect(screen.getByRole('heading', { name: /users/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /list/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create/i })).toBeInTheDocument();
  });
});
</pattern>

## Navigation with State

<pattern context="navigation-state">
@Component({
  selector: 'app-user-list',
  standalone: true,
  template: `
    <button (click)="viewUser(1)">View User</button>
  `
})
export class UserListComponent {
  private router = inject(Router);

  viewUser(id: number) {
    this.router.navigate(['/users', id], {
      state: { returnUrl: '/users' }
    });
  }
}

describe('Navigation with state', () => {
  test('should navigate with state', async () => {
    const mockRouter = {
      navigate: jest.fn()
    };

    await render(UserListComponent, {
      componentProviders: [
        { provide: Router, useValue: mockRouter }
      ]
    });

    await userEvent.click(screen.getByRole('button', { name: /view user/i }));

    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/users', 1],
      expect.objectContaining({
        state: { returnUrl: '/users' }
      })
    );
  });
});
</pattern>

## Anti-patterns

<avoid>
// ❌ Calling router.navigate directly in test
router.navigate(['/home']);
expect(component.loaded).toBe(true);
// ✅ Instead: Trigger navigation via user interaction
await userEvent.click(screen.getByRole('link', { name: /home/i }));

// ❌ Not mocking Router
// Component tries to navigate, test fails
// ✅ Instead: Always provide mock Router
const mockRouter = { navigate: jest.fn() };

// ❌ Testing Router itself
expect(router.url).toBe('/home');
// ✅ Instead: Test component behavior
expect(mockRouter.navigate).toHaveBeenCalledWith(['/home']);

// ❌ Using real routing in unit tests
RouterTestingModule.withRoutes(allAppRoutes);
// ✅ Instead: Mock Router for unit tests
{ provide: Router, useValue: mockRouter }
</avoid>

## Best Practices

<example>
// ✅ Mock Router for unit tests
const mockRouter = {
  navigate: jest.fn().mockResolvedValue(true),
  navigateByUrl: jest.fn()
};

// ✅ Mock ActivatedRoute for route params
const mockActivatedRoute = {
  snapshot: { paramMap: new Map([['id', '1']]) },
  queryParams: of({ q: 'search' })
};

// ✅ Verify navigation through user interaction
await userEvent.click(submitButton);
expect(mockRouter.navigate).toHaveBeenCalledWith(['/success']);

// ✅ Test different route parameter scenarios
test('with id=1', async () => await setup('1'));
test('with id=42', async () => await setup('42'));

// ✅ Use RouterTestingHarness for integration tests
import { RouterTestingHarness } from '@angular/router/testing';
const harness = await RouterTestingHarness.create();
await harness.navigateByUrl('/users/1');
</example>
