# Stap — Light with character

An interactive 3D lamp configurator for a playful, contemporary lighting brand. Visitors can choose a sculptural lamp, coordinate its colors, explore different finishes, adjust its glow, and draw a personal design directly on its surface.

The application runs entirely in the browser. It is a product configurator prototype with a price display; it does not include a shopping cart, checkout, accounts, or a backend.

## Current layout

The regular configurator follows [LAYOUT_2.jpg](public/assets/LAYOUT_2.jpg), designed at **1440 × 1024**: a circular viewer, numbered outline pills, circular choices, a centered headline, and the eye-shaped immersive button. The viewer now uses a plain soft off-white background with a subtle 1px neutral outline, replacing the colored gradients. Model, Color, and Material sit on the left; Light Temperature, Studio, and Background sit on the right. On smaller screens the viewer moves above a two-column control layout.

Below **768px**, the mobile layout follows the supplied “Android Compact - 1” Figma reference: compact header, centered headline, circular viewer, separator, then Model / Color / Material opposite Light Temperature / Studio / Background. The page scrolls vertically, swatches have larger tap areas than their visible circles, and the temperature slider remains directly accessible. These presentation changes live in `src/layout.css`; the existing scene, camera logic, animations, and shared controls are reused. See the [mobile previews and verification notes](artifacts/mobile-layout/README.md).

From **768px through 1200px**, the viewer occupies its own row above two aligned columns of controls. Its diameter grows from 480px to a maximum of 560px, within the available width. The stacked layout uses content-sized rows without size containment, allowing vertical scrolling instead of overlap. Above 1200px, the desktop composition remains; windows shorter than 640px scroll a minimum-height layout to keep the controls usable. Pattern Studio uses its existing immersive layout through 1200px so the lamp and tools stay together. See the [responsive review and previews](artifacts/responsive-layout/README.md).

The headline reads “Make light your own.” Three material finishes are available: Ceramic, Crystal, and Matte. The initial BOP / Yellow / Ceramic configuration is unchanged; the reference illustrates a different PIP configuration. The live models, palettes, lighting, and surface finishes retain their existing behavior.

The regular view uses the reference's color-family swatches; immersive Color options display the four actual shades in each palette. Mixed updates its preview after each click. Selection dots identify active model, color, and material choices without changing the reference's button shapes.

- Click the **04.** badge to turn the lamp on/off. Its tooltip and accessible label describe the current action; the temperature slider dims when off.
- **start now** opens Pattern Studio.
- **Background** changes only the viewer's flat backdrop color. Click the selected swatch again to return to off-white. The chosen background survives view changes; immersive view also uses a plain fill.
- Hover or focus the desktop viewer to reveal **Reset view**, rotation guidance, and the current price below the circle. On phones, **Reset view** stays visible inside the circle; guidance and price are hidden to match the compact reference.
- The normal camera fits the complete lamp body, with its suspension cord continuing to the circle's top edge as in the reference. Immersive view fits the entire model, including the cord.

Git checkpoint **`90f270a`** preserves the working configurator and supplied reference before this redesign.

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
| `npm test` | Check loading-screen handoff, entrance and model-transition timing, pose restoration, rapid selections, and reduced motion. |
| `npm run preview` | Serve an existing production build locally, normally on port 4173. |
| `npm run dev -- --host 0.0.0.0` | Make the development server reachable from another device on the same network. |

For phone testing, use your computer's local network address and the port printed by Vite. The phone and computer must be able to reach one another on that network.

## Using the configurator

1. Select a **Model**: BOP, TUT, ZIG, or PIP.
2. Select a **Color** palette: Pink, Yellow, Blue, White, Black, or Mixed colors.
3. Choose a **Material**: Ceramic, Crystal, or Matte.
4. Switch the lamp on and adjust **Light temperature** from warm through neutral to cool white.
5. Drag the lamp to rotate it. Use the mouse wheel or a touch pinch to zoom. The desktop viewer also provides **Reset view**.
6. Open **Pattern Studio** to decorate the lamp with watercolor, lines, or polka dots.

The initial configuration is **BOP / Yellow / Ceramic**, with the light on and the temperature slider at **32**, displayed as approximately **3550K**. Its displayed price is **€355**.

Selections survive entry to and exit from immersive view. They are held in memory for the current page session; reloading restores the defaults.

### Loading screen

Each fresh visit or refresh starts with a centered 32px **#F3E082** circle on white. After a 160ms pause, it expands over 680ms to cover the viewport. It holds there until the initial scene is ready, then contracts over 1.15 seconds with a strong ease-out, inspired by the supplied screen recording. The recording starts with a filled panel contracting; the preceding expansion follows the requested small-to-full sequence.

The loading overlay is included in `index.html`, with its own small stylesheet, so it can appear before the main JavaScript bundle loads. `bootstrap.js` waits for `sceneReady`: generated lamp geometry and environment textures, shader compilation, font readiness, the decoded material-preview image, and an initial rendered frame. Fast loads still complete both circle phases; slow loads extend the full-yellow hold. Preparation failures show a retry button.

The configurator is inert to pointer and keyboard input during loading. Once contraction finishes, the existing lamp entrance starts at its first frame, the overlay is removed, and controls become available under the entrance animation's existing interaction rules. Changing a model, finish, palette, or view never replays the loader. With reduced motion, a static dot remains until readiness, then the configurator appears without the circle animation or lamp entrance. No new dependencies were added. See the [loading-screen review](artifacts/loading-screen/README.md).

### Entrance animation

After the loading screen, the lamp fades in, grows gently to its normal size, and rotates into position. The collar, shade, trim, and bulb assemble with staggered vertical motion, followed by a soft light transition. The complete lamp reveal lasts **3.6 seconds**:

- **0–0.85 seconds:** fade in.
- **0–1.7 seconds:** scale and rotation settle.
- **0.95–2.65 seconds:** components assemble into their exact original positions.
- **2.65–3.6 seconds:** the bulb and lamp light gradually illuminate at the selected temperature.

Rotation, zoom, and painting are locked during the reveal. The configuration controls remain available: colors and temperature apply immediately; choosing a model or material, or using Reset view, completes the entrance immediately without replaying it. Opening Pattern Studio during the entrance preserves its selected Draw/Rotate mode when the reveal ends. View changes and resizes continue to fit the final assembled lamp.

With `prefers-reduced-motion: reduce`, the lamp appears immediately in its finished state and automatic rotation is disabled; manual rotation and customization remain available. Enabling reduced motion during the reveal immediately completes it. The animation uses the existing render loop and adds no runtime dependencies.

### Switching models

Selecting a different model plays a **0.9-second horizontal 3D carousel transition**, adapted from the actual video in the [Pinterest reference](https://ca.pinterest.com/pin/286893438754010068/). The outgoing lamp moves sideways and turns away while the incoming lamp approaches from the opposite side and settles at its original scale and orientation. Both remain solid, with a little depth travel and smooth camera framing. Choosing an earlier model reverses the direction. Geometry, component positions, materials, and the page layout are unchanged.

Rotation, zoom, and painting are locked during the transition. Color and lighting controls apply to both visible lamps. Rapid clicks retain only the latest pending selection; at most two lamps exist during the handoff, and the outgoing geometry, materials, and paint textures are released afterward. Clicking the arriving model cancels any pending change. Pattern Studio keeps its existing confirmation before discarding artwork, and returns to its selected Draw/Rotate mode afterward.

Changing material, resetting the camera, resizing, or entering/leaving immersive view immediately settles the latest selected model. Reduced motion switches models immediately. Model changes never replay the initial entrance animation. The transition runs in the existing Three.js render loop without additional dependencies.

### Immersive view

Use the circular button at the top-right of the page to fill the browser viewport with the lamp viewer. This expands the page layout without invoking the browser's native fullscreen API.

- The model name remains at the top-left, with an exit button at the top-right.
- Five icon buttons provide **Model**, **Color**, **Material**, **Light Temperature**, and **Pattern Studio** controls.
- Each button opens a compact popup. Only one popup is open at a time.
- Click outside, use the popup's close button, or press **Escape** to close a popup. Pressing Escape with no popup open exits immersive view.
- The light on/off button is available inside the Light Temperature popup.
- The camera and viewer resize to leave room for the controls. On short landscape screens, the controls sit beside the lamp. The selected background becomes a plain backdrop in this view.
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

Ceramic uses object-space surface detail to avoid UV seams and keep the grain attached to the lamp during rotation. Scaled geometry keeps the grain consistent across differently shaped parts; subpixel detail fades at a distance to reduce shimmer. A shared, neutral studio environment supplies broad reflections. The reference photographs guide the finish and are not applied as color textures.

The PIP model uses the ceramic finish when Ceramic is selected. Its other finish choices retain the model's glass treatment. With Crystal selected, accent parts use a glossy finish for definition.

### Lighting

The temperature slider runs from 0 to 100, with displayed reference points of **2700K**, **4000K**, and **6500K**. It smoothly blends warm white (`#FFE6AD`) through neutral white (`#FFFFFF`) to cool white (`#F4F7FF`). These are artistic color approximations rather than a physically calibrated color-temperature simulation.

The emitted light color is normalized to constant linear luminance, and the light intensity remains fixed across the range. Temperature changes affect the bulb's emissive glow and the lamp's point light; they do not rewrite the painted surfaces' base colors or emissive properties. Nearby surfaces can still respond naturally to illumination. Studio lighting remains fixed.

Switching the light off disables and dims the slider. Switching it back on restores the selected temperature. The same controls and state are used in normal and immersive views.

### Displayed pricing

The displayed total is the model price plus the finish surcharge, defined in [src/main.js](src/main.js). It appears with the regular viewer's auxiliary controls on hover/focus, and remains visible on smaller screens.

| Model | Base price |
| --- | --- |
| BOP | €320 |
| TUT | €365 |
| ZIG | €410 |
| PIP | €490 |

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
│   ├── bootstrap.js           Scene readiness and loading-screen handoff
│   ├── loading-screen.js      Overlay lifecycle, interaction lock, and retry
│   ├── loading-screen.css     Early-loading circle motion and reduced motion
│   ├── main.js                UI, shared state, lamp geometry, scene, and interactions
│   ├── entrance-animation.js  Load-only reveal, assembly offsets, and light timing
│   ├── model-transition.js    Model carousel, camera blending, and latest-selection queue
│   ├── style.css              Layout, typography, controls, and responsive styles
│   ├── layout.css             LAYOUT_2 presentation, circular viewer, and responsive placement
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
| [LAYOUT_2.jpg](public/assets/LAYOUT_2.jpg) | Current visual source of truth: desktop layout, typography, buttons, circular backdrop, and material thumbnails. |
| [LAMPS.png](public/assets/LAMPS.png) | Sculptural lamp silhouettes. |
| [LAYOUT-1.jpg](public/assets/LAYOUT-1.jpg) | Original color direction. |
| [LIGHTING.jpg](public/assets/LIGHTING.jpg) | Warm, soft lighting from the left. |
| [LOGO.jpg](public/assets/LOGO.jpg) | Stap logo direction. |
| [MATERIALS.jpg](public/assets/MATERIALS.jpg) | Finish options. |
| [TYPOGRAPHY.jpg](public/assets/TYPOGRAPHY.jpg) | Typography direction. |
| [ceramic-reference-01.jpg](public/assets/ceramic-reference-01.jpg) | Surface texture and fine grain. |
| [ceramic-reference-02.jpg](public/assets/ceramic-reference-02.jpg) | Glaze and soft reflections. |
| [ceramic-reference-03.jpg](public/assets/ceramic-reference-03.jpg) | Subtle surface imperfections. |

The current interface uses **Arial** to match the supplied layout's letterforms and spacing. The logo uses locally installed Neue Haas Display Roman/Light through `@font-face` local sources, with Helvetica Neue, Helvetica, and Arial fallbacks. No font binaries or third-party font requests are bundled. Logo metrics may vary on machines without those local fonts.

## Making changes

| Change | Where to edit |
| --- | --- |
| Default selections | The `state` object in `src/main.js`. |
| Models and prices | The `models` array, model builders, and model icons in `src/main.js`; icon styles in `src/style.css`. |
| Palettes and Mixed behavior | `src/palettes.js`. Keep four shades per palette to preserve part assignments. |
| Material finishes | `finishMaterial()` and the PIP model treatment in `src/main.js`. |
| Ceramic grain, glaze, and reflections | `src/ceramic-material.js`. |
| Drawing brushes, projection, and history | `src/surface-paint.js`; controls in `src/pattern-studio.js` and `src/pattern-studio.css`. |
| Light temperature and displayed Kelvin values | `src/light-temperature.js`; keep the slider gradients in `src/style.css` consistent with its endpoint colors. |
| Current layout and responsive behavior | `src/layout.css`, loaded after the existing component styles; immersive placement and camera framing functions in `src/main.js`. |
| Headline, numbered sections, and background choices | The page template and background handler in `src/main.js`. |
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

Run `npm test` for entrance and model-transition lifecycle checks, and `npm run build` for the production build. No lint script is configured. After a functional or visual change, also check the following in a browser:

- The entrance runs once in approximately 3.6 seconds, restores the exact assembled pose, and releases rotation/painting. Check reduced motion, resizing during the reveal, and changing selections before it completes.
- Model transitions travel in both directions, settle in 0.9 seconds, preserve the final pose, and handle rapid selections without extra lamps. Check temperature/palette changes during motion, artwork confirmation, reduced motion, and drawing after completion.

- All four models and all finishes render without browser-console or WebGL errors.
- Each palette colors the correct parts; repeated Mixed clicks produce new combinations and matching swatches.
- Warm, neutral, and cool light leave surface colors and finishes intact; off/on restores the selected temperature.
- Mouse and touch controls work, and slider dragging does not rotate the lamp.
- Immersive popups switch and dismiss correctly; exiting preserves selections and restores the normal view.
- Portrait, landscape, and desktop layouts keep controls usable and the lamp correctly framed.
- Compare the regular view against `public/assets/LAYOUT_2.jpg` at 1440 × 1024; check the circle and numbered groups against the reference coordinates.
- Background changes preserve all lamp settings, and the 04. light toggle stays connected when controls move into immersive view.
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
