# Angular Templates

## Purpose
Angular template syntax best practices and modern control flow patterns.

## Critical Rules

- ALWAYS keep templates simple and avoid complex logic
- ALWAYS use native control flow (`@if`, `@for`, `@switch`) instead of structural directives
- ALWAYS use async pipe for observables
- ALWAYS prefer Reactive forms over Template-driven forms
- NEVER use `ngClass` - use `class` bindings instead
- NEVER use `ngStyle` - use `style` bindings instead
- NEVER forget `track` in `@for` loops

## Control Flow

<pattern context="if-else">
@if (isLoading()) {
  <div class="spinner">Loading...</div>
} @else if (hasError()) {
  <div class="error">{{ errorMessage() }}</div>
} @else {
  <div class="content">{{ data() }}</div>
}
</pattern>

<pattern context="for-loops">
@for (item of items(); track item.id) {
  <div class="item">{{ item.name }}</div>
} @empty {
  <div class="empty-state">No items found</div>
}
</pattern>

<pattern context="switch-case">
@switch (status()) {
  @case ('pending') {
    <span class="badge badge-warning">Pending</span>
  }
  @case ('active') {
    <span class="badge badge-success">Active</span>
  }
  @default {
    <span class="badge">Unknown</span>
  }
}
</pattern>

## Bindings

<pattern context="class-bindings">
// Single class
<button [class.active]="isActive()">Click me</button>

// Multiple classes
<div [class]="{
  'card': true,
  'card-highlighted': isHighlighted(),
  'card-disabled': isDisabled()
}">
  Content
</div>
</pattern>

<pattern context="style-bindings">
// Style with units
<div [style.width.px]="width()" [style.height.px]="height()">
  Content
</div>

// Multiple styles
<div [style]="{
  'width.px': width(),
  'background-color': bgColor()
}">
  Content
</div>
</pattern>

## Anti-patterns

<avoid>
// NEVER use old structural directives
<div *ngIf="condition">Content</div>
<div *ngFor="let item of items">{{ item }}</div>

// NEVER use ngClass or ngStyle
<div [ngClass]="classes">Content</div>
<div [ngStyle]="styles">Content</div>

// NEVER forget track in @for
@for (item of items(); track item) { <!-- Should use item.id -->
  <div>{{ item }}</div>
}

// NEVER put complex logic in templates
{{ user() ? user().profile ? user().profile.name : 'Guest' : 'Anonymous' }}
</avoid>
