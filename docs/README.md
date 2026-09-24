# Team4 docs

This vault holds the **why** behind Team4: decisions, invariants, rules and the connections between parts of the system. Code shows the what; these notes explain the reasons.

Open the `docs/` folder as a vault in **Obsidian**. Notes link to each other with `[[wikilinks]]`, so the graph view shows how the pieces connect. GitHub renders the same files as plain Markdown.

## How it's organized

| Folder                                  | What lives here                                                        |
| --------------------------------------- | ---------------------------------------------------------------------- |
| [[architecture/README\|architecture]]   | System map, frontend, API contract, design patterns, testing.          |
| [[workflow/README\|workflow]]           | Issues, branches, commits, pull requests, Definition of Done.          |
| [[ml/README\|ml]]                       | Tasks, datasets, splits and the rules that keep evaluation honest.     |
| [[models/README\|models]]               | One model card per deployed model.                                     |
| [[adr/README\|adr]]                     | Architecture decision records.                                         |
| [[meetings/README\|meetings]]           | Meeting notes, one file per meeting.                                   |

## Entry points

- **New to the team?** [[onboarding]], then [[glossary]].
- **What are we building?** [[requirements]], the full spec.
- **How does it fit together?** [[architecture/overview]].
- **How do we work?** [[workflow/git-workflow]] and [[workflow/issues]].
- **Why is it built this way?** [[adr/README|Decision records]].

## Writing conventions

- **One note per stable concept**, not per PR. PRs describe changes; notes describe what stays true.
- **File names are `lowercase-kebab.md`.** Each folder's index is `README.md`, so GitHub shows it when someone opens the folder. To hide the README nodes in Obsidian's graph, add `-path:README` to the graph's Files filter.
- **Link with `[[wikilinks]]`** using vault-root paths (`[[architecture/overview]]`). Only link to notes that exist; write planned notes as plain text so the lint stays green.
- **Source files go in inline code**, not links: `frontend/src/lib/api/predict.ts`. Name the symbol, never a line number; line numbers drift on the next edit.
- **Don't hardcode counts** that rot ("56 tests"). Point at the command that tells the truth instead.
- **Mermaid for diagrams.** Obsidian and GitHub both render it.
- **Date anything external** (library versions, dataset terms, URLs) with "as of YYYY-MM".
- **No emojis.** Headings, tables and diagrams instead.

Run `python3 docs/check-docs.py` after editing. It fails on broken wikilinks, line-number citations and source paths that no longer exist. The pre-push hook runs it whenever `docs/` changes.
