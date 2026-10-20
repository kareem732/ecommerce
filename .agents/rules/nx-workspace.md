---
trigger: model_decision
description: Apply when a task affects Nx project ownership, library imports, workspace structure, Module Federation, project tags, generators, or dependency boundaries.
---

# Nx Workspace and Module Federation

## Discover the owner first
- Identify the exact Nx project that owns the requested feature and inspect its `project.json`, tags, dependencies, and relevant public APIs.
- For existing workspace queries use the installed local Nx version and repository conventions; discover targets rather than assuming them.
- Respect `@nx/enforce-module-boundaries`, `enforceBuildableLibDependency`, project tags, and the constraints in `eslint.config.mjs`.

## Current workspace map (verify against current files)
- `shell` (`apps/shell`) is the Module Federation host.
- `adminDashboard` (`apps/adminDashboard`) and `roseApp` (`apps/roseApp`) are remotes.
- Shared libraries: `ui`, `auth-service`, `theme`, `shared-i18n`, and `shared` under `packages/`.
- Current scope constraints: `scope:shell` depends only on `scope:shell` and `scope:shared`; `scope:admin-dashboard` depends only on `scope:admin-dashboard` and `scope:shared`; `scope:rose-app` depends only on `scope:rose-app` and `scope:shared`; `scope:shared` depends only on `scope:shared`. Verify exact current rule configuration before relying on this summary.
- The inspected import aliases include `@org/ui`, `@org/auth-service`, `@org/theme`, and `@org/shared-i18n`.

## Boundaries
- Never import private source files across application roots. Use approved library entry points and public APIs.
- Do not import remote application source into the host simply because it appears to be a convenient component-sharing mechanism; preserve the established Module Federation setup.
- If a dependency is disallowed by current tags, do not bypass lint. Explain the boundary issue and make only a justified, verified configuration change when the task requires it.
- Keep app-specific business features in their owning app. Promote code into a shared library only when there is a real reuse/ownership case.
- Do not create a new library, move code, change tags, or rewrite federation configuration for a local feature task without a concrete requirement.
- Follow existing Nx generators and import aliases rather than creating a second project convention.

## Verification
- Run lint for affected project(s) after changing imports, tags, project config, or public APIs.
- If project-boundary config changes, inspect both the config diff and affected consumer imports. Do not report boundaries as verified unless relevant checks ran.
