#!/usr/bin/env python3
"""Lint the docs vault for the patterns that rot silently.

Run from anywhere:  python3 docs/check-docs.py

Checks:
  1. Line-number citations (`foo.py:123`). They drift on the next edit and
     silently point at the wrong symbol. Name the symbol instead.
  2. Broken [[wikilinks]]. Resolves relative paths, vault-root paths, and
     Obsidian's bare-stem shortest-path match.
  3. Source paths that no longer exist. A rename in one domain leaves docs in
     every other domain pointing at files that are gone.

Exits non-zero if anything is found, so it can gate a pre-commit hook.
"""

import re
import subprocess
import sys
from pathlib import Path

VAULT = Path(__file__).resolve().parent
REPO = VAULT.parent

# `path/to/file.py:12` or `:12-34`. Requires a source extension so prose like
# "10:00" and mermaid `A:::cls` do not trip it.
LINE_REF = re.compile(r"`[^`]*\.(?:py|ts|tsx|js|jsx|sh|sql|yml|yaml):\d+(?:-\d+)?[^`]*`")
WIKILINK = re.compile(r"\[\[(.+?)\]\]")
# Obsidian does not render wikilinks inside inline code, so neither do we.
CODE_SPAN = re.compile(r"`[^`]*`")

INLINE_CODE = re.compile(r"`([^`\n]+)`")
SOURCE_EXT = (".py", ".ts", ".tsx", ".js", ".jsx", ".sh", ".sql", ".yml", ".yaml", ".tf")
# Paths we cite on purpose even though git will never resolve them.
PATH_ALLOWLIST: set[str] = set()


def docs() -> list[Path]:
    return sorted(p for p in VAULT.rglob("*.md") if ".obsidian" not in p.parts)


def check_line_refs(files: list[Path]) -> list[str]:
    hits = []
    for path in files:
        if path.name == "README.md" and path.parent == VAULT:
            continue  # the conventions doc quotes the anti-pattern on purpose
        rel = path.relative_to(VAULT)
        for n, line in enumerate(path.read_text().splitlines(), 1):
            for m in LINE_REF.finditer(line):
                hits.append(f"{rel}:{n}: line-number citation {m.group(0)}")
    return hits


def check_wikilinks(files: list[Path]) -> list[str]:
    known = {p.resolve() for p in files}
    stems = {p.stem for p in known}
    hits = []
    for path in files:
        rel = path.relative_to(VAULT)
        for n, line in enumerate(path.read_text().splitlines(), 1):
            for m in WIKILINK.finditer(CODE_SPAN.sub("", line)):
                # Drop table-escaping backslashes before splitting off the
                # alias, or `[[a/b\|Label]]` never separates.
                target = m.group(1).replace("\\", "")
                base = target.split("|")[0].split("#")[0].strip()
                if not base:
                    continue
                relative = (path.parent / base).with_suffix(".md")
                if relative.resolve() in known:
                    continue
                if (VAULT / base).with_suffix(".md") in known:
                    continue
                if base in stems:
                    continue
                hits.append(f"{rel}:{n}: broken wikilink [[{base}]]")
    return hits


def tracked_files() -> set[str]:
    out = subprocess.run(["git", "ls-files"], cwd=REPO, capture_output=True, text=True, check=False)
    return set(out.stdout.split())


def check_source_paths(files: list[Path]) -> list[str]:
    """Flag `path/to/file.py` references whose file no longer exists.

    Docs cite partial paths by convention (`orders/service.py`), so a reference
    resolves if any tracked file ends with it on a segment boundary.
    """
    tracked = tracked_files()
    if not tracked:
        return []  # not a git checkout; skip rather than fail the whole lint
    hits = []
    for path in files:
        rel = path.relative_to(VAULT)
        for n, line in enumerate(path.read_text().splitlines(), 1):
            for token in INLINE_CODE.findall(line):
                ref = token.strip()
                if not ref.endswith(SOURCE_EXT):
                    continue
                # Globs, placeholders, and elided paths are not real references.
                if any(c in ref for c in " *{}<>[]") or "..." in ref:
                    continue
                ref = ref.removeprefix("./")  # not lstrip: it eats .github's dot
                # A bare extension (".tf") is prose about a file type, not a path.
                if ref.startswith(".") and "/" not in ref:
                    continue
                if ref in PATH_ALLOWLIST:
                    continue
                if any(f == ref or f.endswith("/" + ref) for f in tracked):
                    continue
                hits.append(f"{rel}:{n}: no such source file `{ref}`")
    return hits


def main() -> int:
    files = docs()
    problems = check_line_refs(files) + check_wikilinks(files) + check_source_paths(files)
    if not problems:
        print(f"docs: {len(files)} notes clean")
        return 0
    print("\n".join(problems))
    print(f"\n{len(problems)} problem(s). See docs/README.md for the conventions.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
