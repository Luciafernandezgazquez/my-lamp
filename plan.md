# STAP — Make light your own.

Final project documentation · Minor Visual Code · 5 November 2026

## 1. Project Overview

STAP is a playful lighting concept presented through an interactive 3D lamp configurator. The website invites visitors to explore a lamp as an object they can make their own: choosing its shape, colors, finish, and light, then adding a personal drawing.

The slogan **“Make light your own.”** connects the visual identity with the interaction. The lamp becomes a statement piece rather than disappearing into the room and instead of showing a fixed product photograph, the website lets visitors turn the lamp around and see their choices applied directly to it.


**Live website:** [my-lamp-omega.vercel.app](https://my-lamp-omega.vercel.app/)

## 2. Concept & Target Audience

The concept combines sculptural lighting with an approachable, colorful identity. Simple geometric forms give each lamp a recognizable silhouette, while soft colors and small animated moments make experimentation feel inviting.

The intended audience is people interested in contemporary interiors, expressive objects, and personalizing their living spaces. This is a design intention, not a conclusion from audience research.

Visitors can start with a coordinated palette or generate a mixed combination, compare materials, and adjust the atmosphere of the light. Pattern Studio extends this idea by letting them draw directly on the lamp. The aim is to make customization understandable through visible choices rather than technical settings.

## 3. Visual Identity

### Color

The original moodboard establishes five core colors. These remain the graphic direction, while the rendered lamps use related shades to distinguish their parts.

| Identity color | Exact hex |
| -------------- | --------- |
| Soft yellow    | `#F3E082` |
| Dusty pink     | `#E2AFB6` |
| Periwinkle     | `#A9B3DD` |
| White          | `#FFFFFF` |
| Black          | `#000000` |

The current interface uses near-black `#080808` for its main ink, white `#FFFFFF` for the page, and soft off-white `#FDFDFB` for the default viewer. Neutral lines include `#DEDEDE` and the viewer outline `#D6D6D1`. The yellow loading bubbles use exactly `#F3E082`.

The actual lamp palettes are defined in [src/palettes.js](src/palettes.js):

| Palette | Primary   | Accent    | Trim      | Cable     |
| ------- | --------- | --------- | --------- | --------- |
| Yellow  | `#F2E3AB` | `#D9C78F` | `#E8CEAA` | `#FCF4D9` |
| Pink    | `#EDB5C5` | `#D69BAE` | `#F4CCD7` | `#FBE5EA` |
| Blue    | `#BEC5E7` | `#9DA8CE` | `#D5D9EF` | `#EEF0FA` |
| White   | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` | `#FFFFFF` |
| Black   | `#000000` | `#000000` | `#000000` | `#000000` |

Mixed combines shades from the three pastel families. Lighting and material reflections affect their appearance on the 3D object.

Background options are Pink `#FFD6DC`, Periwinkle `#C5D0FF`, and Peach `#F3C482`. Pattern Studio offers inks `#D9819F`, `#E8C75F`, `#929FD5`, `#8ABCAF`, `#71566E`, `#FFFFFF`, and `#202020`, plus a custom color picker.

### Figma Link to designs
https://www.figma.com/design/OhxRttkQWmMvwc4RKxBYb9/Untitled?node-id=0-1&t=8pySSuK4HnZEdKWc-1

### Typography and composition

The original typography direction was Neue Haas Grotesk Display Pro, using 55 Roman for titles and 45 Light for body text. The implemented interface uses Helvetica Neue, with Helvetica, and sans-serif fallbacks. The page logo attempts to use locally installed Neue Haas Display Roman/Light through the name “Stap Display”; it falls back to Helvetica Neue, Helvetica, or Arial. No font files are bundled, so logo typography can vary between computers.

A thin circular frame keeps the lamp at the center of the composition. Numbered circles, outlined pill labels, circular swatches, and generous white space organize the controls without competing with the object. The compact logo and eye-shaped immersive-view button frame the header. Motion adds playfulness to this otherwise restrained layout.

### Original references and design assets

The original plan's references are retained here as the visual starting point:

| Asset                                          | Role in the project                                                                                     |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| [LAYOUT.jpg](public/assets/LAYOUT.jpg)         | Initial minimal viewer-and-controls layout.                                                             |
| [LAYOUT_2.jpg](public/assets/LAYOUT_2.jpg)     | Later desktop composition with a circular viewer and outlined controls.                                 |
| [LAMPS.png](public/assets/LAMPS.png)           | Sculptural silhouettes and simple geometric forms.                                                      |
| [LAYOUT-1.jpg](public/assets/LAYOUT-1.jpg)     | Original color moodboard.                                                                               |
| [LIGHTING.jpg](public/assets/LIGHTING.jpg)     | Soft, warm lighting from the left.                                                                      |
| [LOGO.jpg](public/assets/LOGO.jpg)             | Logo direction and top-left placement.                                                                  |
| [MATERIALS.jpg](public/assets/MATERIALS.jpg)   | Original Ceramic, Crystal, Matte, and Shine references; Shine was later removed as a selectable finish. |
| [TYPOGRAPHY.jpg](public/assets/TYPOGRAPHY.jpg) | Original Neue Haas typography direction.                                                                |

Three additional ceramic reference photographs in `public/assets/` informed grain, glaze, and surface imperfections. The material buttons now use the supplied Matte, Crystal, and Ceramic PNG previews. The STAP favicon is a PNG derived from the supplied SVG logo.

The mobile layout follows the supplied Figma screenshot, “Android Compact - 1.jpg.” That original screenshot is not stored in this repository; the [mobile review](artifacts/mobile-layout/README.md) preserves implementation screenshots and notes.

## 4. Main Features

| Feature                  | Final behavior                                                                                                                                                                               |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Four lamp models         | **BOP** has a broad tapered shade; **TUT** combines a flattened rounded body with a ring; **ZIG** has stacked tiers; **PIP** has an elongated rounded shade. All are interactive 3D objects. |
| Color customization      | Yellow, Pink, Blue, White, Black, and Mixed choices update the lamp's assigned parts. Repeated Mixed selections produce new combinations.                                                    |
| Material customization   | Matte, Crystal, and Ceramic previews select rendered finishes. PIP retains a glass-like treatment for its non-ceramic options.                                                               |
| Light temperature        | A warm-to-cool slider and on/off control affect the lamp's glow. The displayed 2700K–6500K range is an artistic approximation, not a calibrated lighting simulation.                         |
| Pattern Studio           | Watercolor, lines, polka dots, eraser, custom ink, tool size, dot spacing, undo/redo, and clear drawing. Draw and Rotate modes separate painting from camera movement.                       |
| Background customization | Three flat color options change the viewer backdrop. Clicking the selected option again restores off-white. Room photographs are not part of the final interface.                            |
| Viewing controls         | Drag to rotate; scroll or pinch to zoom; Reset view restores the default framing. Gentle automatic rotation stops during drawing and when reduced motion is enabled.                         |
| Immersive view           | Expands the viewer within the browser window and moves the existing controls into popups. Returning preserves the normal camera view, or reframes a newly selected model.                    |
| Loading and entrance     | Yellow bubbles fill the screen, wait for scene readiness, then reveal the configurator. The lamp fades, grows, rotates, assembles, and gradually lights up in a 3.6-second entrance.         |
| Model transitions        | A roughly 0.9-second sideways carousel moves the outgoing and incoming lamps together. Rapid selections keep the latest requested model without replaying the entrance.                      |
| Responsive layouts       | Desktop above 1200px; stacked tablet layout from 768px through 1200px; compact two-column mobile controls below 768px. Smaller and shorter windows can scroll.                               |

Drawing remains attached during rotation, color/material changes, and view changes. Switching models asks before discarding artwork. Configuration and artwork last only for the current page session.

Reduced-motion preferences provide an immediate or static alternative to the animated sequences. Interaction locks prevent rotation or painting from conflicting with active reveals and model transitions.

## 5. Technologies

The project uses **HTML, CSS, and JavaScript modules**, with no interface framework or backend. CSS Grid, Flexbox, media queries, and relative sizing adapt one shared interface to different screens.

**Three.js** (`^0.186.1` in `package.json`) renders the lamps, materials, lighting, and camera. Its OrbitControls handles rotation and zoom. The models are built in code from cylinders, spheres, rings, and revolved profiles; no external 3D model files are downloaded. Ceramic surface detail and the reflection environment are also generated in code.

**Vite** (`^8.3.0`) provides the development server and production build. **ESLint** (`^10.14.0`, with `@eslint/js` and `globals`) checks JavaScript; **Prettier** (`^3.9.10`) maintains formatting. Tests use Node.js's built-in test runner. Exact installed versions are recorded in `package-lock.json`. Vercel hosts the built static website.

The main responsibilities are separated as follows:

- `src/main.js`: shared configuration, scene, model construction, controls, and view management.
- `src/palettes.js`, `src/light-temperature.js`, and `src/ceramic-material.js`: colors, glow, and surface appearance.
- `src/startup.js` and the loader, entrance, and model-transition modules: readiness and motion sequences.
- `src/camera-framing.js`: keeping the suspension cord connected to the viewer's upper edge when zooming out.
- `src/pattern-studio.js` and `src/surface-paint.js`: drawing controls, surface painting, and history.
- `src/style.css`, `src/layout.css`, and feature stylesheets: shared appearance, responsive composition, and feature-specific styles.

Normal and immersive views reuse controls and state rather than creating separate configurators. Painting adds a transparent artwork layer to the existing material, preserving the chosen finish underneath.

## 6. Development Process

The Git history records an iterative process from 8 October to 5 November 2026. The original plan established the visual references; later commits show how the prototype became a more complete product experience.

| Period        | Development stage and evidence                                                                                                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 8–12 October  | Initial layout and reference assets were committed (`0390e16`), followed by the expanded configurator (`f2336a8`). The add-to-cart button was removed (`d90bd91`), keeping the focus on exploration.                                        |
| 12–19 October | Color variations, temperature controls, and ceramic appearance were refined. Lamp bodies were completed (`47a01aa`) and Pattern Studio was added (`800119f`).                                                                               |
| 20–21 October | A checkpoint preserved the earlier design (`90f270a`). The LAYOUT_2 redesign, three-finish selection, headline, Studio placement, and automatic rotation followed.                                                                          |
| 2 November    | The entrance animation (`59f2ba3`), model transitions (`93b462c`), and simpler viewer background (`0988c06`) were introduced.                                                                                                               |
| 3 November    | Mobile and intermediate layouts were corrected (`5821cbc`, `e319466`). A first loading animation was added, removed, and replaced with the bubble sequence (`be9cc7e`, `174219c`, `8395778`). Material thumbnails were updated (`59f149b`). |
| 4–5 November  | Cable framing was improved (`857c44b`), unused code was cleaned up and immersive camera restoration fixed (`8435a89`), the STAP favicon was added (`8111599`), and linting/formatting checks were configured (`e1b9075`).                   |

### Working with AI-assisted coding

I used AI-assisted coding to translate visual references and interaction ideas into an implementation, then refine it through specific requests. The design direction came from the STAP references and layout decisions: a quieter background, clearer mobile hierarchy, playful transitions, and preservation of the existing lamp designs.

The process involved asking for inspection before changes, developing features in stages, reviewing results, and requesting corrections when something did not fit the intended experience. For example, the first loading concept was replaced, and responsive fixes were requested without rebuilding the 3D scene. Git checkpoints and verification helped make those iterations traceable.

This document records the resulting code and decisions. It does not claim independent user research or that all code was written without assistance. A formal prompt log or course-specific AI declaration is not included in the repository.

## 7. Challenges & Solutions

**Intermediate screen sizes.** The desktop height constraints and a large viewer caused overlap when the layout stacked. The solution gave the circle its own content-sized row, capped its diameter, aligned the controls explicitly, and allowed scrolling. The [responsive review](artifacts/responsive-layout/README.md) includes before-and-after evidence.

**Suspension and camera framing.** At maximum zoom-out the cord could look detached from the circle. The cable and camera limits were adjusted so the cord reaches beyond the top edge while the body stays visible. The zoom limit accounts for the camera angle rather than using one fixed distance.

**Returning from immersive view.** Later resize notifications and remaining rotation damping could overwrite the restored camera. The cleanup settled that movement and protected the saved view during layout updates. A different selected model still receives fresh framing.

**Coordinating animations.** Loading needed to wait for actual scene preparation without cutting short the visual sequence on fast connections. Separate readiness and animation completion checks coordinate the handoff. Entrance and transition modules restore final positions, handle reduced motion, and release interaction locks. A latest-selection queue handles rapid model changes.

**Drawing without losing customization.** Pattern Studio uses a separate paint layer and explicit Draw/Rotate modes. Artwork survives finish changes, while confirmation prevents accidental loss when switching models. This keeps a complex feature connected to the existing material controls.

**Favicon compatibility.** The SVG-only favicon did not appear as expected in Safari. A square PNG made from the existing STAP logo replaced the active SVG reference. Its URL and build inclusion were verified; a direct Safari check remains separate from the successful Chrome check. SVG support or caching was a suspected cause, not a proven diagnosis.

**Code organization.** The final cleanup removed unused starter files and obsolete selectors, consolidated CSS carefully, and corrected documentation. ESLint and Prettier were added afterward. Painting and render-loop optimization were deliberately deferred until profiling could justify changes.

## 8. Testing & Verification

### Automated checks

Re-run on **5 November 2026**, against the current project:

| Check                  | Result                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| `npm test`             | **19 tests passed**: 5 loader, 6 entrance, 6 model-transition, and 2 camera-framing tests. |
| `npm run lint`         | Passed with no errors or warnings.                                                         |
| `npm run format:check` | Passed.                                                                                    |
| `npm run build`        | Successful; output generated in `dist/`.                                                   |

The tests cover fast/slow readiness, failure recovery, reduced motion, exact final poses, assembly and lighting timing, rapid selections, and cord framing. They do not replace visual review or test every drawing interaction.

The previous formatting verification also found unchanged JavaScript syntax trees and identical built JavaScript/CSS hashes. This supports that cleanup did not alter the shipped behavior or appearance.

### Browser-based and visual review

Saved [mobile](artifacts/mobile-layout/README.md), [responsive](artifacts/responsive-layout/README.md), and [loading](artifacts/bubble-loader/README.md) reviews record Chrome checks, screenshots, and touch emulation. Responsive checks covered widths **320, 375, 430, 600, 768, 900, 1024, 1200, and 1440px**, including short windows and breakpoint boundaries.

Those reviews checked viewer proportions, overlap, scrolling, accessible controls, rotation/pinch, customization, painting, and animation handoffs. They are development-time browser checks, separate from the 19 Node.js tests. Older notes report the test count at their capture date, not the final count.

Visual comparison used the supplied design references. No formal participant usability study or comprehensive physical-phone testing is documented. Touch emulation should not be presented as testing on actual iOS and Android devices.

### Live deployment

The supplied [Vercel website](https://my-lamp-omega.vercel.app/) returned **HTTP 200** on 5 November 2026. Live Chrome smoke checks at **1440 × 900** and **375 × 900** confirmed startup completed, the 3D canvas initialized, and selecting TUT updated the active model. No JavaScript runtime errors or horizontal overflow were detected in those checks. Reduced motion was enabled for this smoke test, so it does not constitute a fresh live-site animation review or a complete cross-browser acceptance test.

## 9. Final Status

STAP is a completed interactive course prototype with four models, coordinated colors, three finishes, adjustable lighting, drawing tools, immersive viewing, responsive layouts, and connected motion sequences. The local quality checks and production build pass.

Known limitations remain clear:

- No shopping cart, checkout, accounts, saved configurations, or drawing export. Reloading clears the session.
- Lighting and material previews are visual approximations, not manufacturing or photometric specifications.
- WebGL 2 and graphics acceleration are required; performance varies by device. Painting and continuous rendering have not undergone a dedicated optimization/profiling pass.
- The build still warns about a **612.06 KB** minified JavaScript chunk (about **155.30 KB** gzip). Bundle optimization is deferred.
- The last dependency audit reported **six vulnerabilities**: four moderate in the ESLint dependency chain and two high involving Vite/build dependencies. Passing lint and tests does not resolve these; dependency updates need separate review.
- Logo font fallbacks can change its appearance across machines. Direct Safari favicon and physical-device checks remain to be documented.

The project is ready to present as a working design prototype, with these limits disclosed. Before final submission, add any required student/course details and AI-use declaration, and confirm the attribution or permitted use of supplied reference images. Include the original mobile Figma export or a share link if the assessment requires it. A short personal reflection on what was learned would also strengthen the submission; it should come from the student rather than be inferred from Git history.

This final plan preserves the original moodboard while documenting the implemented project. [README.md](README.md) remains the detailed guide for running and maintaining it; Git history and `artifacts/` provide supporting development evidence.
