# Architecture decision records

Short notes on decisions that are hard to reverse: a framework, a service boundary, a data store. The spec asks for them ([[requirements]], section 9.3). Where the decisions show up in the system: [[architecture/README|architecture]].

| ADR                                  | Decision                                   | Status   |
| ------------------------------------ | ------------------------------------------ | -------- |
| [[adr/0001-web-frontend-stack]]      | Next.js web app with a same-origin proxy and generated API types | accepted |

## Writing one

Name it `NNNN-kebab-title.md` with the next number. Keep it to three sections: **Context** (the forces), **Decision** (what we chose and the alternatives we dropped), **Consequences** (what gets easier and what gets harder). To change a decision, write a new ADR that supersedes the old one; don't rewrite history.
