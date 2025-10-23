# TypeScript Standards

## Purpose
TypeScript coding standards and type safety practices for Angular projects.

## Critical Rules

- ALWAYS use strict type checking
- ALWAYS prefer type inference when type is obvious
- NEVER use `any` type - use `unknown` when type is uncertain
- ALWAYS create type guards for complex runtime validation
- ALWAYS use union types for constrained values

## Type Safety

<pattern context="unknown-over-any">
function safeParse(json: string): unknown {
  return JSON.parse(json);
}

// Must narrow type before use
const result = safeParse('{"name": "John"}');
if (typeof result === 'object' && result !== null && 'name' in result) {
  console.log(result.name);
}
</pattern>

<pattern context="union-types">
type Status = 'pending' | 'active' | 'completed';

function setStatus(status: Status) {
  // Type-safe with autocomplete
}
</pattern>

## Anti-patterns

<avoid>
// NEVER use any
function badFunction(data: any) {
  return data.something(); // No safety
}

// NEVER use type assertions without validation
const user = data as User; // Unsafe

// NEVER disable strict checks
// @ts-ignore
const value = someUnsafeOperation();
</avoid>
