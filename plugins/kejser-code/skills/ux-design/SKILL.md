---
name: ux-design
description: Thomas's UX design principles for any user interface (web, Win32, other desktop) — show each fact once, let the visual (icon, colour, position) carry information instead of annotations, reveal detail at the next zoom level, the same action works on every representation of an item, one filter or selection drives every view, anchor elements cleanly to edges and centres with pixel-perfect alignment and no wavy margins, treat space as scarce, high-contrast text with black outlines over variable backgrounds, never hide content behind overlays or highlights, and one colour palette with RGB codes defined in a single central place. Use whenever designing or changing screens, views, tabs, maps, tables, legends, overlays, highlights, icons or colours, and when Thomas gives feedback on a UI.
---

# UX design

Applies to any user interface, whatever the toolkit.
Web styling rules live in `kejser-web:css` and `kejser-web:sveltekit`, and this skill doesn't repeat them.
Each principle lists how it played out in Thomas's corrections to a desktop map view: galaxy regions coloured by a metric, with a table beside the map.

## How Thomas iterates

- Thomas looks at the running UI and corrects one detail per message.
- Show the running result after each change, and expect the next correction to be small.
- Before showing a design, check it against every principle below.

## Principles

### 1. Show each fact once

- Every element must add information not already on screen.
- In practice:
  - No title or summary above a table that speaks for itself: "Just the table."
  - No column restating a filter already chosen in a dropdown.
  - No hover name in a header when a side panel already shows it.

### 2. Let the visual carry the information

- Encode meaning in an icon, colour, shape or position before reaching for a text annotation.
- Add a label only when the visual cannot carry the meaning.
- In practice: the map shows the metric by cell colour, explained once by a legend, not by numbers in each cell.

### 3. Reveal detail at the next level, not all at once

- Each view shows only what fits legibly at its scale.
- Finer detail is one step away: zoom in, open, expand.
- Related views are levels of one view, not separate tabs.
- A focused view keeps some surrounding context in sight.
- In practice:
  - The Region and Sectors tabs folded into zoom levels of the Map tab.
  - Double-click zooms in one level and a zoom-out button goes up one.
  - Sector names appear in a 3x3 zoomed grid instead of tiny names stacked in every cell: "then we have enough space to hold all names".
  - The 3x3 grid shrinks so more surrounding area shows.

### 4. Every representation of an item offers the same actions

- An item shown in two places, such as a map cell and a table row, responds to the same interactions in both.
- In practice: double-clicking a sector in the table zooms to it, just as on the map.

### 5. One control, one state, everywhere

- A filter or selection applies to every view and list it could affect, not just the main one.
- In practice: the object-type dropdown filters the sector's target table as well as the map.

### 6. Anchor everything cleanly

- Align every element to an edge or centre of its container: left, centre or right horizontally; top, centre or bottom vertically.
- Nothing floats at an arbitrary offset.
- Alignment is pixel perfect: "If you are going to make wavy margins, you better have a really good reason."
- Every block in a column shares the same left and right edges.
  Don't give an individual element its own width cap unless there is a stated reason.
- In practice:
  - The colour legend sits bottom right.
  - The zoom-out button sits in the top corner of the map, just below the menus.
  - The view heading is centred over the map.
  - On a content site, paragraphs capped at 65ch stopped short of the right edge that the header, headings and answer box line up on; the cap was removed so the column alone sets the width.

### 7. Treat space as scarce

- Bound lengths so the layout is predictable, then use the space that frees.
- Content fills its whole area; no dead margins around a canvas.
- In practice:
  - Lists cap at the top 20 items, plus a sum row.
  - The legend moved into the space under the capped table.
  - The galaxy background fills the map area up to just under the zoom button, fitted to the zoom.

### 8. Text is readable at a glance on any background

- Use high-contrast text against its background.
- When the background varies in colour, give the text a black outline, as on a HUD.

### 9. Never hide the content

- Overlays, grids and highlights must leave the content underneath visible.
- Mark a state with the smallest change that reads clearly.
- In practice:
  - Sector grids are semi-transparent so the galaxy shows through.
  - Selection changes the text colour only; Thomas rejected a dark highlight band behind it.

### 10. One palette, defined in one place

- Choose a fixed palette of colours for the app and stick to it.
- List every colour with its RGB code in one central file, and have all code refer to the colours from there.
- Never write a colour literal anywhere else; a colour that's missing is added to the palette first.
- On the web, that file is `tokens.css`, as `kejser-web:css` describes.
