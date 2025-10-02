# Form Testing Patterns

## Purpose
Test reactive forms with validation, submission, and error handling using semantic queries and realistic user interactions.

## Critical Rules

- ALWAYS use `getByLabelText` for form inputs (requires proper `<label>` elements)
- ALWAYS use `userEvent.type()` for text input, not setting values directly
- ALWAYS trigger validation by user actions (blur, submit), not by calling form methods
- NEVER access `FormControl` directly - test through the DOM

## Basic Form Testing

<pattern context="simple-form">
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <h1>Login</h1>

      <label for="email">Email</label>
      <input id="email" type="email" formControlName="email" />
      @if (form.controls.email.touched && form.controls.email.invalid) {
        <span role="alert">Invalid email address</span>
      }

      <label for="password">Password</label>
      <input id="password" type="password" formControlName="password" />
      @if (form.controls.password.touched && form.controls.password.invalid) {
        <span role="alert">Password must be at least 6 characters</span>
      }

      <button type="submit" [disabled]="form.invalid">Submit</button>

      @if (successMessage()) {
        <div role="status">{{ successMessage() }}</div>
      }
    </form>
  `
})
export class LoginFormComponent {
  private fb = inject(FormBuilder);

  successMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  onSubmit() {
    if (this.form.valid) {
      this.successMessage.set('Login successful!');
    }
  }
}

// Test
describe('LoginFormComponent', () => {
  async function setup() {
    await render(LoginFormComponent);

    return {
      form: {
        getEmailInput: () => screen.getByLabelText(/email/i),
        getPasswordInput: () => screen.getByLabelText(/password/i),
        getSubmitButton: () => screen.getByRole('button', { name: /submit/i })
      },
      messages: {
        getEmailError: () => screen.queryByText(/invalid email/i),
        getPasswordError: () => screen.queryByText(/password must be/i),
        getSuccess: () => screen.queryByRole('status')
      }
    };
  }

  test('should validate email on blur', async () => {
    const { form, messages } = await setup();

    const emailInput = form.getEmailInput();
    await userEvent.type(emailInput, 'invalid-email');
    await userEvent.tab(); // Trigger blur

    expect(messages.getEmailError()).toBeInTheDocument();
    expect(form.getSubmitButton()).toBeDisabled();
  });

  test('should validate password length', async () => {
    const { form, messages } = await setup();

    const passwordInput = form.getPasswordInput();
    await userEvent.type(passwordInput, '123');
    await userEvent.tab();

    expect(messages.getPasswordError()).toBeInTheDocument();
    expect(form.getSubmitButton()).toBeDisabled();
  });

  test('should submit form with valid data', async () => {
    const { form, messages } = await setup();

    await userEvent.type(form.getEmailInput(), 'user@example.com');
    await userEvent.type(form.getPasswordInput(), 'password123');

    expect(form.getSubmitButton()).not.toBeDisabled();

    await userEvent.click(form.getSubmitButton());

    expect(await screen.findByText(/login successful/i)).toBeInTheDocument();
  });
});
</pattern>

## Form with Service Integration

<pattern context="form-with-service">
interface SetupOptions {
  submitSuccess?: boolean;
}

async function setup(options: SetupOptions = {}) {
  const { submitSuccess = true } = options;

  const mockAuthService = {
    login: jest.fn().mockReturnValue(
      submitSuccess
        ? of({ token: 'abc123' })
        : throwError(() => new Error('Invalid credentials'))
    )
  };

  await render(LoginFormComponent, {
    componentProviders: [
      { provide: AuthService, useValue: mockAuthService }
    ]
  });

  return {
    mockAuthService,
    form: {
      getEmailInput: () => screen.getByLabelText(/email/i),
      getPasswordInput: () => screen.getByLabelText(/password/i),
      getSubmitButton: () => screen.getByRole('button', { name: /submit/i })
    }
  };
}

test('should call auth service with form data', async () => {
  const { form, mockAuthService } = await setup();

  await userEvent.type(form.getEmailInput(), 'user@example.com');
  await userEvent.type(form.getPasswordInput(), 'password123');
  await userEvent.click(form.getSubmitButton());

  expect(mockAuthService.login).toHaveBeenCalledWith({
    email: 'user@example.com',
    password: 'password123'
  });
});

test('should show error on submit failure', async () => {
  const { form } = await setup({ submitSuccess: false });

  await userEvent.type(form.getEmailInput(), 'user@example.com');
  await userEvent.type(form.getPasswordInput(), 'wrong');
  await userEvent.click(form.getSubmitButton());

  expect(await screen.findByText(/invalid credentials/i)).toBeInTheDocument();
});
</pattern>

## Select Dropdowns

<pattern context="select-dropdown">
// Component template
<label for="country">Country</label>
<select id="country" formControlName="country">
  <option value="">Select a country</option>
  <option value="US">United States</option>
  <option value="CA">Canada</option>
  <option value="UK">United Kingdom</option>
</select>

// Test
test('should select country from dropdown', async () => {
  await render(FormComponent);

  const countrySelect = screen.getByLabelText(/country/i);

  await userEvent.selectOptions(countrySelect, 'US');

  expect(countrySelect).toHaveValue('US');
  expect(screen.getByRole('option', { name: /united states/i }).selected).toBe(true);
});
</pattern>

## Radio Buttons

<pattern context="radio-buttons">
// Component template
<fieldset>
  <legend>Subscription Type</legend>

  <label>
    <input type="radio" formControlName="type" value="free" />
    Free
  </label>

  <label>
    <input type="radio" formControlName="type" value="premium" />
    Premium
  </label>
</fieldset>

// Test
test('should select radio option', async () => {
  await render(FormComponent);

  const premiumRadio = screen.getByRole('radio', { name: /premium/i });

  await userEvent.click(premiumRadio);

  expect(premiumRadio).toBeChecked();
  expect(screen.getByRole('radio', { name: /free/i })).not.toBeChecked();
});
</pattern>

## Checkboxes

<pattern context="checkboxes">
// Component template
<label>
  <input type="checkbox" formControlName="terms" />
  I agree to the terms and conditions
</label>

// Test
test('should toggle checkbox', async () => {
  await render(FormComponent);

  const checkbox = screen.getByRole('checkbox', { name: /terms/i });

  expect(checkbox).not.toBeChecked();

  await userEvent.click(checkbox);
  expect(checkbox).toBeChecked();

  await userEvent.click(checkbox);
  expect(checkbox).not.toBeChecked();
});
</pattern>

## Dynamic Form Fields

<pattern context="dynamic-fields">
test('should add and remove dynamic fields', async () => {
  await render(DynamicFormComponent);

  // Add new field
  await userEvent.click(screen.getByRole('button', { name: /add email/i }));

  const emailInputs = screen.getAllByLabelText(/email/i);
  expect(emailInputs).toHaveLength(2);

  // Fill new field
  await userEvent.type(emailInputs[1], 'second@example.com');

  // Remove field
  const removeButtons = screen.getAllByRole('button', { name: /remove/i });
  await userEvent.click(removeButtons[0]);

  expect(screen.getAllByLabelText(/email/i)).toHaveLength(1);
});
</pattern>

## Form Reset

<pattern context="form-reset">
test('should reset form', async () => {
  await render(FormComponent);

  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/password/i);

  // Fill form
  await userEvent.type(emailInput, 'user@example.com');
  await userEvent.type(passwordInput, 'password123');

  // Reset
  await userEvent.click(screen.getByRole('button', { name: /reset/i }));

  // Verify cleared
  expect(emailInput).toHaveValue('');
  expect(passwordInput).toHaveValue('');
});
</pattern>

## Async Validation

<pattern context="async-validation">
// Component with async validator
const mockValidator = {
  checkEmailAvailable: jest.fn().mockReturnValue(of({ available: true }))
};

async function setup() {
  await render(RegistrationForm, {
    componentProviders: [
      { provide: EmailValidator, useValue: mockValidator }
    ]
  });

  return { mockValidator };
}

test('should validate email availability', async () => {
  const { mockValidator } = await setup();

  const emailInput = screen.getByLabelText(/email/i);

  await userEvent.type(emailInput, 'test@example.com');
  await userEvent.tab();

  // Wait for async validation
  await waitFor(() => {
    expect(mockValidator.checkEmailAvailable).toHaveBeenCalledWith('test@example.com');
  });
});

test('should show error for taken email', async () => {
  const { mockValidator } = await setup();
  mockValidator.checkEmailAvailable.mockReturnValue(of({ available: false }));

  const emailInput = screen.getByLabelText(/email/i);

  await userEvent.type(emailInput, 'taken@example.com');
  await userEvent.tab();

  expect(await screen.findByText(/email already in use/i)).toBeInTheDocument();
});
</pattern>

## Custom Form Controls

<pattern context="custom-control">
// Test custom control (ControlValueAccessor)
test('should work with custom date picker', async () => {
  await render(FormWithCustomControl);

  // Custom control should have proper accessibility
  const datePicker = screen.getByLabelText(/birth date/i);

  // Interact with custom control
  await userEvent.click(datePicker);

  // Select date from calendar
  const dateButton = screen.getByRole('button', { name: /15/i });
  await userEvent.click(dateButton);

  // Verify value updated
  expect(datePicker).toHaveTextContent('15');
});
</pattern>

## Complex Validation Scenarios

<pattern context="complex-validation">
test('should handle cross-field validation', async () => {
  await render(PasswordChangeForm);

  const newPassword = screen.getByLabelText(/new password/i);
  const confirmPassword = screen.getByLabelText(/confirm password/i);

  await userEvent.type(newPassword, 'newpass123');
  await userEvent.type(confirmPassword, 'different123');
  await userEvent.tab();

  expect(screen.getByText(/passwords must match/i)).toBeInTheDocument();

  // Fix the mismatch
  await userEvent.clear(confirmPassword);
  await userEvent.type(confirmPassword, 'newpass123');

  expect(screen.queryByText(/passwords must match/i)).not.toBeInTheDocument();
});
</pattern>

## Best Practices

<example>
// ✅ Good - Use labels for all inputs
<label for="email">Email</label>
<input id="email" formControlName="email" />

// ❌ Avoid - No label
<input placeholder="Email" formControlName="email" />

// ✅ Good - Show validation errors with role="alert"
@if (control.invalid && control.touched) {
  <span role="alert">{{ errorMessage }}</span>
}

// ✅ Good - Disable submit until valid
<button type="submit" [disabled]="form.invalid">Submit</button>

// ✅ Good - Test user interactions, not form state
await userEvent.type(input, 'value');
expect(screen.getByText(/error/i)).toBeInTheDocument();

// ❌ Avoid - Testing form state directly
expect(form.controls.email.invalid).toBe(true);
</example>

## Anti-patterns

<avoid>
// ❌ Setting form values directly
fixture.componentInstance.form.patchValue({ email: 'test@example.com' });
// ✅ Instead: await userEvent.type(emailInput, 'test@example.com');

// ❌ Calling validators directly
form.controls.email.updateValueAndValidity();
// ✅ Instead: Trigger validation through user actions (blur, submit)

// ❌ No labels for inputs
screen.getByPlaceholderText('Email'); // Last resort
// ✅ Instead: screen.getByLabelText(/email/i);

// ❌ Testing form state
expect(form.valid).toBe(true);
// ✅ Instead: expect(submitButton).not.toBeDisabled();
</avoid>
