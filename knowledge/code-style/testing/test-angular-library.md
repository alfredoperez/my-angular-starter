# Angular Testing Library Core Patterns

## Purpose
Test Angular components from the user's perspective using Angular Testing Library with semantic queries and realistic interactions.

## Critical Rules

> **IMPORTANT**: Read `examples/test-example-complete.md` before writing any tests. It shows the complete recommended pattern for this project.

- ALWAYS use `render()` from `@testing-library/angular` to mount components
- ALWAYS prefer semantic queries (getByRole, getByLabelText) over test IDs
- ALWAYS use `userEvent` for interactions (click, type, etc.) instead of native events
- ALWAYS use `screen` object for queries to improve test readability
- NEVER access component internals (use `screen.debug()` to see DOM if needed)
- NEVER use `fixture.detectChanges()` - Angular Testing Library handles change detection
- ALWAYS write tests from the user's perspective, not implementation details

<example>
// Good - User perspective
const button = screen.getByRole('button', { name: /submit/i });
await userEvent.click(button);
expect(screen.getByText(/success/i)).toBeInTheDocument();

// Avoid - Implementation details
const component = fixture.componentInstance;
component.onSubmit();
expect(component.submitted).toBe(true);
</example>

## Setup and Rendering

<pattern context="basic-render">
// Basic component rendering
import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';

test('should render component', async () => {
  await render(MyComponent, {
    componentInputs: { title: 'Hello' },
    componentProviders: [MyService]
  });

  expect(screen.getByText('Hello')).toBeInTheDocument();
});
</pattern>

<pattern context="with-dependencies">
// With MockBuilder (see test-ng-mocks.md)
import { MockBuilder } from 'ng-mocks';

const dependencies = MockBuilder(MyComponent, MyModule).build();
await render(MyComponent, dependencies);
</pattern>

## Query Methods

**Priority Order** (use in this order):
1. **getByRole** - Most accessible (buttons, inputs, headings)
2. **getByLabelText** - Form fields with labels
3. **getByPlaceholderText** - Inputs with placeholders
4. **getByText** - Non-interactive text content
5. **getByTestId** - Last resort when semantic queries aren't possible

<pattern context="semantic-queries">
// ✅ Excellent - Accessible queries
const submitButton = screen.getByRole('button', { name: /submit/i });
const emailInput = screen.getByLabelText(/email/i);
const heading = screen.getByRole('heading', { name: /welcome/i });

// ⚠️ Avoid - Test IDs should be last resort
const submitButton = screen.getByTestId('submit-btn');
</pattern>

**Query Variants**:
- `getBy*` - Returns element or throws (use for elements that should exist)
- `queryBy*` - Returns element or null (use for assertions about non-existence)
- `findBy*` - Returns promise (use for async/dynamic content)

<example>
// Element should exist
expect(screen.getByText('Welcome')).toBeInTheDocument();

// Element should NOT exist
expect(screen.queryByText('Error')).not.toBeInTheDocument();

// Element appears after async operation
const message = await screen.findByText('Data loaded');
expect(message).toBeInTheDocument();
</example>

## User Interactions

<pattern context="user-interactions">
import userEvent from '@testing-library/user-event';

test('should handle user interactions', async () => {
  await render(MyComponent);

  // Click
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));

  // Type text
  const input = screen.getByLabelText(/name/i);
  await userEvent.type(input, 'John Doe');

  // Clear input
  await userEvent.clear(input);

  // Select option
  await userEvent.selectOptions(
    screen.getByLabelText(/country/i),
    'USA'
  );

  // Keyboard navigation
  await userEvent.keyboard('{Enter}');
  await userEvent.tab();
});
</pattern>

## Async Testing

<pattern context="async-content">
// Wait for async content to appear
test('should load data', async () => {
  await render(DataComponent);

  // findBy* returns a promise - waits up to 1000ms by default
  const item = await screen.findByText('Item 1');
  expect(item).toBeInTheDocument();
});
</pattern>

<pattern context="custom-timeout">
import { waitFor } from '@testing-library/angular';

// Custom timeout and assertions
await waitFor(
  () => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  },
  { timeout: 3000 }
);
</pattern>

## Best Practices

### Focus on User Perspective

<example>
// ✅ Good - Tests what user sees/does
test('should show error when email is invalid', async () => {
  await render(LoginForm);

  const emailInput = screen.getByLabelText(/email/i);
  await userEvent.type(emailInput, 'invalid-email');
  await userEvent.tab(); // Trigger blur validation

  expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
});

// ❌ Avoid - Tests implementation details
test('should set emailInvalid to true', async () => {
  const { fixture } = await render(LoginForm);

  fixture.componentInstance.email.setValue('invalid-email');
  expect(fixture.componentInstance.emailInvalid).toBe(true);
});
</example>

### Improve Accessibility

Adding proper ARIA labels improves both accessibility and testability:

<example>
// Component template
<button aria-label="Delete user">🗑️</button>
<input type="text" aria-label="Search users" placeholder="Search..." />

// Test
const deleteBtn = screen.getByRole('button', { name: /delete user/i });
const searchInput = screen.getByLabelText(/search users/i);
</example>

### Write Fewer, More Comprehensive Tests

<example>
// ✅ Good - One comprehensive test
test('should complete full user flow', async () => {
  await render(UserForm);

  // Fill form
  await userEvent.type(screen.getByLabelText(/name/i), 'John');
  await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');

  // Submit
  await userEvent.click(screen.getByRole('button', { name: /submit/i }));

  // Verify success
  expect(await screen.findByText(/user created/i)).toBeInTheDocument();
});

// ❌ Avoid - Many fragmented tests
test('should type name', async () => { /* ... */ });
test('should type email', async () => { /* ... */ });
test('should submit form', async () => { /* ... */ });
</example>

## Reference Examples

For specific scenarios, see:
- **Complete pattern**: `examples/test-example-complete.md` ⭐ **START HERE**
- **Forms**: `examples/test-example-forms.md`
- **Signal inputs/outputs**: `examples/test-example-signals.md`
- **Services**: `examples/test-example-services.md`
- **Async operations**: `examples/test-example-async.md`
- **Events**: `examples/test-example-events.md`
- **Router**: `examples/test-example-router.md`
- **Standalone components**: `examples/test-example-standalone.md`

## Debugging

<pattern context="debugging">
import { screen } from '@testing-library/angular';

test('debugging', async () => {
  await render(MyComponent);

  // Print entire DOM
  screen.debug();

  // Print specific element
  screen.debug(screen.getByRole('button'));

  // Find what queries are available for an element
  const element = screen.getByRole('button');
  screen.logTestingPlaygroundURL(); // Opens browser tool
});
</pattern>

## Anti-patterns

<avoid>
// ❌ Using fixture.detectChanges()
await render(MyComponent);
fixture.detectChanges(); // Not needed - ATL handles this

// ❌ Accessing component internals
const component = fixture.componentInstance;
component.count++; // Test the DOM, not the class

// ❌ Using test IDs as first choice
<div data-testid="submit-button">Submit</div>
screen.getByTestId('submit-button'); // Use getByRole instead

// ❌ Testing implementation details
expect(component.users.length).toBe(3); // Test what user sees
// Instead: expect(screen.getAllByRole('listitem')).toHaveLength(3);
</avoid>
