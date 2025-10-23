# Angular Development Guide

You are an expert in TypeScript, Angular, and scalable web application development. You write maintainable, performant, and accessible code following Angular and TypeScript best practices.

## Quick Reference

This guide is organized into focused topic areas. Navigate to specific guides for detailed patterns and examples:

- **[TypeScript Standards](./typescript-guide.md)** - Type safety, strict checking, and TypeScript best practices
- **[Angular Framework Practices](./angular-practices.md)** - Standalone components, lazy loading, host bindings, and framework conventions
- **[Components](./components-guide.md)** - Component architecture, inputs/outputs, OnPush, and single file components
- **[State Management](./state-management-guide.md)** - Signals, computed values, and reactive state patterns
- **[Templates](./templates-guide.md)** - Control flow syntax, bindings, async pipe, and template best practices
- **[Services](./services-guide.md)** - Dependency injection, service design, and API patterns

## Core Principles

### Modern Angular (v20+)
- Standalone components (default, no NgModules)
- Signals-first approach for state management
- Native control flow (`@if`, `@for`, `@switch`)
- inject() function over constructor injection

### Type Safety
- Strict TypeScript checking enabled
- Prefer type inference for obvious types
- Use `unknown` instead of `any`
- Type guards for runtime safety

### Component Design
- Single responsibility, small and focused
- OnPush change detection strategy
- Signals for state, computed for derived values
- Inline templates for simple components

### Performance
- Lazy loading for all feature routes
- NgOptimizedImage for static images
- Pure, immutable state transformations
- Minimal template logic

## Quick DO/DON'T Checklist

### DO
- Use standalone components
- Use signals for reactive state
- Use `inject()` for dependency injection
- Use `@if`, `@for`, `@switch` for control flow
- Use `class` and `style` bindings
- Use `input()` and `output()` functions
- Use `providedIn: 'root'` for services
- Use Reactive forms
- Keep state transformations pure

### DON'T
- Set `standalone: true` explicitly (it's the default)
- Use `@HostBinding` or `@HostListener` decorators
- Use `*ngIf`, `*ngFor`, `*ngSwitch` (old syntax)
- Use `ngClass` or `ngStyle`
- Use `@Input()` or `@Output()` decorators
- Use `any` type
- Use `mutate()` on signals
- Put complex logic in templates
- Use constructor injection

## File Structure Overview

```
src/app/
├── shared/              # Cross-domain resources
│   ├── data/            # HTTP services, interceptors
│   ├── ui/              # Reusable components
│   ├── utils/           # Helper functions
│   └── state/           # Shared state services
│
├── <feature>/           # Feature domains (users, products, etc.)
│   ├── data/            # Feature-specific services
│   ├── shared/          # Feature-specific utilities
│   └── <page>/          # Page components
│       ├── page.component.ts
│       └── page.models.ts
```

## Convention Examples

### Component Example
```typescript
@Component({
  selector: 'app-user-card',
  imports: [CommonModule],
  template: `
    <div class="user-card">
      @if (user()) {
        <h3>{{ user().name }}</h3>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserCardComponent {
  user = input.required<User>();
  select = output<User>();
}
```

### Service Example
```typescript
@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getUsers() {
    return this.http.get<User[]>('/api/users');
  }
}
```

### State Management Example
```typescript
export class TodoComponent {
  todos = signal<Todo[]>([]);
  completed = computed(() =>
    this.todos().filter(t => t.completed)
  );

  addTodo(title: string) {
    this.todos.update(todos => [...todos, {
      id: Date.now(),
      title,
      completed: false
    }]);
  }
}
```

---

For detailed patterns, anti-patterns, and comprehensive examples, navigate to the specific guide files listed above.
