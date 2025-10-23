# Standalone Component Testing

## Purpose
Test modern Angular standalone components with their imports, providers, and dependencies using Angular Testing Library.

## Critical Rules

- ALWAYS import standalone components in render imports array
- ALWAYS declare standalone component dependencies in imports
- NEVER use NgModules for standalone components
- ALWAYS use component-level providers when appropriate

## Basic Standalone Component

<pattern context="basic-standalone">
@Component({
  selector: 'app-welcome',
  standalone: true,
  template: `
    <div>
      <h1>Welcome</h1>
      <p>{{ message }}</p>
    </div>
  `
})
export class WelcomeComponent {
  message = 'Hello, World!';
}

describe('WelcomeComponent', () => {
  test('should render welcome message', async () => {
    await render(WelcomeComponent);

    expect(screen.getByRole('heading', { name: /welcome/i })).toBeInTheDocument();
    expect(screen.getByText(/hello, world!/i)).toBeInTheDocument();
  });
});
</pattern>

## Standalone with Imports

<pattern context="standalone-with-imports">
@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <label for="name">Name</label>
      <input id="name" formControlName="name" />

      @if (form.controls.name.invalid && form.controls.name.touched) {
        <span role="alert">Name is required</span>
      }

      <button type="submit" [disabled]="form.invalid">Submit</button>
    </form>
  `
})
export class UserFormComponent {
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    name: ['', Validators.required]
  });
}

describe('UserFormComponent', () => {
  test('should show validation error', async () => {
    await render(UserFormComponent);

    const nameInput = screen.getByLabelText(/name/i);

    await userEvent.click(nameInput);
    await userEvent.tab(); // Trigger blur

    expect(screen.getByRole('alert', { name: /name is required/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });
});
</pattern>

## Standalone with Child Components

<pattern context="standalone-with-children">
@Component({
  selector: 'app-user-card',
  standalone: true,
  template: `
    <div class="card">
      <h3>{{ name() }}</h3>
      <p>{{ email() }}</p>
    </div>
  `
})
export class UserCardComponent {
  name = input.required<string>();
  email = input.required<string>();
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [UserCardComponent, CommonModule],
  template: `
    <div>
      <h1>Users</h1>
      @for (user of users(); track user.id) {
        <app-user-card
          [name]="user.name"
          [email]="user.email" />
      }
    </div>
  `
})
export class UserListComponent {
  users = signal([
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ]);
}

describe('UserListComponent with child components', () => {
  test('should render user cards', async () => {
    await render(UserListComponent);

    expect(screen.getByRole('heading', { name: /users/i })).toBeInTheDocument();
    expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/jane smith/i)).toBeInTheDocument();
    expect(screen.getByText(/jane@example.com/i)).toBeInTheDocument();
  });
});
</pattern>

## Standalone with Services

<pattern context="standalone-with-services">
@Injectable()
export class UserService {
  private http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users');
  }
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  providers: [UserService], // Component-level provider
  template: `
    <div>
      <button (click)="loadUsers()">Load Users</button>
      @for (user of users(); track user.id) {
        <p>{{ user.name }}</p>
      }
    </div>
  `
})
export class UsersComponent {
  private userService = inject(UserService);

  users = signal<User[]>([]);

  loadUsers() {
    this.userService.getUsers().subscribe(users => {
      this.users.set(users);
    });
  }
}

describe('UsersComponent', () => {
  async function setup() {
    const mockUsers = [
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ];

    const mockUserService = {
      getUsers: jest.fn().mockReturnValue(of(mockUsers))
    };

    await render(UsersComponent, {
      componentProviders: [
        { provide: UserService, useValue: mockUserService }
      ]
    });

    return { mockUserService, mockUsers };
  }

  test('should load users from service', async () => {
    const { mockUserService, mockUsers } = await setup();

    await userEvent.click(screen.getByRole('button', { name: /load users/i }));

    expect(mockUserService.getUsers).toHaveBeenCalled();

    await waitFor(() => {
      expect(screen.getByText(mockUsers[0].name)).toBeInTheDocument();
      expect(screen.getByText(mockUsers[1].name)).toBeInTheDocument();
    });
  });
});
</pattern>

## Standalone with Third-Party Libraries

<pattern context="standalone-with-libraries">
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule],
  template: `
    <div>
      <input
        pInputText
        type="text"
        [(ngModel)]="query"
        placeholder="Search..."
        aria-label="Search" />
      <button pButton (click)="onSearch()">Search</button>
    </div>
  `
})
export class SearchComponent {
  query = '';

  onSearch() {
    console.log('Searching for:', this.query);
  }
}

describe('SearchComponent with PrimeNG', () => {
  test('should render search input and button', async () => {
    await render(SearchComponent);

    const input = screen.getByLabelText(/search/i);
    const button = screen.getByRole('button', { name: /search/i });

    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();

    await userEvent.type(input, 'angular');
    expect(input).toHaveValue('angular');
  });
});
</pattern>

## Standalone with Pipes

<pattern context="standalone-with-pipes">
@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, maxLength: number = 50): string {
    if (!value) return '';
    return value.length > maxLength
      ? value.substring(0, maxLength) + '...'
      : value;
  }
}

@Component({
  selector: 'app-article',
  standalone: true,
  imports: [TruncatePipe],
  template: `
    <div>
      <h2>{{ title }}</h2>
      <p>{{ content | truncate:100 }}</p>
    </div>
  `
})
export class ArticleComponent {
  title = 'Article Title';
  content = 'This is a very long article content that should be truncated when it exceeds the maximum length specified in the pipe parameter.';
}

describe('ArticleComponent with custom pipe', () => {
  test('should truncate long content', async () => {
    await render(ArticleComponent);

    const paragraph = screen.getByText(/this is a very long/i);
    expect(paragraph).toHaveTextContent('...');
    expect(paragraph.textContent?.length).toBeLessThan(110);
  });
});
</pattern>

## Standalone with Directives

<pattern context="standalone-with-directives">
@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  color = input('yellow');

  private el = inject(ElementRef);

  constructor() {
    effect(() => {
      this.el.nativeElement.style.backgroundColor = this.color();
    });
  }
}

@Component({
  selector: 'app-document',
  standalone: true,
  imports: [HighlightDirective],
  template: `
    <div>
      <p [appHighlight] [color]="'lightblue'">
        This paragraph is highlighted
      </p>
    </div>
  `
})
export class DocumentComponent {}

describe('DocumentComponent with directive', () => {
  test('should apply highlight directive', async () => {
    await render(DocumentComponent);

    const paragraph = screen.getByText(/this paragraph is highlighted/i);
    expect(paragraph).toHaveStyle({ backgroundColor: 'lightblue' });
  });
});
</pattern>

## Mocking Standalone Dependencies

<pattern context="mock-standalone-deps">
import { MockBuilder } from 'ng-mocks';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, UserCardComponent, ChartComponent],
  template: `
    <div>
      <h1>Dashboard</h1>
      <app-user-card [name]="'John'" [email]="'john@example.com'" />
      <app-chart [data]="chartData" />
    </div>
  `
})
export class DashboardComponent {
  chartData = [1, 2, 3, 4, 5];
}

describe('DashboardComponent with mocked children', () => {
  async function setup() {
    // Mock all dependencies except the component under test
    const dependencies = MockBuilder(DashboardComponent)
      .mock(UserCardComponent)
      .mock(ChartComponent)
      .build();

    await render(DashboardComponent, dependencies);
  }

  test('should render dashboard', async () => {
    await setup();

    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
  });
});
</pattern>

## Standalone Component with Router

<pattern context="standalone-with-router">
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

describe('NavComponent', () => {
  test('should render navigation links', async () => {
    await render(NavComponent, {
      imports: [RouterTestingModule]
    });

    expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute('href', '/home');
    expect(screen.getByRole('link', { name: /about/i })).toHaveAttribute('href', '/about');
  });
});
</pattern>

## Standalone Component with Signals

<pattern context="standalone-with-signals">
@Component({
  selector: 'app-counter',
  standalone: true,
  template: `
    <div>
      <p>Count: {{ count() }}</p>
      <p>Double: {{ doubled() }}</p>
      <button (click)="increment()">Increment</button>
      <button (click)="reset()">Reset</button>
    </div>
  `
})
export class CounterComponent {
  count = signal(0);
  doubled = computed(() => this.count() * 2);

  increment() {
    this.count.update(c => c + 1);
  }

  reset() {
    this.count.set(0);
  }
}

describe('CounterComponent', () => {
  test('should increment count and update computed value', async () => {
    await render(CounterComponent);

    expect(screen.getByText(/count: 0/i)).toBeInTheDocument();
    expect(screen.getByText(/double: 0/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /increment/i }));

    expect(screen.getByText(/count: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/double: 2/i)).toBeInTheDocument();
  });

  test('should reset count', async () => {
    await render(CounterComponent);

    await userEvent.click(screen.getByRole('button', { name: /increment/i }));
    await userEvent.click(screen.getByRole('button', { name: /increment/i }));

    expect(screen.getByText(/count: 2/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /reset/i }));

    expect(screen.getByText(/count: 0/i)).toBeInTheDocument();
  });
});
</pattern>

## Testing Standalone Route Components

<pattern context="standalone-route-component">
// routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./users.component').then(m => m.UsersComponent)
  },
  {
    path: 'users/:id',
    loadComponent: () => import('./user-detail.component').then(m => m.UserDetailComponent)
  }
];

// Test the component
describe('UsersComponent as route', () => {
  test('should render when loaded via route', async () => {
    await render(UsersComponent);

    expect(screen.getByRole('heading', { name: /users/i })).toBeInTheDocument();
  });
});
</pattern>

## Anti-patterns

<avoid>
// ❌ Importing NgModule for standalone component
@Component({
  standalone: true,
  imports: [SomeModule] // Don't import modules
})

// ❌ Not declaring imports in standalone component
@Component({
  standalone: true,
  template: `<form [formGroup]="form"></form>`
  // Missing imports: [ReactiveFormsModule]
})

// ❌ Using declarations array
await render(Component, {
  declarations: [OtherComponent] // Wrong for standalone
});
// ✅ Instead: Use imports
await render(Component, {
  imports: [OtherComponent]
});

// ❌ Forgetting to import child standalone components
@Component({
  standalone: true,
  template: `<app-child></app-child>`
  // Missing imports: [ChildComponent]
})
</avoid>

## Best Practices

<example>
// ✅ Declare all imports in standalone component
@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ChildComponent],
  template: `...`
})

// ✅ Use component-level providers when appropriate
@Component({
  standalone: true,
  providers: [LocalService],
  template: `...`
})

// ✅ Mock standalone dependencies with MockBuilder
const dependencies = MockBuilder(Component)
  .mock(ChildComponent)
  .mock(SomeService)
  .build();

// ✅ Import standalone pipes, directives, components
@Component({
  standalone: true,
  imports: [
    CommonModule,
    CustomPipe,
    CustomDirective,
    ChildComponent
  ]
})

// ✅ Use lazy loading for routes
{
  path: 'feature',
  loadComponent: () => import('./feature.component').then(m => m.FeatureComponent)
}
</example>

## Migration from NgModules

<example>
// Before (NgModule)
@NgModule({
  declarations: [MyComponent],
  imports: [CommonModule, FormsModule],
  providers: [MyService]
})
export class MyModule {}

// After (Standalone)
@Component({
  selector: 'app-my-component',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [MyService], // Move to component if component-scoped
  template: `...`
})
export class MyComponent {}

// Test Before
await render(MyComponent, {
  imports: [MyModule]
});

// Test After
await render(MyComponent); // Component is already standalone with imports
</example>
