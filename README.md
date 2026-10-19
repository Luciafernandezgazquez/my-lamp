# Stap — Light with character

An interactive 3D lamp configurator for a playful, contemporary lighting brand. Visitors can choose a sculptural lamp, coordinate its colors, explore different finishes, adjust its glow, and draw a personal design directly on its surface.

The application runs entirely in the browser. It is a product configurator prototype with a price display; it does not include a shopping cart, checkout, accounts, or a backend.

## Getting started

### Requirements

- Node.js **22.12 or newer** and npm. The installed Vite version also supports Node.js 20.19+ within the 20.x release line.
- A browser with JavaScript and WebGL 2 support, with graphics acceleration available.

From the parent `Projects` directory:

```sh
cd my-product
npm ci
npm run dev
```

If your terminal is already in `my-product`, skip the `cd` command. Open the local URL printed by Vite, normally `http://localhost:5173`. Vite may choose another port if that one is occupied. Stop the server with `Ctrl+C`.

No API keys, environment variables, database, or external 3D model downloads are required. Lamp geometry and the ceramic surface finish are generated in code.

### Commands

Run these commands from the project root:

| Command | Purpose |
| --- | --- |
| `npm ci` | Install the dependency versions recorded in `package-lock.json`. |
| `npm run dev` | Start the development server with live updates. |
| `npm run build` | Generate the production website in `dist/`. |
| `npm run preview` | Serve an existing production build locally, normally on port 4173. |
| `npm run dev -- --host 0.0.0.0` | Make the development server reachable from another device on the same network. |

For phone testing, use your computer's local network address and the port printed by Vite. The phone and computer must be able to reach one another on that network.

## Using the configurator

1. Select a **Model**: Dome, Orbit, Tier, or Glass.
2. Select a **Color** palette: Pink, Yellow, Blue, White, Black, or Mixed colors.
3. Choose a **Material**: Ceramic, Crystal, Matte, or Shine.
4. Switch the lamp on and adjust **Light temperature** from warm through neutral to cool white.
5. Drag the lamp to rotate it. Use the mouse wheel or a touch pinch to zoom. The desktop viewer also provides **Reset view**.
6. Open **Pattern Studio** to decorate the lamp with watercolor, lines, or polka dots.

The initial configuration is **Dome / Yellow / Ceramic**, with the light on and the temperature slider at **32**, displayed as approximately **3550K**. Its displayed price is **€355**.

Selections survive entry to and exit from immersive view. They are held in memory for the current page session; reloading restores the defaults.

### Immersive view

Use the circular button at the top-right of the page to fill the browser viewport with the lamp viewer. This expands the page layout without invoking the browser's native fullscreen API.

- The model name remains at the top-left, with an exit button at the top-right.
- Five icon buttons provide **Model**, **Color**, **Material**, **Light Temperature**, and **Pattern Studio** controls.
- Each button opens a compact popup. Only one popup is open at a time.
- Click outside, use the popup's close button, or press **Escape** to close a popup. Pressing Escape with no popup open exits immersive view.
- The light on/off button is available inside the Light Temperature popup.
- The camera and viewer resize to leave room for the controls. On short landscape screens, the controls sit beside the lamp.
- Exiting restores the regular layout and its saved camera view, while retaining the chosen configuration.

### Pattern Studio

Open the studio from the configuration panel or the immersive toolbar. On smaller screens, the normal-panel button opens the immersive studio to keep the lamp and tools together. On desktop, immersive drawing tools sit beside the lamp.

- **Draw** paints with a mouse or finger and locks camera rotation. **Rotate** enables dragging and wheel/pinch zoom without making marks.
- **Watercolor** has soft, slightly irregular edges and fine grain. Its translucent strokes darken when overlapped.
- **Lines** draws continuous strokes. **Polka dots** places one dot per tap/click, or evenly spaced dots while dragging.
- Choose a preset ink or any custom color, adjust **Tool size**, and use **Dot spacing** to change the distance between dots.
- **Eraser** removes artwork while preserving the selected base color and material.
- **Undo/Redo** works per stroke, including erasing and clearing. Shortcuts are Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z (or Ctrl+Y). History retains up to 30 actions, with a memory budget that may retain fewer large actions.
- **Clear drawing** asks for confirmation and can be undone. Switching models also asks for confirmation when artwork exists; confirming removes that model's drawing and undo history.

Artwork stays attached during rotation and zoom and survives closing the studio, changing palettes or finishes, and entering/leaving immersive view. The bulb is excluded from drawing. Clicking the viewer keeps the studio open; use Done, the popup close button, or Escape to close it.

Artwork is held in memory for the current page session. Reloading clears it; there is no save/export feature yet.

## Colors and materials

### Pastel palettes

The four shades are assigned to the model's primary body, accents, trim, and cable. The exact geometry assigned to each role varies by model. Swatches and lamp colors share the same palette definitions in [src/palettes.js](src/palettes.js).

| Palette | Primary | Accent | Trim | Cable |
| --- | --- | --- | --- | --- |
| Pink | `#EDB5C5` | `#D69BAE` | `#F4CCD7` | `#FBE5EA` |
| Yellow | `#F2E3AB` | `#D9C78F` | `#E8CEAA` | `#FCF4D9` |
| Blue | `#BEC5E7` | `#9DA8CE` | `#D5D9EF` | `#EEF0FA` |
| White | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` |
| Black | `#000000` | `#000000` | `#000000` | `#000000` |

**Mixed colors** generates four distinct shades from the Pink, Yellow, and Blue families. Each click includes all three families, changes every part's assigned color, and changes the primary color family from the previous combination. Its swatch updates to show the generated colors. Color changes preserve the selected model, finish, lighting, and camera.

These hex values describe the base material colors. Lighting, reflections, and transparency affect how they appear on screen.

### Finishes

| Finish | Appearance |
| --- | --- |
| Ceramic | Fine procedural grain, shallow imperfections, and a soft reflective glaze. |
| Crystal | Transparent, light-transmitting material with glossy reflections. |
| Matte | A rough surface with subdued highlights. |
| Shine | A smooth, glossy surface with a clearcoat layer. |

Ceramic uses object-space surface detail to avoid UV seams and keep the grain attached to the lamp during rotation. Scaled geometry keeps the grain consistent across differently shaped parts; subpixel detail fades at a distance to reduce shimmer. A shared, neutral studio environment supplies broad reflections. The reference photographs guide the finish and are not applied as color textures.

The Glass model uses the ceramic finish when Ceramic is selected. Its other finish choices retain the model's glass treatment. With Crystal selected, accent parts use a glossy finish for definition.

### Lighting

The temperature slider runs from 0 to 100, with displayed reference points of **2700K**, **4000K**, and **6500K**. It smoothly blends warm white (`#FFE6AD`) through neutral white (`#FFFFFF`) to cool white (`#F4F7FF`). These are artistic color approximations rather than a physically calibrated color-temperature simulation.

The emitted light color is normalized to constant linear luminance, and the light intensity remains fixed across the range. Temperature changes affect the bulb's emissive glow and the lamp's point light; they do not rewrite the painted surfaces' base colors or emissive properties. Nearby surfaces can still respond naturally to illumination. Studio lighting remains fixed.

Switching the light off disables and dims the slider. Switching it back on restores the selected temperature. The same controls and state are used in normal and immersive views.

### Displayed pricing

The displayed total is the model price plus the finish surcharge, defined in [src/main.js](src/main.js).

| Model | Base price |
| --- | --- |
| Dome | €320 |
| Orbit | €365 |
| Tier | €410 |
| Glass | €490 |

| Finish | Surcharge |
| --- | --- |
| Ceramic | €35 |
| Crystal | €90 |
| Matte | €0 |
| Shine | €55 |

There is no payment processing or order submission.

## Project structure

```text
my-product/
├── README.md                  Project documentation
├── plan.md                    Original design brief and moodboard notes
├── index.html                 HTML entry point and page metadata
├── package.json               Dependencies and npm commands
├── package-lock.json          Locked dependency versions
├── public/
│   └── assets/                Design and ceramic reference images
├── src/
│   ├── main.js                UI, shared state, lamp geometry, scene, and interactions
│   ├── style.css              Layout, typography, controls, and responsive styles
│   ├── palettes.js            Color families and Mixed color generation
│   ├── light-temperature.js   Temperature interpolation and luminance normalization
│   ├── ceramic-material.js    Ceramic shader and studio reflection environment
│   ├── surface-paint.js       Surface projection, paint atlases, gestures, and undo history
│   ├── pattern-studio.js      Drawing controls and confirmation dialogs
│   ├── pattern-studio.css     Studio layout and tool styling
│   ├── counter.js             Unused Vite starter example
│   └── assets/                Starter assets; not used by the configurator
└── dist/                      Generated production build; ignored by Git
```

The app uses **vanilla JavaScript ES modules**, **CSS**, **Vite 8**, and **Three.js 0.186** with `OrbitControls`. There is no UI framework. Dependency ranges are in `package.json`; exact installed versions are recorded in `package-lock.json`.

## Design references and typography

[plan.md](plan.md) records the original design direction: sculptural shapes, playful colors, a clean interface, and warm light from the left. The implementation includes later refinements such as the pastel palettes and immersive controls; the original brief's palette is not the current palette source.

| Reference | Purpose |
| --- | --- |
| [LAYOUT.jpg](public/assets/LAYOUT.jpg) | Viewer and configuration-panel layout. |
| [LAMPS.png](public/assets/LAMPS.png) | Sculptural lamp silhouettes. |
| [LAYOUT-1.jpg](public/assets/LAYOUT-1.jpg) | Original color direction. |
| [LIGHTING.jpg](public/assets/LIGHTING.jpg) | Warm, soft lighting from the left. |
| [LOGO.jpg](public/assets/LOGO.jpg) | Stap logo direction. |
| [MATERIALS.jpg](public/assets/MATERIALS.jpg) | Finish options. |
| [TYPOGRAPHY.jpg](public/assets/TYPOGRAPHY.jpg) | Typography direction. |
| [ceramic-reference-01.jpg](public/assets/ceramic-reference-01.jpg) | Surface texture and fine grain. |
| [ceramic-reference-02.jpg](public/assets/ceramic-reference-02.jpg) | Glaze and soft reflections. |
| [ceramic-reference-03.jpg](public/assets/ceramic-reference-03.jpg) | Subtle surface imperfections. |

The intended typeface is **Neue Haas Grotesk Display Pro**, using Roman and Light weights. CSS requests that family, then falls back to Helvetica Neue, Helvetica, Arial, and sans-serif. Font files and `@font-face` declarations are not currently bundled, so appearance depends on locally available fonts.

## Making changes

| Change | Where to edit |
| --- | --- |
| Default selections | The `state` object in `src/main.js`. |
| Models and prices | The `models` array, model builders, and model icons in `src/main.js`; icon styles in `src/style.css`. |
| Palettes and Mixed behavior | `src/palettes.js`. Keep four shades per palette to preserve part assignments. |
| Material finishes | `finishMaterial()` and the Glass model treatment in `src/main.js`. |
| Ceramic grain, glaze, and reflections | `src/ceramic-material.js`. |
| Drawing brushes, projection, and history | `src/surface-paint.js`; controls in `src/pattern-studio.js` and `src/pattern-studio.css`. |
| Light temperature and displayed Kelvin values | `src/light-temperature.js`; keep the slider gradients in `src/style.css` consistent with its endpoint colors. |
| Layout and responsive behavior | `src/style.css`; immersive layout and camera framing functions in `src/main.js`. |
| Page title and description | `index.html`. |

Customizable materials carry `userData.colorSlot`, which maps them to one of the four palette shades. Keep the bulb material separate from painted surfaces when adding models or finishes. Immersive popups move the existing controls between layouts rather than duplicating their state or event handlers.

The ceramic implementation extends Three.js shader chunks through `onBeforeCompile`. After upgrading Three.js, verify the ceramic shader in a browser as well as running the production build.

Pattern Studio adds transparent paint atlases through the material shader while retaining the original surface finish. Pointer rays select the nearest visible surface; brush footprints are clipped to its triangles and projected into UV space. Cylinder caps have separate atlas regions, and double-sided surfaces have separate front/back sheets. New primitives need non-overlapping UVs. Mesh order and UV layout must stay consistent across finish rebuilds to preserve artwork. Atlases are allocated only on painted parts, and undo history records changed tiles rather than full images.

## Build and deployment

```sh
npm run build
npm run preview
```

Deploy the contents of `dist/` to a static web host. No Node.js application server is needed after the build. `npm run preview` is for local inspection of that build.

The default build assumes deployment at the domain root. For a subdirectory, supply the deployment path when building, for example:

```sh
npm run build -- --base=/lamp-configurator/
```

Files under `public/`, including the moodboard references, are copied into the build. `node_modules/` and `dist/` are ignored by Git; keep `package-lock.json` committed for reproducible dependency installation.

## Verification and troubleshooting

There are currently no automated test or lint scripts configured in `package.json`. After a functional or visual change, run `npm run build` and check the following in a browser:

- All four models and all finishes render without browser-console or WebGL errors.
- Each palette colors the correct parts; repeated Mixed clicks produce new combinations and matching swatches.
- Warm, neutral, and cool light leave surface colors and finishes intact; off/on restores the selected temperature.
- Mouse and touch controls work, and slider dragging does not rotate the lamp.
- Immersive popups switch and dismiss correctly; exiting preserves selections and restores the normal view.
- Portrait, landscape, and desktop layouts keep controls usable and the lamp correctly framed.
- Ceramic grain remains subtle and stable during rotation and zoom, with no visible seams or sparkling.
- All drawing tools work on mouse and touch; Draw locks rotation and Rotate makes no marks.
- Artwork stays on the decorated surface without appearing on opposite sides or cylinder caps.
- Undo/redo, erasing, clear confirmation, and model-switch confirmation work; palette, material, and view changes retain artwork.

| Issue | What to check |
| --- | --- |
| Dependency installation or Vite startup fails | Check `node --version` against the requirements above, and run commands from `my-product`. |
| The viewer is blank | Use the Vite server or a hosted build rather than opening `index.html` directly. Check WebGL 2 availability, graphics acceleration, and the browser console. |
| The temperature slider is disabled | Switch the lamp's light on. In immersive view, the switch is in the Light Temperature popup. |
| Typography differs between machines | The named font is not bundled; a fallback font may be in use. |
| The build reports a large JavaScript chunk | Three.js is included in the application bundle. A chunk-size warning alone does not mean the build failed. |
| Selections disappear after a reload | Configuration is currently stored only in page memory, not local storage or a database. |

## License

No project license file is currently included. Third-party package license information is provided with the installed dependencies.
