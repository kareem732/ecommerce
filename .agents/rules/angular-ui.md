---
trigger: always_on
---

---

trigger: model_decision
description: Apply whenever creating or modifying Angular templates, HTML, styling, layouts, forms, tables, dialogs, or other UI elements.
---

# Angular UI Standards

## Approved UI Technologies

- Use Tailwind CSS for layout, spacing, responsive behavior, flexbox, grid, typography, and utility styling.
- Use PrimeNG for UI components when a suitable PrimeNG component exists.
- Use the project's existing design system, theme, CSS variables, and design tokens.
- Reuse existing shared UI components before creating new ones.
- Do not introduce Bootstrap, Angular Material, or another UI framework unless explicitly required.

## Template Rules

- Inspect nearby templates and existing shared components before writing HTML.
- Prefer PrimeNG components for tables, dialogs, dropdowns, selects, date pickers, tooltips, buttons, and other supported interactive UI.
- Use semantic HTML and accessible labels, keyboard interactions, and appropriate ARIA attributes.
- Follow existing Angular template syntax and the installed Angular version.
- Keep templates readable and avoid unnecessary nested conditionals.

## Styling Rules

- Prefer Tailwind utility classes for standard layout and visual styling.
- Use existing theme tokens and shared styles instead of hardcoded colors and repeated values.
- Use component SCSS/CSS only when utilities and existing design-system capabilities are insufficient.
- Do not create new global styles for a local component requirement.
- Avoid !important, duplicated CSS, and arbitrary values when an existing token or utility is suitable.
- Follow the project's established RTL/LTR and responsive design conventions.

## Before Completion

- Verify that the UI is consistent with nearby screens and the existing design system.
- Check responsive behavior, loading states, empty states, validation errors, and disabled states where relevant.
- Confirm that no unnecessary UI library or duplicate component was introduced.
