# 2. Control-room design system

- Status: accepted
- Date: 2026-09-24
- Related: [[architecture/design-system]]

## Context

The app is demoed every week and in two presentations. We wanted a look that stands out there: dark, high contrast and one accent, modelled on LaunchDarkly's site. A light mode is still needed for projectors and daylight.

## Decision

Dark by default with a matching light mode, switched from the nav. Schibsted Grotesk and JetBrains Mono. Lime (`#e6ff5c`) is the only accent and fills primary buttons. Containers have no borders and no shadows and are separated by background steps. Corners are 8px on buttons, 16px on inputs and 20px on cards.

## Consequences

- Each screen has one lime action, which is easy to find.
- Without borders, the background steps have to stay far enough apart in both themes. That's why the light canvas is darker than white.
- Errors can't rely on red. They use an icon, wording and a muted surface.
