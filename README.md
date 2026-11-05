# STAP — Light with Character

**Make light your own.**

STAP is a playful, contemporary lighting brand concept with an interactive 3D lamp configurator. Choose a sculptural shape, explore colors and finishes, and paint directly on the lamp to create something personal and expressive.

The project combines graphic design, creative coding, and interactive product customization to make lighting feel more personal and expressive.

 See [plan.md](plan.md) for the design concept, references, and development process.

## Main Features

- **Four 3D lamps:** BOP, TUT, ZIG, and PIP.
- **Colors and materials:** pastel, white, black, and generated Mixed palettes; Matte, Crystal, and Ceramic finishes. PIP retains a glass-like treatment for its non-ceramic options.
- **Lighting:** warm-to-cool temperature adjustment and an on/off control. Kelvin values are visual approximations.
- **Pattern Studio:** watercolor, lines, polka dots, eraser, custom ink, brush sizing, and undo/redo. Switch between Draw and Rotate to decorate different sides.
- **Backgrounds:** pink, periwinkle, and peach; select the active swatch again to return to off-white.
- **Viewing controls:** mouse/touch rotation, wheel/pinch zoom, Reset view, and an immersive mode that expands the viewer within the browser window.
- **Motion:** yellow-bubble loading, an assembling lamp entrance, and animated model transitions, with reduced-motion support.
- **Responsive interface:** desktop, tablet, and mobile layouts using the same scene and controls.

The starting configuration is BOP / Yellow / Ceramic. Drawings survive color, material, and view changes; switching models asks before discarding artwork. Reloading clears all customization. This prototype has no checkout, accounts, or save/export feature.

## Technologies Used

- **HTML, CSS, and JavaScript modules:** interface, responsive layout, and interactions; no UI framework.
- **Three.js and OrbitControls:** 3D geometry, materials, lighting, rotation, and zoom.
- **Vite:** local development server and production build.
- **ESLint**, with `@eslint/js` and `globals`: JavaScript checks.
- **Prettier:** consistent code and document formatting.
- **Node.js test runner:** automated animation, loading, and camera tests.
- **Vercel:** static website hosting.

Dependencies are declared in [package.json](package.json), with exact versions in `package-lock.json`.

## Getting Started

Use **Node.js 24+** and npm, plus a browser with WebGL 2 and graphics acceleration. Node.js 22.13+ within the 22.x line and 20.19+ within the 20.x line are also supported by the current tools. No API keys, environment variables, or backend are needed.

From the project folder:

```sh
npm install
npm run dev
```

Open the URL printed in the terminal, normally `http://localhost:5173`. Use the server rather than opening the HTML file directly. To install the exact locked dependency versions, use `npm ci` instead of `npm install`.

Create and inspect a production build:

```sh
npm run build
npm run preview
```

The build is written to `dist/`; preview normally runs at `http://localhost:4173`. Deploy `dist/` to a static host. Edit source files, not the generated files in `dist/`.

## Project Structure

| Location                                    | Purpose                                                                                       |
| ------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `index.html`                                | Page entry point, loading overlay, title, and favicon.                                        |
| `src/main.js`                               | Shared state, lamp construction, scene, and viewing controls.                                 |
| `src/`                                      | Animation, camera, palette, lighting, material, and painting modules, plus responsive styles. |
| `public/assets/`                            | Material thumbnails, STAP favicon, and design-reference images.                               |
| `tests/`                                    | Automated loading, entrance, model-transition, and camera tests.                              |
| `artifacts/`                                | Development screenshots and browser-review notes.                                             |
| `plan.md`                                   | Design decisions, development history, and known limitations.                                 |
| `package.json` and tool configuration files | Dependencies, commands, linting, and formatting rules.                                        |

## Live Website

[Explore the STAP configurator](https://my-lamp-omega.vercel.app/)

## Code Quality & Testing

| Command                | Purpose                                        |
| ---------------------- | ---------------------------------------------- |
| `npm test`             | Run the automated tests.                       |
| `npm run lint`         | Check JavaScript with ESLint.                  |
| `npm run format`       | Apply Prettier formatting; this changes files. |
| `npm run format:check` | Check formatting without changing files.       |
| `npm run build`        | Verify the production build.                   |

**Verified on 5 November 2026:** all **19 tests**, ESLint, and the production build pass. Prettier passed at the code-quality checkpoint (`e1b9075`); the latest check flags formatting in the subsequently edited `plan.md`. This README passes its formatting check.

Browser reviews cover desktop/tablet/mobile sizing and Chrome touch emulation; these are separate from automated unit tests and physical-device testing. See [responsive review notes](artifacts/responsive-layout/README.md) and [plan.md](plan.md) for the verification scope.

The build retains a warning about a roughly **612 KB** JavaScript chunk. The last dependency audit also reported six vulnerabilities in development/build dependencies; these remain pending review. Neither warning has been hidden or resolved by documentation changes.

## Credits & References

- **Design:** supplied STAP layouts and moodboard assets, with the [Figma design](https://www.figma.com/design/OhxRttkQWmMvwc4RKxBYb9/Untitled?node-id=0-1) linked in the plan. The full reference inventory is in [plan.md](plan.md#original-references-and-design-assets).

- **Images:** `public/assets/` includes the layout, lamp, lighting, logo, typography, and material moodboards; `ceramic-reference-01.jpg` through `03.jpg`; and `material-matte.png`, `material-crystal.png`, and `material-ceramic.png`. 

- **Motion references:** the [Pinterest model-transition reference](https://ca.pinterest.com/pin/286893438754010068/) 

- **Fonts and logo:** the interface uses Arial with Helvetica Neue, Helvetica, and sans-serif fallbacks. The page logo requests locally installed Neue Haas Display Roman/Light, with fallback fonts.

- **3D assets:** lamp geometry, ceramic detail, and the reflection environment are generated in code. No external 3D models or photographic surface textures are loaded; the material PNGs are UI previews.

- **Open-source software:** [Three.js](https://github.com/mrdoob/three.js), [Vite](https://github.com/vitejs/vite), [ESLint and @eslint/js](https://github.com/eslint/eslint), [globals](https://github.com/sindresorhus/globals), and [Prettier](https://github.com/prettier/prettier) declare MIT licenses in the installed packages. Their copyright and license notices remain applicable; bundled/transitive dependencies have their own notices.

No project-wide license has been selected. Third-party library licenses do not grant reuse rights to the project's reference images, logo, or fonts. Confirm outstanding credits and permissions before submission or redistribution.
