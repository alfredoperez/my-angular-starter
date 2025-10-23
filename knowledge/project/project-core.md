# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Angular starter template (v20) designed for creating demos, articles, talks, and presentations. It uses standalone components, signals, and modern Angular patterns with PrimeNG for UI components, TailwindCSS v4 for styling, and TanStack Query for data fetching.

## Package Manager

**Always use `pnpm`** for package management, not npm or yarn.

## Common Commands

### Development
- `pnpm run start` - Start development server (default port 4200)
- `pnpm run start-json-server` - Start mock API server on port 3000
- `pnpm run dev` - Run both dev server and JSON server concurrently

### Building
- `pnpm run build` - Production build
- `pnpm run watch` - Development build with watch mode
- `pnpm run stats` - Build with bundle analyzer stats

### Testing
- `pnpm test` - Run all Jest tests
- `pnpm test -- --watch` - Run tests in watch mode
- `pnpm test -- <file-path>` - Run specific test file
- `pnpm run test-coverage` - Run tests with coverage report

### Linting
- `pnpm run lint` - Lint TypeScript and HTML files
- `pnpm run lint:styles` - Lint SCSS/CSS files
- `pnpm run lint:styles:fix` - Fix style linting issues

### Storybook
- `pnpm run storybook` - Start Storybook on port 6006
- `pnpm run build-storybook` - Build Storybook static files

## Architecture

### Project Structure

```
src/app/
├── shared/          # Shared resources across domains
│   ├── data/        # Mock API interceptors, HTTP services
│   ├── ui/          # Reusable UI components
│   ├── utils/       # Utility functions
│   └── state/       # Shared state management
├── <domain>/        # Feature domains (e.g., users, home)
│   ├── data/        # Domain-specific data services
│   ├── shared/      # Domain-specific shared code
│   └── <page>/      # Page components
```

### Knowledge Base

### Module Architecture (Sheriff)

This project uses Sheriff for enforcing architectural boundaries. Configuration is in `sheriff.config.ts`:

- **Domains**: Feature areas like `users`, `home`
- **Types**: Layer types - `data`, `ui`, `containers`, `utils`, `state`
- **Tagging**: Files are auto-tagged based on path (e.g., `src/app/users/data` → `domain:users, type:data`)

**Rules:**
- Root can access any domain or shared resource
- Domains can only access same domain or shared resources
- `type:data` can only access `shared:data`
- `type:containers` (pages) can access all types within domain plus shared data/ui
- Shared modules can only access other shared modules

### Path Aliases

TypeScript path aliases configured in `tsconfig.json`:
- `@my/data` → `src/app/shared/data`
- `@my/ui` → `src/app/shared/ui`
- `@my/utils` → `src/app/shared/utils`
- `@my/users/*` → `src/app/users/*`

### Routing

- Uses lazy loading for all feature routes
- Feature routes defined in `<domain>/routes.ts` files
- Main routes in `src/app/app.routes.ts`

## Code Conventions

### Component Generation

Angular schematics configured for:
- **Inline templates and styles** by default
- **SCSS** for component styles
- **Skip tests** by default (tests created separately)
- **Prefix**: `app`

### Angular Patterns

- **Standalone components only** - no NgModules
- **Signals for state** - use `signal()`, `computed()`, `effect()`
- **Modern inputs/outputs**:
  - Use `input()` and `input.required()` instead of `@Input()`
  - Use `output()` instead of `@Output()`
  - Use `model()` for two-way binding
- **Dependency injection**: Use `inject()` function, not constructor injection
- **Method naming**: Prefix event handlers with `on` (e.g., `onAddUser()`, `onDeleteItem()`)
- **File naming**: kebab-case (e.g., `user-profile.component.ts`)
- **Named exports**: Prefer named exports over default exports

### Testing

- **Framework**: Jest with Testing Library
- **Pattern**: Arrange-Act-Assert
- **Structure**: Create a `describe` block for each public method
- **Coverage**: Test both happy path and error scenarios
- Uses `ng-mocks` for mocking Angular components/services
- Setup in `setup-jest.ts` includes Testing Library's jest-dom matchers

### Styling

- **Tailwind CSS v4**: Utility-first CSS framework
- **PrimeNG**: UI component library with Indigo preset
- **Dark mode**: Uses `.dark` class selector
- **CSS methodology**: Component-based BEM for custom styles
- **Variables**: SCSS variables in `src/styles/theme/_variables.scss`

### UI Libraries Configuration

**PrimeNG**:
- Theme: Aura preset with Indigo customization (defined in `app.config.ts`)
- Prefix: `a` (e.g., `<a-button>`)
- Input style: outlined
- Dark mode: `.dark` class selector
- CSS layers disabled for Tailwind v4 compatibility

**AG Grid**:
- Community version
- AllCommunityModule registered globally in `app.config.ts`

**TanStack Query**:
- Configured with devtools
- QueryClient provided globally

### Mock API

- Uses `json-server` with `db.json` for mocked REST API
- Runs on port 3000
- Can also use mock API interceptor in `src/app/shared/data/mock-api-interceptor/`

## Important Notes

- **TypeScript strict mode** is enabled
- **ESLint** with Sheriff plugin enforces architecture boundaries
- **Prettier** configured with plugins for:
  - Import sorting (`@trivago/prettier-plugin-sort-imports`)
  - Attribute organization (`prettier-plugin-organize-attributes`)
  - Tailwind class sorting (`prettier-plugin-tailwindcss`)
