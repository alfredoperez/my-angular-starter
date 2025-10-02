# Event and Output Testing

## Purpose
Test component outputs (EventEmitters), custom events, and event propagation using Angular Testing Library.

## Critical Rules

- ALWAYS test outputs through parent component integration
- ALWAYS use `userEvent` to trigger events (click, type, etc.)
- NEVER emit outputs directly in tests - trigger via UI interactions
- ALWAYS verify output effects through DOM changes or parent state

## Testing Outputs via Parent

<pattern context="output-through-parent">
// Child Component
@Component({
  selector: 'app-delete-button',
  standalone: true,
  template: `
    <button
      type="button"
      (click)="onDelete()"
      [attr.aria-label]="'Delete ' + itemName()">
      Delete
    </button>
  `
})
export class DeleteButtonComponent {
  itemId = input.required<number>();
  itemName = input.required<string>();

  deleteClicked = output<number>();

  onDelete() {
    this.deleteClicked.emit(this.itemId());
  }
}

// Parent Component for Testing
@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [DeleteButtonComponent],
  template: `
    <app-delete-button
      [itemId]="1"
      [itemName]="'Test Item'"
      (deleteClicked)="onDeleteItem($event)" />
    <p>Deleted ID: {{ deletedId }}</p>
  `
})
export class ParentComponent {
  deletedId: number | null = null;

  onDeleteItem(id: number) {
    this.deletedId = id;
  }
}

// Test
describe('DeleteButtonComponent output', () => {
  test('should emit deleteClicked when button clicked', async () => {
    await render(ParentComponent);

    await userEvent.click(screen.getByRole('button', { name: /delete test item/i }));

    expect(screen.getByText(/deleted id: 1/i)).toBeInTheDocument();
  });
});
</pattern>

## Multiple Outputs

<pattern context="multiple-outputs">
@Component({
  selector: 'app-rating',
  standalone: true,
  template: `
    <div>
      <button (click)="onRatingClick(1)">1 Star</button>
      <button (click)="onRatingClick(2)">2 Stars</button>
      <button (click)="onRatingClick(3)">3 Stars</button>
      <button (click)="onRatingClick(4)">4 Stars</button>
      <button (click)="onRatingClick(5)">5 Stars</button>
    </div>
  `
})
export class RatingComponent {
  ratingChanged = output<number>();
  ratingHovered = output<number>();

  onRatingClick(rating: number) {
    this.ratingChanged.emit(rating);
  }

  onRatingHover(rating: number) {
    this.ratingHovered.emit(rating);
  }
}

// Test with parent
@Component({
  selector: 'app-rating-parent',
  standalone: true,
  imports: [RatingComponent],
  template: `
    <app-rating
      (ratingChanged)="currentRating = $event"
      (ratingHovered)="hoveredRating = $event" />
    <p>Current: {{ currentRating }}</p>
    <p>Hovered: {{ hoveredRating }}</p>
  `
})
export class RatingParentComponent {
  currentRating = 0;
  hoveredRating = 0;
}

describe('RatingComponent', () => {
  test('should emit ratingChanged on click', async () => {
    await render(RatingParentComponent);

    await userEvent.click(screen.getByRole('button', { name: /3 stars/i }));

    expect(screen.getByText(/current: 3/i)).toBeInTheDocument();
  });
});
</pattern>

## Output with Complex Data

<pattern context="complex-output-data">
interface FormData {
  name: string;
  email: string;
  age: number;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <label for="name">Name</label>
      <input id="name" formControlName="name" />

      <label for="email">Email</label>
      <input id="email" formControlName="email" />

      <label for="age">Age</label>
      <input id="age" type="number" formControlName="age" />

      <button type="submit">Submit</button>
    </form>
  `
})
export class UserFormComponent {
  private fb = inject(FormBuilder);

  formSubmitted = output<FormData>();

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    age: [0, Validators.required]
  });

  onSubmit() {
    if (this.form.valid) {
      this.formSubmitted.emit(this.form.value as FormData);
    }
  }
}

// Parent component
@Component({
  selector: 'app-form-parent',
  standalone: true,
  imports: [UserFormComponent],
  template: `
    <app-user-form (formSubmitted)="onFormSubmit($event)" />
    @if (submittedData) {
      <div>
        <p>Name: {{ submittedData.name }}</p>
        <p>Email: {{ submittedData.email }}</p>
        <p>Age: {{ submittedData.age }}</p>
      </div>
    }
  `
})
export class FormParentComponent {
  submittedData: FormData | null = null;

  onFormSubmit(data: FormData) {
    this.submittedData = data;
  }
}

describe('UserFormComponent', () => {
  test('should emit form data on submit', async () => {
    await render(FormParentComponent);

    await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
    await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
    await userEvent.type(screen.getByLabelText(/age/i), '30');

    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    expect(screen.getByText(/name: john doe/i)).toBeInTheDocument();
    expect(screen.getByText(/email: john@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/age: 30/i)).toBeInTheDocument();
  });
});
</pattern>

## Event Bubbling

<pattern context="event-bubbling">
@Component({
  selector: 'app-nested-clicks',
  standalone: true,
  template: `
    <div (click)="onOuterClick()">
      Outer
      <button type="button" (click)="onInnerClick()">Inner</button>
    </div>
    <p>Outer clicks: {{ outerClicks }}</p>
    <p>Inner clicks: {{ innerClicks }}</p>
  `
})
export class NestedClicksComponent {
  outerClicks = 0;
  innerClicks = 0;

  onOuterClick() {
    this.outerClicks++;
  }

  onInnerClick() {
    this.innerClicks++;
  }
}

describe('Event bubbling', () => {
  test('should trigger both handlers when inner clicked', async () => {
    await render(NestedClicksComponent);

    await userEvent.click(screen.getByRole('button', { name: /inner/i }));

    // Both handlers triggered due to event bubbling
    expect(screen.getByText(/outer clicks: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/inner clicks: 1/i)).toBeInTheDocument();
  });
});

// With stopPropagation
@Component({
  selector: 'app-nested-clicks-stopped',
  standalone: true,
  template: `
    <div (click)="onOuterClick()">
      Outer
      <button type="button" (click)="onInnerClick($event)">Inner</button>
    </div>
  `
})
export class NestedClicksStoppedComponent {
  outerClicks = 0;
  innerClicks = 0;

  onOuterClick() {
    this.outerClicks++;
  }

  onInnerClick(event: Event) {
    event.stopPropagation();
    this.innerClicks++;
  }
}

test('should not bubble when stopPropagation called', async () => {
  await render(NestedClicksStoppedComponent);

  await userEvent.click(screen.getByRole('button', { name: /inner/i }));

  // Only inner handler triggered
  expect(screen.getByText(/outer clicks: 0/i)).toBeInTheDocument();
  expect(screen.getByText(/inner clicks: 1/i)).toBeInTheDocument();
});
</pattern>

## Keyboard Events

<pattern context="keyboard-events">
@Component({
  selector: 'app-keyboard-handler',
  standalone: true,
  template: `
    <input
      type="text"
      (keydown.enter)="onEnter()"
      (keydown.escape)="onEscape()"
      aria-label="Command input" />
    <p>Enter pressed: {{ enterCount }}</p>
    <p>Escape pressed: {{ escapeCount }}</p>
  `
})
export class KeyboardHandlerComponent {
  enterCount = 0;
  escapeCount = 0;

  onEnter() {
    this.enterCount++;
  }

  onEscape() {
    this.escapeCount++;
  }
}

describe('Keyboard events', () => {
  test('should handle Enter key', async () => {
    await render(KeyboardHandlerComponent);

    const input = screen.getByLabelText(/command input/i);

    await userEvent.type(input, 'test{Enter}');

    expect(screen.getByText(/enter pressed: 1/i)).toBeInTheDocument();
  });

  test('should handle Escape key', async () => {
    await render(KeyboardHandlerComponent);

    const input = screen.getByLabelText(/command input/i);

    await userEvent.type(input, 'test{Escape}');

    expect(screen.getByText(/escape pressed: 1/i)).toBeInTheDocument();
  });

  test('should handle multiple key combinations', async () => {
    await render(KeyboardHandlerComponent);

    const input = screen.getByLabelText(/command input/i);

    await userEvent.type(input, 'test{Enter}more{Escape}');

    expect(screen.getByText(/enter pressed: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/escape pressed: 1/i)).toBeInTheDocument();
  });
});
</pattern>

## Focus Events

<pattern context="focus-events">
@Component({
  selector: 'app-focus-handler',
  standalone: true,
  template: `
    <input
      type="text"
      (focus)="onFocus()"
      (blur)="onBlur()"
      aria-label="Monitored input" />
    <p>Focus count: {{ focusCount }}</p>
    <p>Blur count: {{ blurCount }}</p>
  `
})
export class FocusHandlerComponent {
  focusCount = 0;
  blurCount = 0;

  onFocus() {
    this.focusCount++;
  }

  onBlur() {
    this.blurCount++;
  }
}

describe('Focus events', () => {
  test('should handle focus and blur', async () => {
    await render(FocusHandlerComponent);

    const input = screen.getByLabelText(/monitored input/i);

    await userEvent.click(input); // Focus
    expect(screen.getByText(/focus count: 1/i)).toBeInTheDocument();

    await userEvent.tab(); // Blur
    expect(screen.getByText(/blur count: 1/i)).toBeInTheDocument();
  });
});
</pattern>

## Mouse Events

<pattern context="mouse-events">
@Component({
  selector: 'app-hover-handler',
  standalone: true,
  template: `
    <div
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
      role="region"
      aria-label="Hoverable area">
      Hover over me
    </div>
    <p>Hover count: {{ hoverCount }}</p>
    <p>Currently hovering: {{ isHovering }}</p>
  `
})
export class HoverHandlerComponent {
  hoverCount = 0;
  isHovering = false;

  onMouseEnter() {
    this.hoverCount++;
    this.isHovering = true;
  }

  onMouseLeave() {
    this.isHovering = false;
  }
}

describe('Mouse events', () => {
  test('should handle hover', async () => {
    await render(HoverHandlerComponent);

    const region = screen.getByRole('region', { name: /hoverable area/i });

    await userEvent.hover(region);
    expect(screen.getByText(/hover count: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/currently hovering: true/i)).toBeInTheDocument();

    await userEvent.unhover(region);
    expect(screen.getByText(/currently hovering: false/i)).toBeInTheDocument();
  });
});
</pattern>

## Custom Events

<pattern context="custom-events">
@Component({
  selector: 'app-custom-event',
  standalone: true,
  template: `
    <button (click)="emitCustomEvent()">Trigger Custom Event</button>
  `
})
export class CustomEventComponent {
  itemSelected = output<{ id: number; data: string }>();

  emitCustomEvent() {
    this.itemSelected.emit({ id: 42, data: 'custom payload' });
  }
}

// Test via parent
@Component({
  selector: 'app-custom-parent',
  standalone: true,
  imports: [CustomEventComponent],
  template: `
    <app-custom-event (itemSelected)="onItemSelected($event)" />
    @if (selectedItem) {
      <p>Selected ID: {{ selectedItem.id }}</p>
      <p>Selected Data: {{ selectedItem.data }}</p>
    }
  `
})
export class CustomParentComponent {
  selectedItem: { id: number; data: string } | null = null;

  onItemSelected(item: { id: number; data: string }) {
    this.selectedItem = item;
  }
}

describe('Custom events', () => {
  test('should emit custom event with payload', async () => {
    await render(CustomParentComponent);

    await userEvent.click(screen.getByRole('button', { name: /trigger custom event/i }));

    expect(screen.getByText(/selected id: 42/i)).toBeInTheDocument();
    expect(screen.getByText(/selected data: custom payload/i)).toBeInTheDocument();
  });
});
</pattern>

## Conditional Event Emission

<pattern context="conditional-events">
@Component({
  selector: 'app-conditional-emit',
  standalone: true,
  template: `
    <button
      (click)="onClick()"
      [disabled]="isDisabled()">
      Click Me
    </button>
  `
})
export class ConditionalEmitComponent {
  isDisabled = input(false);

  clicked = output<void>();

  onClick() {
    if (!this.isDisabled()) {
      this.clicked.emit();
    }
  }
}

// Parent
@Component({
  selector: 'app-conditional-parent',
  standalone: true,
  imports: [ConditionalEmitComponent],
  template: `
    <app-conditional-emit
      [isDisabled]="disabled"
      (clicked)="clickCount++" />
    <p>Clicks: {{ clickCount }}</p>
    <button (click)="disabled = !disabled">
      {{ disabled ? 'Enable' : 'Disable' }}
    </button>
  `
})
export class ConditionalParentComponent {
  disabled = false;
  clickCount = 0;
}

describe('Conditional event emission', () => {
  test('should not emit when disabled', async () => {
    await render(ConditionalParentComponent);

    // Disable the button
    await userEvent.click(screen.getByRole('button', { name: /disable/i }));

    // Try to click (but it's disabled)
    const clickMeButton = screen.getByRole('button', { name: /click me/i });
    expect(clickMeButton).toBeDisabled();

    // Click count should not increase
    expect(screen.getByText(/clicks: 0/i)).toBeInTheDocument();
  });

  test('should emit when enabled', async () => {
    await render(ConditionalParentComponent);

    await userEvent.click(screen.getByRole('button', { name: /click me/i }));

    expect(screen.getByText(/clicks: 1/i)).toBeInTheDocument();
  });
});
</pattern>

## Anti-patterns

<avoid>
// ❌ Emitting outputs directly
fixture.componentInstance.deleteClicked.emit(1);
// ✅ Instead: Trigger via user interaction
await userEvent.click(screen.getByRole('button', { name: /delete/i }));

// ❌ Spying on output
const spy = jest.spyOn(component.deleteClicked, 'emit');
// ✅ Instead: Test via parent component and verify effects

// ❌ Testing implementation details
expect(component.itemSelected.observers.length).toBe(1);
// ✅ Instead: Test that output works correctly

// ❌ Using native events
button.dispatchEvent(new Event('click'));
// ✅ Instead: Use userEvent
await userEvent.click(button);
</avoid>

## Best Practices

<example>
// ✅ Test outputs through parent components
@Component({
  template: `<app-child (outputEvent)="handleOutput($event)" />`
})

// ✅ Verify output effects in DOM
await userEvent.click(button);
expect(screen.getByText(/result from output/i)).toBeInTheDocument();

// ✅ Use userEvent for realistic interactions
await userEvent.click(button);
await userEvent.type(input, 'text{Enter}');
await userEvent.hover(element);

// ✅ Test keyboard shortcuts
await userEvent.type(input, '{Escape}');
await userEvent.keyboard('{Control>}s{/Control}');
</example>
