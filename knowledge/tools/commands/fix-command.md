# Fix Command Guide

## Overview

The `/fix` command is a dual-purpose tool that:
1. **Immediately implements** a code fix based on user description
2. **Logs a documentation task** to track knowledge base updates needed

This ensures fixes are applied quickly while maintaining a backlog of documentation improvements.

## When to Use

Use `/fix` when:
- You need to correct an implementation issue in code
- The fix represents a pattern or practice that should be documented
- You want to defer documentation updates while continuing development

## Command Syntax

```
/fix <description of what to fix>
```

**Examples:**
```
/fix use CSS classes from theme/_variables.scss instead of hardcoded colors
/fix implement proper error handling with try-catch blocks
/fix use inject() instead of constructor injection
/fix add OnPush change detection to all components
```

## Workflow

### 1. Implement the Fix
- Claude analyzes the description and current code context
- Identifies files that need modification
- Applies the fix immediately following project conventions
- Verifies the fix works (runs build/tests if appropriate)

### 2. Log the Documentation Task
- Appends a new task to `knowledge-base/doc-updates.md`
- Includes:
  - Checkbox for tracking completion
  - Clear description of what was fixed
  - Timestamp of when the fix was made
  - Suggested documentation location (if applicable)
  - Context about why this matters

## Task Entry Format

Each logged task follows this structure:

```markdown
- [ ] **Brief description of fix** (YYYY-MM-DD)
  - Fixed: What was changed in the code
  - Suggested location: Where docs should be updated
  - Context: Why this pattern should be documented
```

### Example Entries

```markdown
- [ ] **Document CSS variable usage from theme files** (2025-10-02)
  - Fixed: Components now import CSS variables from `src/styles/theme/_variables.scss`
  - Suggested location: CLAUDE.md styling section or `knowledge-base/code-style/angular/`
  - Context: Ensures consistency and makes theme changes easier

- [ ] **Document inject() pattern over constructor injection** (2025-10-02)
  - Fixed: UserService now uses inject() function for dependencies
  - Suggested location: `knowledge-base/code-style/angular/services-guide.md`
  - Context: Modern Angular pattern, more flexible and testable
```

## Documentation Update Process

Tasks logged in `knowledge-base/doc-updates.md` should be processed periodically:

1. Review accumulated tasks
2. Group related tasks together
3. Update appropriate documentation files
4. Check off completed tasks
5. Archive or remove old completed tasks

## Creating Similar Commands

This pattern can be adapted for other "do now, document later" workflows:

**Key components:**
1. Command file in `.claude/commands/` with required input
2. Reference guide in `knowledge-base/tools/commands/`
3. Task log file for tracking follow-up work
4. Clear task format with checkboxes

**Template structure:**
```markdown
---
name: command-name
description: Brief description
input_type: required
input_description: "What user should provide"
---

Follow the guide at:
${file:knowledge-base/tools/commands/command-name.md}

[Additional command-specific instructions]
```

## Benefits

- **Speed**: Fixes are applied immediately without context switching
- **Memory**: Nothing gets forgotten - all improvements are tracked
- **Prioritization**: Documentation updates can be batched and prioritized
- **Patterns**: Repeated fixes highlight important patterns to document
- **Collaboration**: Clear tasks make it easy for others to contribute docs

## Related Commands

- `/create-shared-component` - Creates components following documented patterns
- Other commands can reference this guide for similar "action + logging" patterns
