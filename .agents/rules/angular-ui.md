---
trigger: model_decision
description: Apply whenever creating or modifying Angular templates, HTML, styling, SCSS, layouts, forms, tables, dialogs, or other UI elements in Rose App.
---

# Angular UI & Styling Standards

## 1. Mandatory Styling Policy

### Preferred Styling Technologies
**Tailwind CSS and PrimeNG are the default and preferred styling tools for Rose App.**

Agents MUST:
- Use Tailwind utility classes for layout, spacing, sizing, alignment, responsive behavior, typography, borders, and other supported styling needs.
- Use existing PrimeNG components and their supported styling APIs for UI controls and interactive components.
- Follow the installed Tailwind and PrimeNG versions and the existing project configuration.
- Reuse existing semantic design tokens and theme variables.
- Preserve the existing design system and light/dark theme behavior.
- Prefer existing shared utilities and patterns over introducing new styling abstractions.
- Agents MUST NOT choose SCSS simply because it is familiar, convenient, or was used in a previous implementation.

### SCSS is Exceptional, Not the Default
SCSS MUST NOT be introduced for ordinary component styling when Tailwind CSS and PrimeNG can adequately implement the requirement.

SCSS is permitted ONLY when a genuine technical requirement cannot be implemented cleanly and reliably with the existing Tailwind and PrimeNG capabilities.

Potentially justified exceptions include (these are examples, not automatic exemptions):
- Complex third-party component internals that cannot be styled adequately through supported theme APIs or utility classes.
- Complex selectors or browser behavior that cannot reasonably be expressed using the established styling approach.
- A verified technical limitation requiring component-specific stylesheet rules.

Before adding SCSS, the agent MUST:
1. Identify the specific styling requirement.
2. Explain why Tailwind and PrimeNG alone are insufficient.
3. Check existing utilities, tokens, theme APIs, and shared styles for an alternative.
4. Keep the SCSS limited to the minimum necessary rules.
5. Avoid duplicating styles already provided by Tailwind or PrimeNG.

Do not create an SCSS file merely because a component needs styling.
Do not rewrite existing SCSS indiscriminately. Modify legacy styling only when relevant to the requested task or when explicitly asked to refactor it.

---

## 2. Shared Styles and Reuse (`apps/roseApp/src/styles`)

The shared styling source for Rose App is:
`apps/roseApp/src/styles`

When a styling pattern is used, or is reasonably expected to be reused, across multiple components or features, agents SHOULD centralize it in the existing shared styling system.

Examples include:
- Reusable design tokens.
- Semantic colors and surface styles.
- Shared typography conventions.
- Repeated component utilities.
- Common layout patterns.
- Reusable application-wide visual conventions.

Before creating a shared style, inspect existing files (`_primitives.scss`, `_semantic.scss`, `index.scss`) and reuse the established structure.

Rules:
- Extend the appropriate existing shared style or token file instead of creating parallel styling systems.
- Follow the naming conventions already used by the project.
- Reuse semantic tokens instead of hardcoding color values.
- Keep shared styles focused on genuine reuse.
- Ensure shared styles are imported through the existing application styling entry point where required.
- Use shared utilities through Tailwind or the existing supported styling mechanism.
- Do not introduce global CSS selectors that unintentionally affect unrelated components.
- Do not create a shared abstraction for a style used only once without a clear reason.

If a new design token is necessary, add it to the appropriate existing shared token file and use it consistently.

---

## 3. PrimeNG and Tailwind Responsibilities

Follow this strict priority order:
1. **Existing application design tokens and theme configuration**: Semantic CSS variables (`--color-primary`, `--bg-surface`, `--text-primary`, etc.) and PrimeNG theme presets.
2. **PrimeNG component APIs and supported theming/styling mechanisms**: Component props, pass-through (pt) options, and theme customization.
3. **Tailwind utilities**: For layout, spacing, flexbox, grid, sizing, and component presentation.
4. **Shared application styles**: For patterns reused across multiple locations in `apps/roseApp/src/styles`.
5. **Minimal component-specific SCSS**: ONLY when technically necessary after verifying that steps 1–4 are insufficient.

Rules:
- Avoid competing styling mechanisms for the same property.
- Do not introduce additional styling libraries, dependencies, or a second design system without explicit approval.
- Do not use unsupported PrimeNG internal selectors when a stable public API or documented styling mechanism exists.
- Avoid `!important`, duplicated CSS, and arbitrary values when an existing token or utility is suitable.

---

## 4. Antigravity Workflow Enforcement

For every future UI implementation task, agents MUST:
1. **Read instructions**: Review applicable project AI instructions before editing.
2. **Inspect existing code**: Inspect the relevant existing components, templates, and styles.
3. **Check available tools**: Check for existing Tailwind utilities, PrimeNG patterns, shared styles, and design tokens.
4. **Default to Tailwind & PrimeNG**: Implement the requested UI using Tailwind utility classes and PrimeNG components by default.
5. **Centralize genuine reuse**: Add shared styling in `apps/roseApp/src/styles` only when reuse justifies it.
6. **Justify SCSS**: Use SCSS only after establishing and documenting a genuine technical necessity via the 5-step checklist.
7. **Verify compatibility**: Verify responsive behavior, theme compatibility (dark/light), RTL/LTR conventions, and visual consistency.
8. **Review diff**: Review the final diff for unnecessary stylesheet files, duplicated declarations, hardcoded colors, and violations of this policy.

---

## 5. Template and Accessibility Standards

- Inspect nearby templates and existing shared components (`@org/ui`) before writing HTML.
- Prefer PrimeNG components for tables, dialogs, dropdowns, selects, date pickers, tooltips, buttons, and other supported interactive UI.
- Use semantic HTML and accessible labels, keyboard interactions, visible focus states, and appropriate ARIA attributes.
- Follow existing Angular template syntax and the installed Angular version.
- Keep templates readable and avoid unnecessary nested conditionals.
- Follow the project's established RTL/LTR and responsive design conventions.
- Verify loading states, empty states, validation errors, and disabled states where relevant.
