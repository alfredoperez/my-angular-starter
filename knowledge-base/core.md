# Knowledge Base Core

## Purpose
Central index and standards for our AI-optimized knowledge base system.

## Structure Overview

### /code-style
Framework and language-specific patterns that are project-agnostic.
- Split by framework/tool (angular/, testing/, etc.)
- Each file focuses on one aspect (components, services, etc.)

### /project
Project-specific implementations and patterns.
- /core - Architecture and technical specs
- /code-style - Project conventions
- /guides - Step-by-step implementations

### /tools
AI tool configurations and templates.
- /agents - Specialized agent definitions
- /commands - Quick command definitions
- /modes - Tool-specific modes

## File Standards

### Naming
- Use kebab-case: `component-patterns.md`
- Be specific and searchable
- Avoid generic names like `guide.md` or `rules.md`

### Size Guidelines
- Target 100-500 lines per file
- Split large topics into multiple files
- Link related files rather than duplicate

### XML Tag Usage
- `<example>` - Code examples showing correct implementation
- `<pattern>` - Reusable patterns with context
- `<avoid>` - Anti-patterns to explicitly avoid
- Only use tags for code that must be followed exactly

## Quick Reference
- Common patterns: `code-style/[framework]/`
- Project guides: `project/guides/`
- Agent configs: `tools/agents/`