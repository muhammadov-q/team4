# Architecture

Cross-cutting notes on how Codex Lens is built. Start with the overview.

| Note                                   | What it covers                                                       |
| -------------------------------------- | -------------------------------------------------------------------- |
| [[architecture/overview]]              | Services, the recognition pipeline, the data model, what exists today. |
| [[architecture/frontend]]              | The web app: request path, state, loaders, theming, gotchas.         |
| [[architecture/api-contract]]          | Backend endpoints and how the frontend stays in sync with them.      |
| [[architecture/design-patterns]]       | The patterns the spec grades, and where each one lives.              |
| [[architecture/testing]]               | Test layers, where tests live, how to run them.                      |

Decisions behind this structure are recorded in [[adr/README|the ADRs]].
