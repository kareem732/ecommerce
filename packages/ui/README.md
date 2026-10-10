# @org/ui

Shared UI component library. All components are standalone, use signal inputs,
and are themed through CSS tokens (light/dark).

## Components

| Component    | Selector            | Main inputs                                                                                                    |
| ------------ | ------------------- | -------------------------------------------------------------------------------------------------------------- |
| Button       | `app-button`        | `label`, `variant` (primary/secondary/outline/ghost/danger), `icon`, `loading`, `disabled`, `fullWidth`        |
| Label        | `app-label`         | `text`, `for`, `required`, `error`, `disabled`                                                                 |
| ErrorMessage | `app-error-message` | `message`, `id`                                                                                                |
| Spinner      | `app-spinner`       | `size` (px, default 18), `label`                                                                               |
| Card         | `app-card`          | `image`, `imageAlt`, `aspectRatio`, `bordered`, `interactive`; slots: default, `[card-badge]`, `[card-footer]` |
| Input        | `app-input`         | `label`, `placeholder`, `type`, `icon`, `error`, `disabled` (works with `ngModel`)                             |
| Textarea     | `app-textarea`      | `label`, `placeholder`, `error`, `disabled`                                                                    |
| Select       | `app-select`        | `label`, `options`, `placeholder`, `arrow`, `error`, `disabled`                                                |
| Phone        | `app-phone`         | `label`, `placeholder`, `defaultCountry`, `error`, `disabled`                                                  |
| Upload       | `app-upload`        | `label`, `accept`, `buttonLabel`, `currentLabel`, `error`, `disabled`                                          |
| Checkbox     | `app-checkbox`      | `label`, `error`, `disabled`, `[(checked)]`                                                                    |
| Alert        | `app-alert`         | `message`, `severity` (info/success/error), `closable`                                                         |
| Badge        | `app-badge`         | `value`, `variant`                                                                                             |
| Tabs         | `app-tabs`          | `items`, `[(active)]`                                                                                          |
| Otp          | `app-otp`           | `length`, `error`, `mask`, `disabled`, `(completed)`                                                           |
| Pagination   | `app-pagination`    | `totalRecords`, `rows`, `[(first)]`, `(pageChange)`                                                            |
| Breadcrumb   | `app-breadcrumb`    | `items`, `maxItems`, `(itemClick)`                                                                             |
| AccountMenu  | `app-account-menu`  | `groups`, `title`, `(itemSelected)`                                                                            |

## Theming

Components read tokens such as `--bg-surface`, `--text-primary`, `--color-primary`,
`--border-default`. Add the `dark` class on `<html>` for dark mode.

## Accessibility

Interactive components expose `role`/`aria-*`, visible `:focus-visible` rings,
and error messages use `role="alert"`.
