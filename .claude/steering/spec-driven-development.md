# Spec-Driven Development Workflow

## Core Principle

Follow the complete spec-driven development workflow for all significant features. The workflow consists of: Requirements → Design → Tasks → Implementation → Testing.

## Mandatory Workflow Steps

### 1. Requirements Phase
Use the `spec-requirements` agent to create comprehensive requirements documentation. The requirements document MUST include:
- Feature overview and business goals
- User stories and acceptance criteria
- Non-functional requirements
- Dependencies and constraints

### 2. Design Phase
Use the `spec-design` agent to create detailed design documentation. During the design phase:

**CRITICAL: Leverage Specialized Agents**
- **Angular Development**: ALWAYS invoke the `angular-core-expert` agent when designing Angular components, services, directives, or any Angular-specific architecture
- **Testing Strategy**: ALWAYS invoke the `test-generator` agent when designing the testing approach to ensure comprehensive test coverage planning
- **Storybook Integration**: ALWAYS invoke the `storybook-creator` agent to plan Storybook story requirements

The design document MUST incorporate input from these specialized agents and include:
- Architecture diagrams (using Mermaid)
- Component interfaces and responsibilities
- Data models and data flow
- Business process flows
- Error handling strategy
- **Testing Strategy section** (with input from test-generator agent)
- **Storybook Requirements section** (with input from storybook-creator agent)

### 3. Storybook Requirements (Mandatory)

**CRITICAL**: Every feature that includes UI components MUST specify Storybook story requirements in the design document.

When designing UI features:
1. Identify all components that will be created or modified
2. For each component, specify in the design document:
   - Required story variants (Default, Loading, Error, Empty, etc.)
   - Interactive states to demonstrate
   - Props/inputs to make configurable via controls
   - Edge cases to showcase

3. During the design phase, consult the `storybook-creator` agent to:
   - Review component designs for story-worthiness
   - Identify key states and variations to demonstrate
   - Plan story structure and organization
   - Ensure alignment with project Storybook patterns

**Rationale**: Storybook stories serve as both documentation and integration tests. By planning them during the design phase, we ensure components are designed with testability and demonstrability in mind.

### 4. Tasks Phase
Use the `spec-tasks` agent to break down the design into implementable tasks. Tasks MUST include:

**For Angular Development Tasks**:
- Clearly marked Angular-specific tasks (components, services, routing, etc.)
- Note: These tasks will be handled by the `angular-core-expert` agent during implementation

**For Testing Tasks**:
- Unit test creation tasks for each component/service
- Integration test requirements
- Note: These tasks will be handled by the `test-generator` agent during implementation

**For Storybook Tasks** (MANDATORY):
- Story creation tasks for each UI component
- Story variants and states to implement
- Note: These tasks will be handled by the `storybook-creator` agent during implementation

### 5. Implementation Phase
Use the `spec-impl` agent for implementation. During implementation:

**CRITICAL: Agent Collaboration**
- When implementing Angular tasks, the `spec-impl` agent MUST invoke the `angular-core-expert` agent
- When implementing tests, the `spec-impl` agent MUST invoke the `test-generator` agent
- When implementing Storybook stories, the `spec-impl` agent MUST invoke the `storybook-creator` agent

**Integration Testing with Storybook**:
- All UI components MUST have corresponding Storybook stories created
- Stories MUST demonstrate all critical states and variations identified in the design phase
- Stories serve as visual regression test targets and component documentation
- Stories MUST be completed before marking implementation tasks as done

### 6. Testing Phase
Use the `spec-test` agent to create comprehensive test documentation and test code. The testing phase MUST include:

**Unit Tests**:
- Component behavior tests (using test-generator agent)
- Service logic tests (using test-generator agent)
- Utility function tests (using test-generator agent)

**Integration Tests** (via Storybook):
- Verify all Storybook stories render correctly
- Test component interactions within stories
- Validate different states and error conditions
- Stories created by storybook-creator agent serve as integration test fixtures

## Agent Invocation Rules

### During Design Phase
When creating a design document, the `spec-design` agent MUST:
1. Invoke `angular-core-expert` for Angular architecture decisions
2. Invoke `test-generator` to plan testing strategy
3. Invoke `storybook-creator` to identify story requirements
4. Incorporate feedback from all agents into the design document

### During Implementation Phase
When implementing tasks, the `spec-impl` agent MUST:
1. Identify task type (Angular, Testing, Storybook, Other)
2. For Angular tasks: invoke `angular-core-expert`
3. For testing tasks: invoke `test-generator`
4. For Storybook tasks: invoke `storybook-creator`
5. Never complete a UI implementation without corresponding Storybook stories

### During Testing Phase
When creating tests, the `spec-test` agent MUST:
1. Invoke `test-generator` for unit test creation
2. Verify all Storybook stories exist and function as integration tests
3. Document story-based integration tests in test documentation

## Storybook as Integration Testing

**Philosophy**: In this project, Storybook stories are the PRIMARY integration testing mechanism for UI components.

**Requirements**:
- Every UI component MUST have Storybook stories
- Stories MUST demonstrate all critical component states
- Stories MUST be runnable and verifiable
- Stories serve as living documentation and visual regression test targets

**Benefits**:
- Component behavior is visually testable
- Stories provide immediate feedback on component changes
- Stories serve as development sandbox
- Stories enable visual regression testing
- Stories document component API and usage patterns

## Quality Gates

Each phase requires explicit approval before proceeding:
1. Requirements approved → proceed to Design
2. Design approved (with specialized agent input) → proceed to Tasks
3. Tasks approved → proceed to Implementation
4. Implementation complete (including Storybook stories) → proceed to Testing
5. Testing complete → feature done

## Document Structure

All spec documents MUST be stored in: `.claude/specs/{feature-name}/`
- `requirements.md` - Feature requirements
- `design.md` - Technical design (with testing and Storybook sections)
- `tasks.md` - Implementation tasks (including Storybook story tasks)
- `test.md` - Test documentation

## Non-Negotiables

1. **Never skip phases** - Each phase builds on the previous
2. **Always use specialized agents** - Angular, Testing, and Storybook agents MUST be consulted during their respective phases
3. **Storybook stories are mandatory** - No UI feature is complete without Storybook stories
4. **Integration testing through Storybook** - Stories are the integration test mechanism, not separate test files
5. **Explicit approval required** - Each phase requires user sign-off before proceeding
6. **Comprehensive documentation** - All decisions and rationales must be documented in spec files
