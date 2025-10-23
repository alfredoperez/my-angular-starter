# Content Projection Testing

## Purpose
Test components that use `ng-content` for content projection (transclusion), including default content, multiple slots, and conditional projection.

## Critical Rules

- ALWAYS pass projected content via `template` parameter in `render()`
- ALWAYS test both with and without projected content
- ALWAYS verify default content when no projection provided
- NEVER access `ng-content` directly - test the rendered output

## Basic Content Projection

<pattern context="basic-projection">
@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div class="card">
      <div class="card-body">
        <ng-content />
      </div>
    </div>
  `
})
export class CardComponent {}

describe('CardComponent', () => {
  test('should project content', async () => {
    await render('<app-card><p>Projected content</p></app-card>', {
      imports: [CardComponent]
    });

    expect(screen.getByText(/projected content/i)).toBeInTheDocument();
  });

  test('should project multiple elements', async () => {
    await render(`
      <app-card>
        <h2>Title</h2>
        <p>Description</p>
      </app-card>
    `, {
      imports: [CardComponent]
    });

    expect(screen.getByRole('heading', { name: /title/i })).toBeInTheDocument();
    expect(screen.getByText(/description/i)).toBeInTheDocument();
  });
});
</pattern>

## Default Content

<pattern context="default-content">
@Component({
  selector: 'app-card-with-default',
  standalone: true,
  template: `
    <div class="card">
      <ng-content>
        <p>Default content when nothing is projected</p>
      </ng-content>
    </div>
  `
})
export class CardWithDefaultComponent {}

describe('CardWithDefaultComponent', () => {
  test('should show default content when nothing projected', async () => {
    await render('<app-card-with-default></app-card-with-default>', {
      imports: [CardWithDefaultComponent]
    });

    expect(screen.getByText(/default content/i)).toBeInTheDocument();
  });

  test('should replace default with projected content', async () => {
    await render(`
      <app-card-with-default>
        <p>Custom content</p>
      </app-card-with-default>
    `, {
      imports: [CardWithDefaultComponent]
    });

    expect(screen.getByText(/custom content/i)).toBeInTheDocument();
    expect(screen.queryByText(/default content/i)).not.toBeInTheDocument();
  });
});
</pattern>

## Multiple Slots (Named Projection)

<pattern context="named-slots">
@Component({
  selector: 'app-dialog',
  standalone: true,
  template: `
    <div role="dialog" aria-labelledby="dialog-title">
      <header>
        <h2 id="dialog-title">
          <ng-content select="[slot='title']" />
        </h2>
        <button (click)="onClose()" aria-label="Close dialog">×</button>
      </header>

      <div class="content">
        <ng-content select="[slot='content']" />
      </div>

      <footer>
        <ng-content select="[slot='actions']" />
      </footer>
    </div>
  `
})
export class DialogComponent {
  closed = output<void>();

  onClose() {
    this.closed.emit();
  }
}

describe('DialogComponent', () => {
  test('should project content into named slots', async () => {
    await render(`
      <app-dialog>
        <span slot="title">Dialog Title</span>
        <div slot="content">
          <p>This is the dialog content</p>
        </div>
        <div slot="actions">
          <button type="button">Cancel</button>
          <button type="button">Confirm</button>
        </div>
      </app-dialog>
    `, {
      imports: [DialogComponent]
    });

    // Verify all slots
    expect(screen.getByRole('heading', { name: /dialog title/i })).toBeInTheDocument();
    expect(screen.getByText(/this is the dialog content/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirm/i })).toBeInTheDocument();
  });

  test('should handle missing optional slots', async () => {
    await render(`
      <app-dialog>
        <span slot="title">Title Only</span>
      </app-dialog>
    `, {
      imports: [DialogComponent]
    });

    expect(screen.getByRole('heading', { name: /title only/i })).toBeInTheDocument();
    // Other slots empty but component still works
  });
});
</pattern>

## Conditional Projection

<pattern context="conditional-projection">
@Component({
  selector: 'app-expandable',
  standalone: true,
  template: `
    <div>
      <button (click)="toggle()" [attr.aria-expanded]="isExpanded()">
        {{ isExpanded() ? 'Collapse' : 'Expand' }}
      </button>

      @if (isExpanded()) {
        <div class="content">
          <ng-content />
        </div>
      }
    </div>
  `
})
export class ExpandableComponent {
  isExpanded = signal(false);

  toggle() {
    this.isExpanded.update(v => !v);
  }
}

describe('ExpandableComponent', () => {
  test('should hide projected content when collapsed', async () => {
    await render(`
      <app-expandable>
        <p>Hidden content</p>
      </app-expandable>
    `, {
      imports: [ExpandableComponent]
    });

    expect(screen.queryByText(/hidden content/i)).not.toBeInTheDocument();
  });

  test('should show projected content when expanded', async () => {
    await render(`
      <app-expandable>
        <p>Revealed content</p>
      </app-expandable>
    `, {
      imports: [ExpandableComponent]
    });

    await userEvent.click(screen.getByRole('button', { name: /expand/i }));

    expect(screen.getByText(/revealed content/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  test('should toggle projected content visibility', async () => {
    await render(`
      <app-expandable>
        <p>Toggle me</p>
      </app-expandable>
    `, {
      imports: [ExpandableComponent]
    });

    const button = screen.getByRole('button');

    // Expand
    await userEvent.click(button);
    expect(screen.getByText(/toggle me/i)).toBeInTheDocument();

    // Collapse
    await userEvent.click(button);
    expect(screen.queryByText(/toggle me/i)).not.toBeInTheDocument();
  });
});
</pattern>

## Projection with Inputs

<pattern context="projection-with-inputs">
@Component({
  selector: 'app-panel',
  standalone: true,
  template: `
    <div [class]="'panel panel-' + variant()">
      <h3>{{ title() }}</h3>
      <div class="panel-body">
        <ng-content />
      </div>
    </div>
  `
})
export class PanelComponent {
  title = input.required<string>();
  variant = input<'primary' | 'secondary' | 'danger'>('primary');
}

describe('PanelComponent', () => {
  test('should combine inputs with projected content', async () => {
    await render(`
      <app-panel [title]="'My Panel'" [variant]="'danger'">
        <p>Panel content goes here</p>
      </app-panel>
    `, {
      imports: [PanelComponent]
    });

    expect(screen.getByRole('heading', { name: /my panel/i })).toBeInTheDocument();
    expect(screen.getByText(/panel content goes here/i)).toBeInTheDocument();
  });
});
</pattern>

## Nested Components with Projection

<pattern context="nested-projection">
@Component({
  selector: 'app-tabs',
  standalone: true,
  template: `
    <div role="tablist">
      <ng-content select="app-tab" />
    </div>
  `
})
export class TabsComponent {}

@Component({
  selector: 'app-tab',
  standalone: true,
  template: `
    <button
      role="tab"
      [attr.aria-selected]="isActive()"
      (click)="onClick()">
      {{ label() }}
    </button>
    @if (isActive()) {
      <div role="tabpanel">
        <ng-content />
      </div>
    }
  `
})
export class TabComponent {
  label = input.required<string>();
  isActive = input(false);

  clicked = output<void>();

  onClick() {
    this.clicked.emit();
  }
}

describe('Nested projection', () => {
  test('should project nested components', async () => {
    await render(`
      <app-tabs>
        <app-tab [label]="'Tab 1'" [isActive]="true">
          <p>Content 1</p>
        </app-tab>
        <app-tab [label]="'Tab 2'" [isActive]="false">
          <p>Content 2</p>
        </app-tab>
      </app-tabs>
    `, {
      imports: [TabsComponent, TabComponent]
    });

    expect(screen.getByRole('tab', { name: /tab 1/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /tab 2/i })).toBeInTheDocument();

    // Only active tab shows content
    expect(screen.getByText(/content 1/i)).toBeInTheDocument();
    expect(screen.queryByText(/content 2/i)).not.toBeInTheDocument();
  });
});
</pattern>

## Testing Wrapper Components

<pattern context="wrapper-components">
@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [class]="'btn btn-' + variant()">
      <ng-content />
    </button>
  `
})
export class ButtonComponent {
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input(false);
  variant = input<'primary' | 'secondary'>('primary');
}

describe('ButtonComponent wrapper', () => {
  test('should wrap projected content in styled button', async () => {
    await render(`
      <app-button [variant]="'primary'">
        Click Me
      </app-button>
    `, {
      imports: [ButtonComponent]
    });

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn', 'btn-primary');
  });

  test('should project icon and text', async () => {
    await render(`
      <app-button>
        <span class="icon">🔍</span>
        <span>Search</span>
      </app-button>
    `, {
      imports: [ButtonComponent]
    });

    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('🔍');
    expect(button).toHaveTextContent('Search');
  });
});
</pattern>

## Dynamic Projection

<pattern context="dynamic-projection">
@Component({
  selector: 'app-list',
  standalone: true,
  template: `
    <ul>
      <ng-content />
    </ul>
    <p>Total items: {{ itemCount() }}</p>
  `
})
export class ListComponent implements AfterContentInit {
  @ContentChildren('listItem') items!: QueryList<ElementRef>;

  itemCount = signal(0);

  ngAfterContentInit() {
    this.itemCount.set(this.items.length);
  }
}

describe('Dynamic projection', () => {
  test('should count projected items', async () => {
    await render(`
      <app-list>
        <li #listItem>Item 1</li>
        <li #listItem>Item 2</li>
        <li #listItem>Item 3</li>
      </app-list>
    `, {
      imports: [ListComponent]
    });

    expect(screen.getByText(/total items: 3/i)).toBeInTheDocument();
    expect(screen.getByText(/item 1/i)).toBeInTheDocument();
    expect(screen.getByText(/item 2/i)).toBeInTheDocument();
    expect(screen.getByText(/item 3/i)).toBeInTheDocument();
  });
});
</pattern>

## Anti-patterns

<avoid>
// ❌ Testing ng-content directly
expect(component.contentChild).toBeDefined();
// ✅ Instead: Test the rendered output
expect(screen.getByText(/projected content/i)).toBeInTheDocument();

// ❌ Not testing empty projection case
test('should project content', async () => {
  await render('<app-card>Content</app-card>');
});
// ✅ Instead: Test both cases
test('should show default when empty', async () => {
  await render('<app-card></app-card>');
});
test('should project content when provided', async () => {
  await render('<app-card>Custom</app-card>');
});

// ❌ Using componentInstance for projection
component.projectedContent = 'test';
// ✅ Instead: Pass content in template
await render('<app-card>test</app-card>');
</avoid>

## Best Practices

<example>
// ✅ Test with and without projected content
test('default content', async () => {
  await render('<app-card></app-card>');
});

test('custom content', async () => {
  await render('<app-card>Custom</app-card>');
});

// ✅ Test all named slots
await render(`
  <app-dialog>
    <span slot="title">Title</span>
    <div slot="content">Content</div>
    <div slot="actions">Actions</div>
  </app-dialog>
`);

// ✅ Test projection with user interactions
await render('<app-expandable>Hidden</app-expandable>');
await userEvent.click(screen.getByRole('button'));
expect(screen.getByText(/hidden/i)).toBeInTheDocument();

// ✅ Use semantic HTML in projected content
await render(`
  <app-card>
    <h2>Accessible Title</h2>
    <button type="button">Accessible Button</button>
  </app-card>
`);
</example>
