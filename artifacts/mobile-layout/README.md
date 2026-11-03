# Mobile layout review

The mobile presentation follows the supplied **Android Compact - 1.jpg** Figma reference. Changes apply only at widths of **640px or less** and reuse the existing controls and 3D scene.

## Previews

- [412px — reference width](mobile-412.png)
- [320px](mobile-320.png)
- [375px](mobile-375.png)
- [430px](mobile-430.png)

Previews show the default BOP / Yellow / Ceramic configuration after the reveal, with reduced motion enabled for stable capture. At 412px, the viewer is approximately 340px across and starts at y=159px; control rows start at y=571, 681, and 813px, closely following the supplied reference.

The temperature slider stays visible, and Reset view remains accessible inside the circle. Existing material textures and selection indicators are retained. The live lamp retains its original geometry, materials, and lighting, so its shading differs from the Figma render.

## Verification

Chrome browser checks at **320×568, 375×812, 412×917, and 430×932** passed:

- Circular viewer, aligned control pairs, contained labels, four model icons in one row, and no horizontal overflow.
- Touch rotation and pinch zoom; interaction locking during entrance and model transitions.
- Entrance fade/scale/assembly/lighting and outgoing/incoming model transitions, including exact final transforms and no entrance replay.
- Palettes, repeated Mixed choices, all materials, temperature slider, light on/off, backgrounds, and Reset view.
- Pattern Studio touch drawing with watercolor, lines, dots, and eraser; undo/redo and Draw/Rotate modes.
- Artwork retention when leaving Studio and resizing to desktop and back.
- Real-time entrance and model-transition playback, plus reduced-motion behavior.

No browser runtime errors were reported. Touch checks used Chrome emulation, not physical phones. Desktop (1440px) and tablet (768px) layout measurements matched the pre-change baseline exactly. The existing 12 animation tests and production build passed; the build retains its existing large-bundle warning.
