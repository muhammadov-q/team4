# braces (patched)

braces 3.0.3 with one fix: nesting deeper than 256 levels is kept as plain text, so a deeply
nested pattern can't crash Node with a stack overflow
([CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)). No braces release fixes
it yet ([micromatch/braces#70](https://github.com/micromatch/braces/issues/70)).

`overrides` in `frontend/package.json` points every `braces` in the tree here. Only dev tools
use it (shadcn CLI, ESLint's Next plugin). The changes from upstream are `MAX_DEPTH` in
`lib/constants.js` and the guard at the top of the loop in `lib/parse.js`.

Delete this folder and the override once braces ships a fixed version.
