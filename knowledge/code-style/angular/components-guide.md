# Angular Components

## Purpose
Standards and patterns for creating Angular components using modern Angular features.

## Critical Rules

- ALWAYS use standalone components (no NgModules)
- ALWAYS use single file components (SFCs) when possible
- ALWAYS use OnPush change detection strategy
- ALWAYS prefer signals over observables for local state
- NEVER include models/interfaces in component files - use `{component}.models.ts`
- NEVER use component inheritance - use composition instead
- NEVER manipulate DOM directly - use Angular APIs

## Modern Angular Setup

<pattern context="basic-component">
// Modern Angular component with all recommended features
@Component({
  selector: 'app-feature-name',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="component-container">
      <h2>{{ title() }}</h2>
      <p>Count: {{ count() }}</p>
      <button (click)="increment()">Increment</button>
    </div>
  `,
  styles: [`
    .component-container {
      padding: 1rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FeatureNameComponent {
  title = signal('My Feature');
  count = signal(0);

  increment() {
    this.count.update(v => v + 1);
  }
}
</pattern>

## Single File Components (SFCs)

<example>
// Preferred: Single file component for small/medium components
@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="user-card">
      <img [src]="user().avatar" [alt]="user().name">
      <h3>{{ user().name }}</h3>
    </div>
  `,
  styles: [`
    .user-card {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid #ccc;
    }
  `]
})
export class UserCardComponent {
  user = input.required<User>();
}
</example>

## Component Communication

<pattern context="input-signals">
// Use input signals for component inputs
export class ProductCardComponent {
  // Required input
  product = input.required<Product>();

  // Optional input with default
  showPrice = input(true);

  // Input with transform
  price = input(0, {
    transform: (value: number | string) =>
      typeof value === 'string' ? parseFloat(value) : value
  });
}
</pattern>

<pattern context="output-events">
// Use output() for events with action-based naming
export class ProductListComponent {
  // Use action verbs (present tense) for outputs
  select = output<Product>();  // NOT 'selected' or 'selectChanged'
  click = output<void>();       // NOT 'clicked'
  sort = output<SortEvent>();   // NOT 'sorted' or 'sortChanged'

  onProductSelect(product: Product) {
    this.select.emit(product);
  }
}
</pattern>

## Model Separation

<pattern context="model-files">
// user-card.models.ts - Keep models separate
export interface UserCardConfig {
  showAvatar: boolean;
  showEmail: boolean;
}

export interface UserCardEvent {
  user: User;
  action: 'edit' | 'delete';
}

// user-card.component.ts - Import models
import { UserCardConfig, UserCardEvent } from './user-card.models';

@Component({...})
export class UserCardComponent {
  config = input<UserCardConfig>();
  action = output<UserCardEvent>();
}
</pattern>

## State Management

<pattern context="signals-state">
// Prefer signals for component state
export class TodoListComponent {
  todos = signal<Todo[]>([]);
  filter = signal<'all' | 'active' | 'completed'>('all');

  filteredTodos = computed(() => {
    const todos = this.todos();
    const filter = this.filter();
    return filter === 'all' ? todos :
           todos.filter(t => filter === 'active' ? !t.completed : t.completed);
  });

  addTodo(title: string) {
    this.todos.update(todos => [...todos, { id: Date.now(), title, completed: false }]);
  }
}
</pattern>

## Anti-patterns

<avoid>
// DON'T include models in component files
@Component({...})
export class BadComponent {
  // WRONG - models should be in separate file
  interface ComponentConfig { ... }
}

// DON'T use past tense for outputs
export class BadComponent {
  clicked = output();     // WRONG - use 'click'
  sortChanged = output(); // WRONG - use 'sort'
}
</avoid>

## File Naming

- Component file: `feature-name.component.ts` (kebab-case)
- Component class: `FeatureNameComponent` (PascalCase)
- Selector: `app-feature-name` (kebab-case with prefix)

## Storybook Documentation

All components should have corresponding Storybook stories for visual documentation and testing.

See: [Storybook Guide](/knowledge-base/code-style/storybook/storybook-guide.md)

