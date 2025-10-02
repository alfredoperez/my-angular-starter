# Storybook Guide

## Purpose
Standards for creating Storybook stories and documentation for Angular components.

## Critical Rules

- ALWAYS create a `.stories.ts` file for every component
- ALWAYS use `tags: ['!autodocs']` to disable auto-generated docs
- ALWAYS match story title to feature/domain structure
- ALWAYS include most critical component states as separate stories
- ALWAYS use kebab-case for story file names matching component files
- NEVER use default exports for story objects (except meta)
- NEVER skip documentation for shared/reusable components

## Story File Structure

<pattern context="basic-story">
// component-name.stories.ts
import { Meta, StoryObj } from '@storybook/angular';
import { ComponentName } from './component-name.component';

const meta: Meta<ComponentName> = {
  title: 'Domain/Component Name',
  component: ComponentName,
  tags: ['!autodocs'],
};

export default meta;
type Story = StoryObj<ComponentName>;

export const Default: Story = {};
</pattern>

## Story Path Conventions

Story `title` must reflect the app's domain/feature structure:

<example>
// Feature domain components
title: 'Users/Users Page'        // src/app/users/users-page/
title: 'Home/Dashboard'          // src/app/home/dashboard/

// Shared UI components - match folder hierarchy
title: 'Shared/UI/Button'        // src/app/shared/ui/button/
title: 'Shared/UI/Layout/TopBar' // src/app/shared/ui/layout/top-bar/
title: 'Shared/UI/Table'         // src/app/shared/ui/table/

// Keep consistent with app structure
// src/app/{domain}/{component} → '{Domain}/{Component}'
// src/app/shared/ui/{component} → 'Shared/UI/{Component}'
</example>

## Component States

Include stories for the most important user-facing states:

<pattern context="common-states">
// Essential states - include what's relevant for your component
export const Default: Story = {};
export const Loading: Story = { args: { isLoading: true } };
export const Error: Story = { args: { error: 'Failed to load data' } };
export const Empty: Story = { args: { data: [] } };
export const Disabled: Story = { args: { disabled: true } };

// Visual variants
export const Primary: Story = { args: { variant: 'primary' } };
export const Secondary: Story = { args: { variant: 'secondary' } };

// Size variants
export const Small: Story = { args: { size: 'small' } };
export const Large: Story = { args: { size: 'large' } };
</pattern>

## Mock Data and Decorators

<pattern context="api-mocks">
// For components that fetch data - use setApiMocks decorator
import { setApiMocks } from '../../../../.storybook';
import { componentMocks as mocks } from './component.mocks';

export const Default: Story = {
  decorators: [setApiMocks([mocks.requests.data])],
};

export const LoadingState: Story = {
  decorators: [setApiMocks([{ ...mocks.requests.data, delay: 'infinite' }])],
};

export const ErrorState: Story = {
  decorators: [setApiMocks([{ ...mocks.requests.data, status: 500 }])],
};
</pattern>

## MDX Documentation

Create a separate `.stories.mdx` file for component documentation:

<pattern context="mdx-structure">
{/* component-name.stories.mdx */}
import { Meta, Canvas, Controls } from '@storybook/blocks';
import * as ComponentStories from './component-name.stories';

<Meta of={ComponentStories} />

# Component Name

Brief description of what the component does and when to use it.

## Usage

```typescript
import { ComponentName } from './component-name.component';

// Basic usage example
<app-component-name [prop]="value" />
```

## Examples

### Default
<Canvas of={ComponentStories.Default} />

### Loading State
<Canvas of={ComponentStories.Loading} />

### Error State
<Canvas of={ComponentStories.Error} />

## Props

<Controls of={ComponentStories.Default} />

## Best Practices

- When to use this component
- Common patterns and configurations
- Accessibility considerations
- Related components
</pattern>

## File Organization

<example>
// Keep stories and MDX with the component
src/app/
  users/
    users-page/
      users-page.component.ts
      users-page.stories.ts      // Story definitions
      users-page.stories.mdx     // Documentation (optional)
      users-page.mocks.ts        // Mock data for stories
      users-page.component.spec.ts
  shared/
    ui/
      button/
        button.component.ts
        button.stories.ts
        button.stories.mdx         // Shared components should have docs
        button.component.spec.ts
</example>

## Story Naming

Use PascalCase for story exports. Be descriptive but concise.

<example>
export const Default: Story = {};
export const WithIcon: Story = {};
export const Loading: Story = {};
export const Disabled: Story = {};
</example>

## Anti-patterns

<avoid>
// DON'T use relative titles or enable autodocs
title: '../Button'           // WRONG - use absolute path like 'Shared/UI/Button'
tags: ['autodocs']           // WRONG - use ['!autodocs']

// DON'T skip critical states for complex components
export const Default: Story = {};  // INCOMPLETE if component has loading/error states

// DON'T mismatch title with file structure
title: 'Components/Random/Button'  // WRONG
// Should be: 'Shared/UI/Button' to match src/app/shared/ui/button/
</avoid>

## When to Create Stories

**Create stories for:**
- All shared/reusable UI components
- Page components (for visual testing)
- Components with multiple visual states

**Skip stories for:**
- Utility components with no visual output
- One-off components used in a single location

## Running Storybook

```bash
pnpm run storybook              # Start development server (port 6006)
pnpm run build-storybook        # Build for production
```
