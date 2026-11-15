# Task dependency map

| Order | Task | Depends on | Primary file ownership |
| --- | --- | --- | --- |
| 1 | [TASK-01 contract and API](./TASK-01-contract-and-api.md) | None | New notification model/API service and tests |
| 2 | [TASK-02 state](./TASK-02-state.md) | 01 | New notification state owner and tests |
| 3 | [TASK-03 panel UI](./TASK-03-panel-ui.md) | 02 | New panel files, i18n JSON, tests |
| 4 | [TASK-04 header integration](./TASK-04-header-integration.md) | 03 | Navbar files and navbar tests |
| 5 | [TASK-05 final verification](./TASK-05-final-verification.md) | 01–04 | Test additions/fixes only where justified |

Run sequentially. A missing backend item schema blocks tasks 01–04; report it instead of inventing fields. Do not run agents concurrently against the same files. Web Push is optional future work after a separately approved scope and confirmed push schemas.
