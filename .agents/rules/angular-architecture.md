---
trigger: always_on
---

---

trigger: model_decision
description: Apply to Angular tasks involving components, services, routing, state management, forms, architecture, or refactoring.
---

# Angular Engineering Standards

## Architecture

- Inspect the existing Angular version, workspace configuration, and project structure before coding.
- Follow the current architecture. In Nx workspaces, respect project boundaries, library ownership, and existing import conventions.
- Reuse existing services, shared components, directives, pipes, utilities, models, and feature abstractions.
- Do not create duplicate implementations of existing functionality.
- Follow the repository's established naming and file organization conventions.

## Modern Angular

- Follow the Angular version installed in the project; do not assume the latest APIs are available.
- Prefer standalone components and Angular Signals when consistent with the existing architecture.
- Use RxJS for asynchronous streams and operators where stream composition is appropriate.
- Avoid unnecessary subscriptions and ensure subscriptions have appropriate cleanup.
- Use OnPush-compatible, efficient rendering patterns where appropriate.
- Use lazy loading for feature routes when it fits the existing routing architecture.
- Avoid introducing NgRx or another state-management library unless the project already uses it or the task requires it.

## Components and Services

- Keep components focused on presentation and feature coordination.
- Move reusable business logic and API operations into the appropriate existing services or domain abstractions.
- Prefer typed inputs, outputs, forms, API models, and service contracts.
- Use dependency injection according to established project conventions.
- Avoid giant components and unnecessary generic abstractions.

## Forms and API Integration

- Inspect existing form utilities, validators, interceptors, error handling, and API services before implementation.
- Reuse shared form controls and validation patterns.
- Follow existing authentication, authorization, and error-handling mechanisms.
- Preserve API contracts and existing behavior unless the task explicitly requires changes.
