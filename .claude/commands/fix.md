---
name: fix
description: Fix code and log documentation task for later update
input_type: required
input_description: "Description of what to fix (e.g., 'use CSS classes from theme file')"
---

You are implementing a code fix and logging a documentation task.

## Guide

Follow the complete workflow documented at:
${file:knowledge-base/tools/commands/fix-command.md}

## Your Task

### 1. Implement the Fix
Based on the user's input: **{{INPUT}}**

- Analyze the current code context
- Identify files that need changes
- Apply the fix following project conventions in CLAUDE.md
- Ensure the fix is complete and functional

### 2. Log Documentation Task
After implementing the fix, append a new task to `knowledge-base/doc-updates.md`:

```markdown
- [ ] **[Brief description]** ({{TODAY}})
  - Fixed: [What was changed in the code]
  - Suggested location: [Where docs should be updated, if applicable]
  - Context: [Why this matters or pattern to document]
```

## Task Format Example

```markdown
- [ ] **Document CSS variable usage from theme files** (2025-10-02)
  - Fixed: Components now import CSS variables from `src/styles/theme/_variables.scss`
  - Suggested location: CLAUDE.md styling section
  - Context: Ensures consistency and makes theme changes easier
```

## Guidelines

- **Fix first**: Implement the code change completely
- **Be specific**: Describe exactly what was changed
- **Suggest location**: If you know where docs should go, mention it (optional)
- **Add context**: Explain why this should be documented
- **Use today's date**: Format as YYYY-MM-DD

The documentation update will be done later - focus on making the fix work correctly now.
