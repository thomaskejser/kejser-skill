---
name: ux-design
description: How Thomas wants user interfaces designed, in any toolkit (web, Win32, other desktop) — one view with zoom levels instead of separate tabs, detail shown at the next zoom level rather than crammed in, zoom from lists as well as the map or canvas, never repeating information already on screen, lists capped at top 20, filters that drive every list, legible text over varied backgrounds, selection by text colour, translucent overlays, one colour per cell, and colour scales that stay fixed across zoom levels. Use whenever designing or changing screens, views, tabs, maps, tables, legends, overlays, highlights or colour scales, and when Thomas gives feedback on a UI.
---

# UX design

Applies to any user interface, whatever the toolkit.
Web styling rules live in `kejser-web:css` and `kejser-web:sveltekit`, and this skill doesn't repeat them.
The rules come from Thomas's corrections to a desktop map view: galaxy regions coloured by a metric, with a table beside the map.

## How Thomas iterates

- Thomas looks at the running UI and corrects one detail per message.
- Show the running result after each change, and expect the next correction to be small.
- Most corrections remove redundancy, free space, or make the view readable at a glance.
  Check a design against those three before showing it.

## Structure and navigation

- Fold related tabs into one view with zoom levels, not separate tabs per level.
  - Double-click zooms in one level.
  - A zoom-out button goes up one level.
- Put detail at the next zoom level rather than cramming it into the current one.
  Thomas rejected tiny labels stacked in every cell: "allow me to double click on the sector … then we have enough space to hold all names".
- Zoom from the list as well as the canvas.
  Double-clicking a row in the table zooms to that item.
- A zoomed view shows context around the focus.
  Make the cells smaller so that surrounding area fits.

## Don't repeat information

- Show nothing that is already visible somewhere else on screen.
  - No title or summary above a table when the table speaks for itself: "Just the table."
  - No column restating a filter that is already chosen in a dropdown.
  - No hover name in a header when a side panel already shows it.

## Layout and density

- Cap lists at the top 20 items, plus a sum row where one applies.
- Use the space this frees: the legend goes under the table.
- A colour-gradient legend is aligned bottom right.
- Place the zoom-out button in the top corner of the canvas, just below the menus.
- A view heading sits centred over the canvas.
- Fill the whole canvas area with the content, such as a background fitted to the zoom, up to just under the controls.

## Filters

- A filter control drives every list and view it could apply to, not just the main one.
  A table of items inside a zoomed area is filtered by the same dropdown as the map.

## Colour and legibility

- Text over varied backgrounds gets a black outline so it reads on any colour.
- Show selection by changing the text colour only.
  Don't change the background; Thomas rejected a dark highlight band.
- Overlays such as grids are semi-transparent, so the content underneath stays visible.
- Each cell has a single colour.
  Don't interpolate or blend colours between cells.
- A colour scale is relative to the whole dataset and stays the same at every zoom level.
  Many cells come out dark when zoomed in, and that is fine.
