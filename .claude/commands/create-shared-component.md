---
name: create-shared-component
description: Create a new shared UI component following project standards
input_type: required
input_description: "Component name (e.g., loading-spinner, data-card)"
---

You are creating a new shared UI component for this Angular project.

## Instructions

Follow the guide at:
${file:knowledge-base/project/guides/create-shared-component.md}

## Your Task

1. Create the component folder under `src/app/shared/ui/{{INPUT}}/`
2. Create a standalone component with SFC pattern
3. Add index.ts to the component folder
4. Export from `src/app/shared/ui/index.ts`

## Component Requirements

- Use modern Angular features (signals, standalone, OnPush)
- Keep it minimal - can be enhanced later
- Follow naming conventions (kebab-case folder, PascalCase class)
- Include basic styling inline
- Make it reusable and generic

## Example Structure

For input "alert-box", create:
```
src/app/shared/ui/
  └── alert-box/
      ├── alert-box.component.ts
      └── index.ts
```

With component selector: `ui-alert-box`
And class name: `AlertBoxComponent`

Start with a minimal, functional implementation that can be extended as needed.