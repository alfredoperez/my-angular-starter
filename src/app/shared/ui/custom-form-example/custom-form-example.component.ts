import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-custom-form-example',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <div class="container mx-auto p-8">
      <h1 class="text-2xl font-brand mb-6 text-primary">Custom Form Styling Example</h1>

      <!-- Example 1: No floating labels (using placeholder only) -->
      <mat-card class="mb-8">
        <mat-card-header>
          <mat-card-title>Material Form Fields Without Floating Labels</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" class="space-y-4">
            <!-- Text input without mat-label -->
            <mat-form-field appearance="outline" class="w-full">
              <!-- No mat-label here! -->
              <input matInput placeholder="Enter your name" formControlName="name" />
              <mat-icon matPrefix>person</mat-icon>
              <mat-error *ngIf="form.get('name')?.hasError('required')">
                Name is required
              </mat-error>
            </mat-form-field>

            <!-- Email input without mat-label -->
            <mat-form-field appearance="outline" class="w-full">
              <input matInput placeholder="Email address" formControlName="email" type="email" />
              <mat-icon matPrefix>email</mat-icon>
              <mat-error *ngIf="form.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <!-- Password input without mat-label -->
            <mat-form-field appearance="outline" class="w-full">
              <input matInput placeholder="Password" formControlName="password" type="password" />
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword">
                <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
              </button>
            </mat-form-field>

            <!-- Select without mat-label -->
            <mat-form-field appearance="outline" class="w-full">
              <mat-select placeholder="Select a country" formControlName="country">
                <mat-option value="us">United States</mat-option>
                <mat-option value="uk">United Kingdom</mat-option>
                <mat-option value="ca">Canada</mat-option>
                <mat-option value="au">Australia</mat-option>
              </mat-select>
              <mat-icon matPrefix>public</mat-icon>
            </mat-form-field>

            <!-- Textarea without mat-label -->
            <mat-form-field appearance="outline" class="w-full">
              <textarea matInput placeholder="Enter your message" formControlName="message" rows="4"></textarea>
              <mat-icon matPrefix>message</mat-icon>
            </mat-form-field>

            <!-- Checkbox and Radio examples -->
            <div class="flex gap-4">
              <mat-checkbox formControlName="terms">
                I agree to the terms and conditions
              </mat-checkbox>
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium">Preferred Contact Method:</label>
              <mat-radio-group formControlName="contactMethod" class="flex gap-4">
                <mat-radio-button value="email">Email</mat-radio-button>
                <mat-radio-button value="phone">Phone</mat-radio-button>
                <mat-radio-button value="text">Text</mat-radio-button>
              </mat-radio-group>
            </div>

            <!-- Buttons -->
            <div class="flex gap-4 mt-6">
              <button mat-raised-button color="primary" [disabled]="!form.valid">
                Submit
              </button>
              <button mat-stroked-button (click)="resetForm()">
                Reset
              </button>
              <button mat-button>
                Cancel
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Example 2: Native HTML with custom classes -->
      <mat-card>
        <mat-card-header>
          <mat-card-title>Native HTML with Custom Classes</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form class="space-y-4">
            <input class="custom-input" type="text" placeholder="Full name" />
            <input class="custom-input" type="email" placeholder="Email address" />
            <input class="custom-input" type="password" placeholder="Password" />

            <select class="custom-input">
              <option value="">Select a country</option>
              <option value="us">United States</option>
              <option value="uk">United Kingdom</option>
              <option value="ca">Canada</option>
              <option value="au">Australia</option>
            </select>

            <textarea class="custom-input" rows="4" placeholder="Your message"></textarea>

            <div class="flex gap-4">
              <button class="custom-button">Submit</button>
              <button class="custom-button custom-button-outline">Cancel</button>
              <button class="custom-button custom-button-ghost">Reset</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Theme toggle for testing -->
      <div class="fixed bottom-4 right-4">
        <button mat-fab (click)="toggleTheme()" class="custom-shadow-md">
          <mat-icon>{{ isDarkMode ? 'light_mode' : 'dark_mode' }}</mat-icon>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background-color: var(--color-background);
    }

    // Additional form field customizations for this component
    ::ng-deep {
      .mat-mdc-form-field-infix {
        min-height: auto;
        padding-top: 0.5rem !important;
        padding-bottom: 0.5rem !important;
      }

      // Remove the reserved space for floating label
      .mat-mdc-form-field-text-prefix,
      .mat-mdc-form-field-text-suffix {
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }

      // Adjust icon alignment
      .mat-mdc-form-field-icon-prefix,
      .mat-mdc-form-field-icon-suffix {
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
      }
    }
  `]
})
export class CustomFormExampleComponent {
  form: FormGroup;
  hidePassword = true;
  isDarkMode = false;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      country: [''],
      message: [''],
      terms: [false, Validators.requiredTrue],
      contactMethod: ['email']
    });

    // Check for system dark mode preference
    this.isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  resetForm() {
    this.form.reset();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }
}