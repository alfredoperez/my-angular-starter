# Angular Framework Practices

## Purpose
Framework-level Angular conventions and architectural patterns for modern Angular applications.

## Critical Rules

- ALWAYS use standalone components (no NgModules)
- NEVER set `standalone: true` explicitly - it's the default
- ALWAYS use signals for state management
- ALWAYS implement lazy loading for feature routes
- NEVER use `@HostBinding` and `@HostListener` decorators - use `host` object instead
- ALWAYS use `NgOptimizedImage` for static images (not base64)

## Host Bindings

<pattern context="host-object">
@Component({
  selector: 'app-button',
  host: {
    '(click)': 'onClick()',
    '[class.active]': 'isActive()',
    '[attr.aria-pressed]': 'isActive()',
    'role': 'button'
  },
  template: `<ng-content />`
})
export class ButtonComponent {
  isActive = signal(false);
  onClick() {
    this.isActive.update(v => !v);
  }
}
</pattern>

## Lazy Loading

<pattern context="feature-routes">
// app.routes.ts
export const routes: Routes = [
  {
    path: 'users',
    loadChildren: () => import('./users/routes').then(m => m.USERS_ROUTES)
  }
];

// users/routes.ts
export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./users-page/users-page.component')
      .then(m => m.UsersPageComponent)
  }
];
</pattern>

## Anti-patterns

<avoid>
// NEVER use NgModules
@NgModule({
  declarations: [FeatureComponent]
})
export class FeatureModule {}

// NEVER set standalone explicitly
@Component({
  standalone: true, // Redundant
  template: `...`
})

// NEVER use decorator-based host bindings
@HostBinding('class.active') active = true;
@HostListener('click') onClick() {}
</avoid>
