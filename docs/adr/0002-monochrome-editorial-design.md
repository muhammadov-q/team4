# 2. Monochrome editorial design system

- Status: superseded by [[adr/0003-utility-design-system]]
- Date: 2026-09-24
- Supersedes: the lapis and rubric palette from [[adr/0001-web-frontend-stack]]
- Related: [[architecture/design-system]], [[architecture/frontend]]

## Context

The app shows photographs of manuscript pages, which bring their own colour and texture. A coloured interface competes with them, and a scholar's attention belongs on the page. The first palette (lapis blue, rubric red, EB Garamond) worked, but it added hue around content that doesn't need any.

## Decision

Adopt a monochrome editorial system modelled on the 14islands style reference: five neutrals (Ink, Paper, Fog, Stone, Graphite), Inter for UI and Fraunces for display type at weight 400, a 12/16px UI scale against display sizes up to 180px, 4px corners, no shadows and no filled buttons. The rules are enforced in the theme where possible (colour tokens, radius tokens, text scale) so stock shadcn components comply without edits. Details: [[architecture/design-system]].

## Consequences

- The page scan is the only colour on screen, which suits the product.
- Errors and states can't lean on colour; they need wording, type and position instead.
- Stone and Graphite fall below WCAG AA contrast for small text, so they stay on labels and helper copy, never body paragraphs.
- Story B3's "shown in red" needs a monochrome treatment when it's built.
