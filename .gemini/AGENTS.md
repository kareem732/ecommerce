# Global Software Engineering Rules

## 1. Understand Before Implementing

- Inspect the repository before changing code.
- Identify the framework, package manager, architecture, conventions, and relevant dependencies.
- Read the project's AGENTS.md, README.md, and relevant configuration files.
- Inspect similar features and existing reusable components before implementing anything.
- Never assume a file, component, service, API endpoint, or dependency exists without verifying it.

## 2. Preserve Existing Architecture

- Follow the existing project structure and naming conventions.
- Reuse existing components, services, utilities, hooks, directives, pipes, types, and design tokens.
- Extend existing abstractions when appropriate instead of duplicating functionality.
- Do not introduce a new architecture, library, dependency, or design pattern without a concrete reason.
- Do not perform unrelated refactoring while implementing a task.

## 3. Implementation Quality

- Write readable, maintainable, modular, and type-safe code appropriate to the project's language.
- Follow SOLID principles where applicable without overengineering.
- Keep business logic separate from presentation when the existing architecture supports it.
- Avoid duplicated code, unnecessary abstractions, dead code, and unexplained magic values.
- Handle loading, success, empty, error, and relevant edge states.

## 4. Task Execution

- Translate the task into concrete acceptance criteria.
- Inspect the relevant implementation before deciding how to change it.
- Identify dependencies and potential regressions.
- Implement the smallest complete solution that satisfies the requirements.
- Verify the result using available lint, type-check, build, and test commands.
- Fix issues introduced by your changes.

## 5. Safety and Scope

- Never overwrite existing work without inspecting it.
- Never discard user changes or reset unrelated files.
- Never expose secrets, tokens, credentials, or sensitive environment variables.
- Never claim a test, build, or command succeeded unless it was actually executed and verified.
- Do not deploy, push, or perform destructive operations unless explicitly authorized.

## 6. Completion Report

- Summarize what was implemented.
- List the important files changed and explain why.
- Report the checks actually executed and their results.
- Disclose remaining issues, assumptions, and unverified behavior.

# Mandatory Task Execution Protocol

For every implementation task, follow this process.

## Phase 1: Understand

1. Read the task and identify its expected behavior.
2. Extract functional requirements and acceptance criteria.
3. Inspect the relevant source files, existing implementation, and related tests.
4. Identify reusable components, services, utilities, API clients, and design-system elements.
5. Identify dependencies, architectural constraints, and potential regressions.

## Phase 2: Plan

1. Decide which existing files should be modified.
2. Identify any new files that are genuinely necessary.
3. Prefer extending existing abstractions over creating duplicates.
4. If requirements conflict with existing architecture, identify the conflict before proceeding.
5. Ask a focused question only if a missing decision blocks a safe, correct implementation.

## Phase 3: Implement

1. Implement the requested behavior using project-specific rules.
2. Reuse existing components and established patterns.
3. Preserve unrelated behavior and avoid scope creep.
4. Follow existing accessibility, responsive design, security, and error-handling standards.
5. Do not leave placeholder implementations or unfinished code unless explicitly requested.

## Phase 4: Verify

1. Inspect the final diff.
2. Run relevant tests and available lint, type-check, and build commands.
3. Fix failures caused by the implementation.
4. Distinguish pre-existing failures from newly introduced failures.
5. If a check cannot run, explain why. Never claim unexecuted checks passed.

## Phase 5: Report

Provide:

- Implemented functionality.
- Files changed and reasons.
- Reusable components or services leveraged.
- Commands executed and actual results.
- Remaining limitations or blockers.

# Angular + Nx Workspace Instructions

This repository uses Angular within an Nx workspace. These instructions describe how to work here; inspect the actual repository to discover its concrete architecture and versions.

## Required approach for every task

1. Translate the request into observable acceptance criteria.
2. Inspect `git status --short`, the root `package.json`, `nx.json`, `project.json` files, relevant `tsconfig` files, and the affected feature's code.
3. Identify the owning Nx project and its library boundaries. Use Nx project/dependency information and existing import conventions.
4. Search for reusable components, services, directives, pipes, form controls, models, API clients, design tokens, and similar features.
5. Implement the smallest coherent change that satisfies the task and acceptance criteria.
6. Verify the diff and run appropriate existing checks.
7. Report what changed, what was tested, and any limitations.

## Workspace architecture

- Follow the repository's actual folder structure, project names, library boundaries, and public APIs.
- Use existing Nx generators and repository scripts when they are the established approach.
- Respect tags, dependency constraints, and module boundaries configured in Nx.
- Do not import another library's private/internal files when its public entry point is intended.
- Do not move files or reorganize libraries unless the task requires it.
- Do not create a new shared library or generic abstraction for a one-off use case without a clear reuse requirement.

## Angular conventions

- Check the installed Angular version and existing patterns before using framework APIs.
- Prefer standalone components and modern Angular APIs only when compatible with the installed version and repository conventions.
- Use Signals for suitable local synchronous state and RxJS for asynchronous streams and stream composition; follow the project's established state-management approach.
- Use typed forms and API contracts where supported by the current project.
- Avoid memory leaks, unnecessary subscriptions, duplicate requests, and needless change-detection work.
- Reuse existing interceptors, guards, resolvers, validators, error handlers, and API services.
- Do not introduce a new state-management library or UI framework unless explicitly requested or clearly justified.

## UI policy

- For Angular template and UI tasks, use Tailwind CSS for layout and styling utilities and PrimeNG for suitable interactive UI components.
- Reuse existing shared UI components and the project's theme/design tokens before creating new UI.
- Do not add Bootstrap, Angular Material, or another UI framework unless explicitly required.
- Component CSS/SCSS is allowed when Tailwind and existing design-system capabilities are insufficient; keep it scoped and avoid duplicating global styles.
- Follow existing RTL/LTR, localization, accessibility, and responsive design conventions.

## API and security

- Inspect the existing API contract, DTOs, auth flow, and error handling before integration.
- Never invent endpoint paths, payload properties, or response types.
- Follow existing authentication and authorization patterns; do not treat client-side role checks as the security boundary.
- Do not hardcode credentials or expose secrets.

## Verification

- Discover valid project targets with the installed Nx CLI and repository scripts rather than guessing.
- Run focused tests/lint/type checks/build for the affected project where available.
- Use the repository's existing package manager and lockfile.
- Do not fix unrelated pre-existing failures unless requested.
