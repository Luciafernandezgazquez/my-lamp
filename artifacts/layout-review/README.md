# LAYOUT_2 review

- [Desktop comparison, 1440 × 1024](desktop-1440.png)
- [Mobile, 390px wide, full page](mobile-390.png)
- [Supplied reference](../../public/assets/LAYOUT_2.jpg)
- Pre-redesign checkpoint: `90f270a`

The previews use Glass / Mixed / Shine, with a warm temperature and the cream background, to compare against the reference's Glass example. This is a configuration available through the existing controls. The app still starts with Dome / Yellow / Ceramic and temperature 32.

At the reference viewport, the circular viewer measures approximately 628 × 628px at (423, 269). The Model, Color, and Material groups start at (40, 269), (40, 494), and (40, 787). The right-hand groups start at (1019, 281), (1150, 514), and (1117, 778).

## Verification

Production build and `git diff --check` passed. Chrome browser checks exercised:

- All models, palettes, repeated Mixed selections, and all four finishes.
- Light on/off, disabled temperature, warm/neutral/cool light, consistent intensity, and unchanged surface colors.
- Mouse rotation and wheel zoom, touch rotation and pinch zoom, and mouse/touch input isolation.
- Immersive popup switching, outside-click/Escape dismissal, viewer resizing, and preservation of settings and camera.
- Watercolor overlap, lines, dots, erasing, custom ink, size/spacing, undo/redo including keyboard shortcuts, and clear/model-switch confirmations.
- Artwork retention through finishes and views, and isolation from opposite surfaces and cylinder caps.
- Layouts at widths 320, 390, 768, 844, 1024, 1280, and 1440, including portrait and landscape. No horizontal overflow or inaccessible control bounds were found.
- Matching canvas aspect ratios and unclipped lamp bodies after automatic framing.

No application runtime errors or shader compilation failures were detected. Touch checks used Chrome's touch emulation.

## Differences retained

- Four material choices remain available; the reference shows three.
- The reference's placeholder headline is preserved as supplied.
- Live lamp geometry, finishes, palettes, and light remain configurable, so their shading and exact colors depend on the chosen settings. The reference's sample rendering is not used as a substitute for the 3D model.
- Small selection indicators remain to identify active choices. Reset view and pricing appear below the viewer on desktop hover/focus and remain visible on mobile.
- The logo uses a local Neue Haas font when available; fallback metrics can differ on other machines.
- The normal view follows the reference's cord-to-edge composition. Immersive framing includes the full suspension cord.
