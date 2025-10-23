# Signal Input/Output Testing

## Purpose
Test modern Angular signal-based inputs, outputs, and model (two-way binding) using Angular Testing Library.

## Critical Rules

- ALWAYS pass signal inputs via `componentInputs` option in `render()`
- ALWAYS test outputs by verifying DOM changes or user interactions
- NEVER access `componentInstance` to set signals - pass inputs through render
- ALWAYS use `model()` for two-way binding testing

## Signal Inputs

<pattern context="basic-signal-inputs">
import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-user-card',
  standalone: true,
  template: `
    <div>
      <h2>{{ fullName() }}</h2>
      <p>{{ email() }}</p>
      @if (isAdmin()) {
        <span role="status">Admin User</span>
      }
    </div>
  `
})
export class UserCardComponent {
  firstName = input.required<string>();
  lastName = input.required<string>();
  email = input<string>('no-email@example.com');
  isAdmin = input(false);

  fullName = computed(() => `${this.firstName()} ${this.lastName()}`);
}

// Test
describe('UserCardComponent', () => {
  test('should display user information', async () => {
    await render(UserCardComponent, {
      componentInputs: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        isAdmin: true
      }
    });

    expect(screen.getByRole('heading', { name: /john doe/i })).toBeInTheDocument();
    expect(screen.getByText(/john@example.com/i)).toBeInTheDocument();
    expect(screen.getByRole('status', { name: /admin user/i })).toBeInTheDocument();
  });

  test('should use default email when not provided', async () => {
    await render(UserCardComponent, {
      componentInputs: {
        firstName: 'Jane',
        lastName: 'Smith'
        // email not provided - uses default
      }
    });

    expect(screen.getByText(/no-email@example.com/i)).toBeInTheDocument();
  });

  test('should show regular user when isAdmin is false', async () => {
    await render(UserCardComponent, {
      componentInputs: {
        firstName: 'Jane',
        lastName: 'Smith',
        isAdmin: false
      }
    });

    expect(screen.queryByRole('status', { name: /admin/i })).not.toBeInTheDocument();
  });
});
</pattern>

## Signal Outputs

<pattern context="signal-outputs">
import { Component, output } from '@angular/core';

@Component({
  selector: 'app-counter',
  standalone: true,
  template: `
    <div>
      <p>Count: {{ count }}</p>
      <button type="button" (click)="onIncrement()">Increment</button>
      <button type="button" (click)="onDecrement()">Decrement</button>
    </div>
  `
})
export class CounterComponent {
  count = 0;

  countChanged = output<number>();
  resetRequested = output<void>();

  onIncrement() {
    this.count++;
    this.countChanged.emit(this.count);
  }

  onDecrement() {
    this.count--;
    this.countChanged.emit(this.count);
  }
}

// Test outputs by checking parent component behavior
@Component({
  selector: 'app-counter-parent',
  standalone: true,
  imports: [CounterComponent],
  template: `
    <app-counter (countChanged)="onCountChanged($event)" />
    <p>Parent count: {{ parentCount }}</p>
  `
})
export class CounterParentComponent {
  parentCount = 0;

  onCountChanged(count: number) {
    this.parentCount = count;
  }
}

describe('CounterComponent outputs', () => {
  test('should emit countChanged on increment', async () => {
    await render(CounterParentComponent);

    const incrementBtn = screen.getByRole('button', { name: /increment/i });

    await userEvent.click(incrementBtn);

    expect(screen.getByText(/parent count: 1/i)).toBeInTheDocument();
  });

  test('should emit countChanged on decrement', async () => {
    await render(CounterParentComponent);

    await userEvent.click(screen.getByRole('button', { name: /decrement/i }));

    expect(screen.getByText(/parent count: -1/i)).toBeInTheDocument();
  });
});
</pattern>

## Model (Two-Way Binding)

<pattern context="signal-model">
import { Component, model, signal } from '@angular/core';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule],
  template: `
    <label for="search">Search</label>
    <input
      id="search"
      type="text"
      [(ngModel)]="query"
      (ngModelChange)="onQueryChange($event)" />
    <p>Results: {{ filteredResults().length }}</p>
  `
})
export class SearchComponent {
  query = model(''); // Two-way bindable signal
  allResults = input<string[]>([]);

  filteredResults = computed(() => {
    const q = this.query().toLowerCase();
    return this.allResults().filter(r => r.toLowerCase().includes(q));
  });

  onQueryChange(value: string) {
    this.query.set(value);
  }
}

describe('SearchComponent with model', () => {
  async function setup() {
    const results = ['Apple', 'Banana', 'Cherry', 'Date'];

    await render(SearchComponent, {
      componentInputs: {
        query: '', // Initial model value
        allResults: results
      }
    });

    return {
      getSearchInput: () => screen.getByLabelText(/search/i),
      getResultsCount: () => screen.getByText(/results:/i)
    };
  }

  test('should filter results based on query', async () => {
    const { getSearchInput, getResultsCount } = await setup();

    expect(getResultsCount()).toHaveTextContent('Results: 4');

    await userEvent.type(getSearchInput(), 'a');

    expect(getResultsCount()).toHaveTextContent('Results: 3'); // Apple, Banana, Date

    await userEvent.clear(getSearchInput());
    await userEvent.type(getSearchInput(), 'cherry');

    expect(getResultsCount()).toHaveTextContent('Results: 1');
  });

  test('should update model on input change', async () => {
    const { getSearchInput } = await setup();

    await userEvent.type(getSearchInput(), 'test');

    expect(getSearchInput()).toHaveValue('test');
  });
});
</pattern>

## Parent-Child Signal Communication

<pattern context="parent-child-signals">
// Child Component
@Component({
  selector: 'app-item',
  standalone: true,
  template: `
    <div>
      <h3>{{ title() }}</h3>
      <button (click)="onDelete()">Delete</button>
    </div>
  `
})
export class ItemComponent {
  title = input.required<string>();
  id = input.required<number>();

  deleteRequested = output<number>();

  onDelete() {
    this.deleteRequested.emit(this.id());
  }
}

// Parent Component
@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [ItemComponent],
  template: `
    <div>
      @for (item of items(); track item.id) {
        <app-item
          [title]="item.title"
          [id]="item.id"
          (deleteRequested)="onDeleteItem($event)" />
      }
      <p>Total items: {{ items().length }}</p>
    </div>
  `
})
export class ItemListComponent {
  items = signal([
    { id: 1, title: 'Item 1' },
    { id: 2, title: 'Item 2' }
  ]);

  onDeleteItem(id: number) {
    this.items.update(items => items.filter(i => i.id !== id));
  }
}

// Test
describe('Parent-Child Signal Communication', () => {
  test('should delete item from parent when child emits', async () => {
    await render(ItemListComponent);

    expect(screen.getByText(/total items: 2/i)).toBeInTheDocument();
    expect(screen.getByText(/item 1/i)).toBeInTheDocument();
    expect(screen.getByText(/item 2/i)).toBeInTheDocument();

    // Click delete on first item
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    await userEvent.click(deleteButtons[0]);

    // Verify item removed
    expect(screen.getByText(/total items: 1/i)).toBeInTheDocument();
    expect(screen.queryByText(/item 1/i)).not.toBeInTheDocument();
    expect(screen.getByText(/item 2/i)).toBeInTheDocument();
  });
});
</pattern>

## Transform Inputs

<pattern context="transform-inputs">
import { Component, input, numberAttribute, booleanAttribute } from '@angular/core';

@Component({
  selector: 'app-product',
  standalone: true,
  template: `
    <div>
      <h2>{{ name() }}</h2>
      <p>Price: ${{ price() }}</p>
      @if (inStock()) {
        <span role="status">In Stock</span>
      }
    </div>
  `
})
export class ProductComponent {
  name = input.required<string>();
  price = input.required<number, string | number>({
    transform: numberAttribute
  });
  inStock = input(false, {
    transform: booleanAttribute
  });
}

describe('ProductComponent with transforms', () => {
  test('should transform string price to number', async () => {
    await render(ProductComponent, {
      componentInputs: {
        name: 'Widget',
        price: '29.99', // String will be transformed to number
        inStock: 'true'  // String will be transformed to boolean
      }
    });

    expect(screen.getByText(/price: \$29.99/i)).toBeInTheDocument();
    expect(screen.getByRole('status', { name: /in stock/i })).toBeInTheDocument();
  });

  test('should handle numeric price input', async () => {
    await render(ProductComponent, {
      componentInputs: {
        name: 'Gadget',
        price: 49.99, // Already a number
        inStock: false
      }
    });

    expect(screen.getByText(/price: \$49.99/i)).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
</pattern>

## Effect Testing

<pattern context="signal-effects">
import { Component, input, effect, signal } from '@angular/core';

@Component({
  selector: 'app-logger',
  standalone: true,
  template: `
    <div>
      <p>Counter: {{ counter() }}</p>
      <button (click)="increment()">Increment</button>
      <p>Log count: {{ logCount() }}</p>
    </div>
  `
})
export class LoggerComponent {
  counter = signal(0);
  logCount = signal(0);

  constructor() {
    // Effect runs when counter changes
    effect(() => {
      console.log('Counter changed:', this.counter());
      this.logCount.update(c => c + 1);
    });
  }

  increment() {
    this.counter.update(c => c + 1);
  }
}

describe('LoggerComponent with effects', () => {
  test('should trigger effect when signal changes', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await render(LoggerComponent);

    // Initial effect run
    expect(screen.getByText(/log count: 1/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /increment/i }));

    // Effect runs again
    expect(screen.getByText(/log count: 2/i)).toBeInTheDocument();
    expect(consoleSpy).toHaveBeenCalledWith('Counter changed:', 1);

    consoleSpy.mockRestore();
  });
});
</pattern>

## Anti-patterns

<avoid>
// ❌ Accessing component instance to set signals
const { fixture } = await render(Component);
fixture.componentInstance.count.set(5); // Don't do this

// ✅ Instead: Pass inputs through render
await render(Component, {
  componentInputs: { count: 5 }
});

// ❌ Testing outputs by spying on component methods
jest.spyOn(component, 'countChanged.emit');
// ✅ Instead: Test the result in parent or DOM

// ❌ Manually triggering change detection
fixture.detectChanges(); // Not needed with ATL
// ✅ ATL handles change detection automatically

// ❌ Testing signal internals
expect(component.count()).toBe(5);
// ✅ Test what user sees
expect(screen.getByText(/count: 5/i)).toBeInTheDocument();
</avoid>

## Best Practices

<example>
// ✅ Use input.required() for mandatory inputs
name = input.required<string>();

// ✅ Provide defaults for optional inputs
description = input('No description available');

// ✅ Use computed for derived state
fullName = computed(() => `${this.firstName()} ${this.lastName()}`);

// ✅ Test outputs through parent component
@Component({
  template: `
    <app-child (valueChanged)="onValueChange($event)" />
    <p>Value: {{ value }}</p>
  `
})
class ParentComponent {
  value = '';
  onValueChange(v: string) { this.value = v; }
}

// ✅ Use model() for two-way binding
searchQuery = model('');
</example>
