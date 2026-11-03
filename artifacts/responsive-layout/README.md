# Intermediate responsive layout review

## Cause and fix

The old tablet rules placed the viewer and controls into stacked rows but retained the desktop shell's fixed viewport height, constrained grid track, and `container-type: size`. The 600px circular viewer exceeded its row and overlapped the header, headline, and controls. Automatic control placement also lost the intended Model / Color / Material versus Temperature / Studio / Background pairing.

The stacked shell now sizes from its content. The circular viewer reserves its own row and uses `min(100%, clamp(480px, 52vw, 560px))`; explicit grid positions align the six sections beneath it. The mobile design applies below 768px, the intermediate layout from 768px through 1200px, and the desktop composition above 1200px.

Short desktop windows scroll a minimum 640px-high layout. The temperature label also follows the controls' sizing unit so it cannot overflow when the window height shrinks. The only JavaScript change aligns Pattern Studio's compact-layout media queries with the new 1200px breakpoint. Scene geometry, camera framing, materials, animation code, and drawing tools are unchanged.

## Visual review

- [900px before the fix](before-900.png)
- [900px after the fix](tablet-900.png)
- [1200px after the fix](narrow-desktop-1200.png)
- [1440×400 short desktop window, full-page capture](short-desktop-1440.png)

Previews show the live configurator after the entrance, with reduced motion enabled for stable capture.

## Checks

Chrome layout checks passed at all requested widths: **320, 375, 430, 600, 768, 900, 1024, 1200, and 1440px**. Additional checks covered 767/768px, 1100/1101px, 1200/1201px, and short windows down to 400px tall: 23 viewport combinations in total.

- No overlapping sections, overflowing labels, horizontal scrolling, or unintended control overflow. Mobile color swatches retain their existing 5px expanded tap area beside the section edge.
- Circle and canvas dimensions match, with a 1:1 aspect ratio.
- The original section measurements are unchanged at 320, 375, 430, and 600px, and at 1440×1024.
- Touch rotation/pinch, palettes, Mixed colors, materials, temperature, light on/off, backgrounds, and Reset view work at mobile and intermediate sizes.
- Pattern Studio opens its existing immersive interface at intermediate widths; touch drawing, brushes, eraser, undo/redo, and Draw/Rotate remain functional. Artwork survives view changes and resize round trips.
- Entrance and model-transition checks verify the restored final transforms and released interaction locks. Reduced-motion behavior remains intact.
- All four lamp silhouettes fit inside the circular viewer at 320–1440px. Resizing during the entrance, rapid model selections, and an open desktop Studio also passed; Studio moves to immersive view when crossing into the stacked layout.

The existing **12 animation tests**, production build, and `git diff --check` passed. The build still reports its existing large-bundle warning. Browser tests used desktop Chrome with touch emulation rather than physical devices.
