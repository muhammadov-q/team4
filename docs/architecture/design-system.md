# Design system

Team4 looks like a control room: a near-black canvas, bold white type, flat panels and one neon accent. Dark is the default and light mode mirrors it. Why we chose it: [[adr/0004-control-room-design-system]]. Where the tokens live: `frontend/src/app/globals.css`, described in [[architecture/frontend]].

## Colour

| Role          | Dark      | Light     | Use                                                 |
| ------------- | --------- | --------- | --------------------------------------------------- |
| Canvas        | `#000000` | `#f4f4f4` | Page background, with a faint grid behind the hero. |
| Panel         | `#161616` | `#ffffff` | Cards.                                              |
| Muted surface | `#1f1f1f` | `#ebebeb` | Inputs, the nav pill, rows inside cards.            |
| Text          | `#ffffff` | `#0e0e0e` | Headlines and body.                                 |
| Muted text    | `#a3a3a3` | `#5c5c5c` | Descriptions, labels.                               |
| Lime          | `#e6ff5c` | `#e6ff5c` | Primary buttons (with dark text) and status dots.   |

Lime is the only accent. Errors use an icon, wording and a muted surface rather than red. The raw-response block keeps code syntax colours, darker in light mode so they stay readable.

## Type

Schibsted Grotesk (standing in for Söhne) for everything, JetBrains Mono for technical labels, durations, file sizes and code. Headlines are 600 weight with tight tracking, up to 88px, and read as two stacked lines. Body text is 16 to 20px.

## Surfaces

- **No borders and no shadows.** Containers separate by background step alone: canvas, then panel, then muted surface.
- Corners: 8px for buttons, 16px for inputs and the nav pill, 20px for cards, fully round for dots.
- Keyboard focus still shows a ring; that's for accessibility, not decoration.

## Components

- **Nav**: the Team4 wordmark on the left, a muted pill with links and the theme toggle in the middle, the lime call to action on the right. No bar behind it.
- **Primary button**: lime fill, dark text, 8px corners. **Secondary**: transparent with an input-coloured outline. **Tertiary**: muted text only.
- **Tags**: small mono labels with a lime dot, on the panel colour.
- **Code block**: the canvas colour inside a card, with the file name and a Copy action on top.

## Layout

Content up to 1200px wide. The hero is centred over the grid; everything below is left-aligned. Sections sit 96 to 128px apart.
