# Bubble loader review

The supplied recording, **Grabación de pantalla 2026-11-03 a las 18.34.01.mov**, was inspected frame by frame. Its central shape bounces, splits into floating bubbles, and gathers again. This implementation adapts the floating, staggered movement to the requested small-bubbles → full-yellow → fast-reveal sequence. It does not reproduce the reference's logo, text, or non-circular distortions.

Only flat **#F3E082** circles appear on a white background. Six bubbles start 0–440ms apart, drift to separate positions, and expand until their overlapping areas cover the viewport. The total fill lasts **2090ms**. Once scene preparation is complete, the full-yellow screen fades away in **180ms**; the unchanged lamp entrance starts at its first frame immediately afterward.

## Frames

- [Floating bubbles on desktop](desktop-bubbles.png)
- [Floating bubbles on mobile](mobile-bubbles.png)
- [Bubbles merging on mobile](mobile-merging.png)

Frames are sampled from the actual CSS animation. There are no raster assets or reference-video elements in the loader itself.

## Verification

- Normal startup tested at 1440×1024, 900×600, 375×812, and 320×568.
- No visible text, images, or logos; bubble color matches the required RGB value exactly.
- Delaying the real material-preview request holds solid yellow and prevents interaction until readiness.
- Fast loading completes the full bubble animation. Refresh replays it; model switching does not.
- The reveal starts the lamp at its first entrance frame, then the full entrance and existing model transitions complete normally.
- Reduced motion uses static bubbles. Changing that preference during loading and resizing the viewport do not strand or restart the loader.
- Pointer/keyboard locking and keyboard retry after a failed module request were exercised.
- Touch rotation/pinch, colors, materials, lighting, backgrounds, Pattern Studio tools/eraser/undo/redo, and resize round trips passed at mobile and intermediate widths.
- Production checks cover desktop, tablet, phone, and square viewports, including coverage of screen corners before the flat-yellow handoff.

All **17 tests** and the production build passed. Browser checks use Chrome with touch emulation. Desktop, tablet, and mobile layout styles, the entrance and model-transition modules, and dependencies remain unchanged. The build retains its existing large-bundle warning.
