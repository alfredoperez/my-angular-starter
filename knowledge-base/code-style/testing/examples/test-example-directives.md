# Directive Testing Patterns

## Purpose
Test Angular directives including attribute directives, structural directives, and directive interactions.

## Critical Rules

- ALWAYS test directives through host components
- ALWAYS verify directive effects in the DOM, not directive internals
- NEVER test directive class directly - test its behavior on elements
- ALWAYS use semantic queries to find elements affected by directives

## Attribute Directives

<pattern context="basic-attribute-directive">
@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  color = input<string>('yellow');

  private el = inject(ElementRef);

  constructor() {
    effect(() => {
      this.el.nativeElement.style.backgroundColor = this.color();
    });
  }
}

// Test with host component
describe('HighlightDirective', () => {
  test('should highlight element with default color', async () => {
    await render('<p appHighlight>Highlighted text</p>', {
      imports: [HighlightDirective]
    });

    const paragraph = screen.getByText(/highlighted text/i);
    expect(paragraph).toHaveStyle({ backgroundColor: 'yellow' });
  });

  test('should highlight with custom color', async () => {
    await render('<p [appHighlight] [color]="\'red\'">Red text</p>', {
      imports: [HighlightDirective]
    });

    const paragraph = screen.getByText(/red text/i);
    expect(paragraph).toHaveStyle({ backgroundColor: 'red' });
  });
});
</pattern>

## Interactive Directives

<pattern context="interactive-directive">
@Directive({
  selector: '[appTooltip]',
  standalone: true
})
export class TooltipDirective {
  tooltipText = input.required<string>();

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private tooltip: HTMLElement | null = null;

  @HostListener('mouseenter')
  onMouseEnter() {
    this.showTooltip();
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.hideTooltip();
  }

  private showTooltip() {
    this.tooltip = this.renderer.createElement('div');
    this.tooltip.textContent = this.tooltipText();
    this.tooltip.className = 'tooltip';
    this.renderer.appendChild(document.body, this.tooltip);
  }

  private hideTooltip() {
    if (this.tooltip) {
      this.renderer.removeChild(document.body, this.tooltip);
      this.tooltip = null;
    }
  }
}

describe('TooltipDirective', () => {
  test('should show tooltip on hover', async () => {
    await render(`
      <button [appTooltip] [tooltipText]="'Click to submit'">
        Submit
      </button>
    `, {
      imports: [TooltipDirective]
    });

    const button = screen.getByRole('button', { name: /submit/i });

    // Tooltip not visible initially
    expect(screen.queryByText(/click to submit/i)).not.toBeInTheDocument();

    // Hover over button
    await userEvent.hover(button);

    // Tooltip appears
    expect(screen.getByText(/click to submit/i)).toBeInTheDocument();

    // Move away
    await userEvent.unhover(button);

    // Tooltip disappears
    expect(screen.queryByText(/click to submit/i)).not.toBeInTheDocument();
  });
});
</pattern>

## Structural Directives

<pattern context="structural-directive">
@Directive({
  selector: '[appUnless]',
  standalone: true
})
export class UnlessDirective {
  private hasView = false;

  private templateRef = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);

  @Input()
  set appUnless(condition: boolean) {
    if (!condition && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (condition && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }
}

describe('UnlessDirective', () => {
  @Component({
    selector: 'app-test-host',
    standalone: true,
    imports: [UnlessDirective],
    template: `
      <button (click)="toggle()">Toggle</button>
      <p *appUnless="condition">Content shown when condition is false</p>
    `
  })
  class TestHostComponent {
    condition = false;

    toggle() {
      this.condition = !this.condition;
    }
  }

  test('should show content when condition is false', async () => {
    await render(TestHostComponent);

    expect(screen.getByText(/content shown/i)).toBeInTheDocument();
  });

  test('should hide content when condition is true', async () => {
    await render(TestHostComponent);

    await userEvent.click(screen.getByRole('button', { name: /toggle/i }));

    expect(screen.queryByText(/content shown/i)).not.toBeInTheDocument();
  });

  test('should toggle visibility', async () => {
    await render(TestHostComponent);

    const button = screen.getByRole('button', { name: /toggle/i });

    expect(screen.getByText(/content shown/i)).toBeInTheDocument();

    await userEvent.click(button);
    expect(screen.queryByText(/content shown/i)).not.toBeInTheDocument();

    await userEvent.click(button);
    expect(screen.getByText(/content shown/i)).toBeInTheDocument();
  });
});
</pattern>

## Form Validation Directive

<pattern context="validation-directive">
@Directive({
  selector: '[appEmailValidator]',
  standalone: true,
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: EmailValidatorDirective,
      multi: true
    }
  ]
})
export class EmailValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    const email = control.value;
    if (!email) return null;

    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return valid ? null : { invalidEmail: true };
  }
}

describe('EmailValidatorDirective', () => {
  @Component({
    selector: 'app-test-form',
    standalone: true,
    imports: [ReactiveFormsModule, EmailValidatorDirective],
    template: `
      <form [formGroup]="form">
        <label for="email">Email</label>
        <input id="email" formControlName="email" appEmailValidator />
        @if (form.controls.email.touched && form.controls.email.invalid) {
          <span role="alert">Invalid email format</span>
        }
      </form>
    `
  })
  class TestFormComponent {
    private fb = inject(FormBuilder);

    form = this.fb.nonNullable.group({
      email: ['']
    });
  }

  test('should validate email format', async () => {
    await render(TestFormComponent);

    const emailInput = screen.getByLabelText(/email/i);

    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.tab();

    expect(screen.getByRole('alert', { name: /invalid email/i })).toBeInTheDocument();
  });

  test('should accept valid email', async () => {
    await render(TestFormComponent);

    const emailInput = screen.getByLabelText(/email/i);

    await userEvent.type(emailInput, 'valid@example.com');
    await userEvent.tab();

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
</pattern>

## Permission Directive

<pattern context="permission-directive">
@Directive({
  selector: '[appRequirePermission]',
  standalone: true
})
export class RequirePermissionDirective implements OnInit {
  permission = input.required<string>();

  private authService = inject(AuthService);
  private templateRef = inject(TemplateRef);
  private viewContainer = inject(ViewContainerRef);

  ngOnInit() {
    if (this.authService.hasPermission(this.permission())) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}

describe('RequirePermissionDirective', () => {
  interface SetupOptions {
    userPermissions?: string[];
  }

  async function setup(options: SetupOptions = {}) {
    const { userPermissions = [] } = options;

    const mockAuthService = {
      hasPermission: jest.fn((permission: string) =>
        userPermissions.includes(permission)
      )
    };

    await render(`
      <button *appRequirePermission="'admin:delete'">Delete</button>
      <button *appRequirePermission="'user:edit'">Edit</button>
    `, {
      imports: [RequirePermissionDirective],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    return { mockAuthService };
  }

  test('should hide elements without permission', async () => {
    await setup({ userPermissions: [] });

    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
  });

  test('should show elements with permission', async () => {
    await setup({ userPermissions: ['admin:delete', 'user:edit'] });

    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });

  test('should show only permitted elements', async () => {
    await setup({ userPermissions: ['user:edit'] });

    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
  });
});
</pattern>

## Multiple Directives on Element

<pattern context="multiple-directives">
describe('Multiple directives', () => {
  test('should apply multiple directives to same element', async () => {
    await render(`
      <button
        appHighlight
        [color]="'blue'"
        [appTooltip]
        [tooltipText]="'Click me'">
        Styled Button
      </button>
    `, {
      imports: [HighlightDirective, TooltipDirective]
    });

    const button = screen.getByRole('button', { name: /styled button/i });

    // Both directives work
    expect(button).toHaveStyle({ backgroundColor: 'blue' });

    await userEvent.hover(button);
    expect(screen.getByText(/click me/i)).toBeInTheDocument();
  });
});
</pattern>

## Directive with Outputs

<pattern context="directive-outputs">
@Directive({
  selector: '[appLongPress]',
  standalone: true
})
export class LongPressDirective {
  duration = input(500);

  longPress = output<void>();

  private pressTimer: any;

  @HostListener('mousedown')
  onMouseDown() {
    this.pressTimer = setTimeout(() => {
      this.longPress.emit();
    }, this.duration());
  }

  @HostListener('mouseup')
  @HostListener('mouseleave')
  onMouseUp() {
    clearTimeout(this.pressTimer);
  }
}

describe('LongPressDirective', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  @Component({
    selector: 'app-test-host',
    standalone: true,
    imports: [LongPressDirective],
    template: `
      <button
        [appLongPress]
        [duration]="1000"
        (longPress)="onLongPress()">
        Press and hold
      </button>
      <p>Long press count: {{ count }}</p>
    `
  })
  class TestHostComponent {
    count = 0;

    onLongPress() {
      this.count++;
    }
  }

  test('should emit longPress after duration', async () => {
    await render(TestHostComponent);

    const button = screen.getByRole('button', { name: /press and hold/i });

    // Start pressing
    await userEvent.pointer({ keys: '[MouseLeft>]', target: button });

    // Advance timer
    jest.advanceTimersByTime(1000);

    // Release
    await userEvent.pointer({ keys: '[/MouseLeft]' });

    expect(screen.getByText(/long press count: 1/i)).toBeInTheDocument();
  });

  test('should not emit if released early', async () => {
    await render(TestHostComponent);

    const button = screen.getByRole('button', { name: /press and hold/i });

    await userEvent.pointer({ keys: '[MouseLeft>]', target: button });

    // Release before duration
    jest.advanceTimersByTime(500);
    await userEvent.pointer({ keys: '[/MouseLeft]' });

    expect(screen.getByText(/long press count: 0/i)).toBeInTheDocument();
  });
});
</pattern>

## Anti-patterns

<avoid>
// ❌ Testing directive class directly
const directive = new HighlightDirective();
directive.color.set('red');
// ✅ Instead: Test through host component
await render('<p appHighlight [color]="\'red\'">Text</p>');

// ❌ Accessing directive instance
const directiveInstance = fixture.debugElement.query(By.directive(HighlightDirective));
// ✅ Instead: Test directive effects on DOM
expect(element).toHaveStyle({ backgroundColor: 'yellow' });

// ❌ Not using semantic queries
const element = fixture.nativeElement.querySelector('p');
// ✅ Instead: Use screen queries
const element = screen.getByText(/highlighted text/i);

// ❌ Testing without user interactions
directive.onMouseEnter();
// ✅ Instead: Use userEvent
await userEvent.hover(element);
</avoid>

## Best Practices

<example>
// ✅ Create host component for testing
@Component({
  template: `<p appHighlight>Test</p>`
})
class TestHost {}

// ✅ Test directive effects, not internals
expect(element).toHaveStyle({ backgroundColor: 'yellow' });

// ✅ Test with user interactions
await userEvent.hover(element);
await userEvent.click(button);

// ✅ Test different configurations
test('with default value', async () => {
  await render('<p appHighlight>Text</p>');
});

test('with custom value', async () => {
  await render('<p appHighlight [color]="\'blue\'">Text</p>');
});

// ✅ Use setup function for complex scenarios
async function setup(options: { permissions?: string[] } = {}) {
  const mockAuth = { hasPermission: jest.fn() };
  await render(template, {
    providers: [{ provide: AuthService, useValue: mockAuth }]
  });
  return { mockAuth };
}
</example>
