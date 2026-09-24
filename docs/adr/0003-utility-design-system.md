# 3. Utility design system

- Status: superseded by [[adr/0004-control-room-design-system]]
- Date: 2026-09-24
- Supersedes: [[adr/0002-monochrome-editorial-design]]
- Related: [[architecture/design-system]], [[architecture/frontend]]

## Context

The editorial system from ADR 0002 made the home page read like a poster: 180px serif headlines, no filled buttons, text-only actions. That suits a portfolio, but Team4 is a tool people work in for long sessions. Primary actions were hard to spot, and the display scale left little room for the working area. The app also shipped under the product name "Codex Lens"; the team presents it as Team4.

## Decision

Adopt a utility-first system modelled on v0 by Vercel, and rename the app to Team4. The palette stays achromatic (Canvas, Paper White, Line, Subtext, Icon, Ink, Onyx). Geist Sans and Geist Mono replace Inter and Fraunces. Action hierarchy comes from fill: solid primary, bordered secondary, text-only tertiary. Radii are 6, 8 and 12px or fully round, and shadows are allowed on cards only. The tokens are enforced in the theme, so stock shadcn components follow them. Details: [[architecture/design-system]].

## Consequences

- The main action on every screen is unmistakable: one solid Ink button.
- Geist ships through `next/font`, so there's no substitute face.
- The page scan remains the only colour on screen; errors are told apart by icon, wording and a muted surface rather than red.
- The spec in `docs/requirements.md` keeps its original title; the product is called Team4 everywhere else.
