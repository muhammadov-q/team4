# 4. Control-room design system

- Status: accepted
- Date: 2026-09-24
- Supersedes: [[adr/0003-utility-design-system]]
- Related: [[architecture/design-system]], [[architecture/frontend]]

## Context

The light, utility-first look from ADR 0003 worked but felt generic for a presentation demo. The team wanted a dark, high-contrast look modelled on LaunchDarkly's site: black canvas, bold type, one neon accent. We still need a light mode for projectors and daylight demos.

## Decision

Dark by default with a matching light mode, switched from the nav. Schibsted Grotesk and JetBrains Mono through `next/font`; Schibsted was picked over Inter and Hanken Grotesk because its heavy weights stack into the dense headline block this look depends on. Lime (`#e6ff5c`) is the only accent and fills primary buttons. Containers have no borders and no shadows; they separate by background steps. Corners are 8px on buttons, 16px on inputs and 20px on cards. There's no footer for now. Details: [[architecture/design-system]].

## Consequences

- Surfaces stay calm and flat, and the one lime action on each screen is easy to find.
- Without borders, the background steps have to stay far enough apart in both themes; the light canvas is darker than white for that reason.
- Page scans remain the only imagery; the grid behind the hero is the one decorative element.
