---
trigger: glob
globs: "**/*.html"
description: Apply when editing Angular HTML templates.
---

# Angular HTML Template Rules

- Use Tailwind CSS utilities for standard layout/styling and suitable PrimeNG components for interactive UI, following `.agents/rules/angular-ui.md`.
- Search for existing `@org/ui` components and established template patterns before adding markup.
- Keep business logic in TypeScript/services, not templates; avoid large nested conditions and duplicated markup.
- Use template syntax compatible with the installed Angular version.
- Preserve bindings, event semantics, translation keys, and loading/error states.
- Use semantic HTML, accessible labels, keyboard support, and appropriate ARIA attributes.
- Verify RTL/LTR and responsive behavior where relevant.
