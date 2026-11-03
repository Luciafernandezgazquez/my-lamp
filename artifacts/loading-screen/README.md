# Loading screen review

The supplied recording was inspected frame by frame. It begins with an orange panel contracting into a centered dot over approximately 1.2 seconds, with most of the movement early and a slow finish. STAP uses that contraction style in **#F3E082**, preceded by the requested expansion from a small dot. The reference's later decorative particles are not part of the requested circle reveal.

## Sequence

1. White screen and centered 32px dot, held for 160ms.
2. 680ms expansion using `cubic-bezier(.65, 0, .35, 1)`.
3. Full-yellow hold until scene, shaders, initial rendered frame, fonts, and material-preview image are ready.
4. 1150ms contraction using `cubic-bezier(.16, 1, .3, 1)`.
5. Existing 3.6-second lamp entrance begins at its first frame.

The reference does not expose its original easing values; these curves approximate its observed motion. The expansion and contraction use viewport-relative circular clipping, keeping coverage correct when the browser resizes. A static dot replaces motion when reduced motion is enabled. The overlay blocks pointer, touch, and keyboard interactions until the handoff, with an accessible loading status and retry button on failure.

## Previews

- [Initial dot](start.png)
- [Expansion](expansion.png)
- [Mobile contraction revealing the interface](mobile-reveal.png)

## Verification

- Desktop 1440×1024, tablet 900×600, and mobile 375×812 and 320×568: delayed scene readiness retains the full-yellow screen and interaction lock; the entrance begins only after contraction.
- Fast loading still completes the minimum animation; refreshing replays the loader, while model changes do not.
- Delaying the actual material-preview request keeps the overlay visible until the image is decoded.
- Reduced motion shows a static dot while waiting. Enabling it during contraction releases the overlay correctly once ready.
- Resizing a held loader from desktop to mobile preserves coverage and completes normally.
- Failed module loading exposes retry; retry successfully reloads the configurator.
- Existing entrance and model transitions, touch drag/pinch, colors, materials, light on/off and temperature, backgrounds, Pattern Studio brushes/eraser/undo/redo, and resize round trips passed after the handoff.
- Production build checked on mobile, including reveal and subsequent model switching.

All **16 tests** and the production build passed. Browser checks used Chrome with touch emulation. No new dependencies, changes to lamp geometry, or edits to the entrance/model-transition modules were required.
