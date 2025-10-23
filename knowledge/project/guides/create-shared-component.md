# Creating Shared Components

## Purpose
Guide for creating reusable UI components in the shared components library.

## Critical Rules

- ALWAYS place shared components under `src/app/shared/ui/`
- ALWAYS export from `src/app/shared/ui/index.ts`
- ALWAYS use standalone components with SFC pattern
- NEVER create shared components for single-use cases

## Steps

### 1. Create Component Structure
```
src/app/shared/ui/
  └── component-name/
      ├── component-name.component.ts
      └── index.ts
```

### 2. Create Component

<pattern>
// src/app/shared/ui/alert/alert.component.ts
@Component({
  selector: 'ui-alert',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="alert alert-{{ type() }}">
      <ng-content />
    </div>
  `,
  styles: [`
    .alert { padding: 1rem; border-radius: 4px; }
    .alert-info { background: #d1ecf1; }
    .alert-error { background: #f8d7da; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlertComponent {
  type = input<'info' | 'error'>('info');
}
</pattern>

### 3. Export Component
```typescript
// src/app/shared/ui/alert/index.ts
export * from './alert.component';

// src/app/shared/ui/index.ts
export * from './layout';
export * from './alert';  // Add this line
```

### 4. Use Component
```typescript
import { AlertComponent } from '@shared/ui';
```

## When to Share

- Used in 3+ places
- Common UI pattern (buttons, cards, modals)
- Part of design system

## When NOT to Share

- Single-use components
- Heavy business logic
- Page-level components

## Naming

- Folder: `kebab-case`
- Class: `PascalCaseComponent`
- Selector: `ui-kebab-case`