import './style.css'
import './pattern-studio.css'
import './layout.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { palettes, mixedShades } from './palettes.js'
import { lightTemperature } from './light-temperature.js'
import { createCeramicEnvironment, createCeramicMaterial } from './ceramic-material.js'
import { createPatternStudio } from './pattern-studio.js'

const models = [
  { id: 'dome', name: 'Dome', price: 320 },
  { id: 'orbit', name: 'Orbit', price: 365 },
  { id: 'tier', name: 'Tier', price: 410 },
  { id: 'glass', name: 'Glass', price: 490 },
]

const materials = [
  { id: 'ceramic', name: 'Ceramic', price: 35 },
  { id: 'crystal', name: 'Crystal', price: 90 },
  { id: 'matte', name: 'Matte', price: 0 },
]

const state = {
  model: models[0],
  palette: 'yellow',
  shades: [...palettes[1].shades],
  material: materials[0],
  temperature: 32,
  lightOn: true,
  background: 'cream',
}

const modelIcon = (id) => `
  <span class="model-icon model-icon--${id}" aria-hidden="true">
    <i></i><b></b><em></em>
  </span>
`

const paletteButtons = () => ['yellow', 'pink', 'blue', 'mixed', 'white', 'black'].map(id => palettes.find(palette => palette.id === id)).map(({ id, name, shades }) => `
  <button class="color-option${state.palette === id ? ' is-selected' : ''}"
    type="button" aria-pressed="${state.palette === id}" data-palette="${id}"
    aria-label="${name}" title="${id === 'mixed' ? 'Mixed colors — generate a new combination' : name}">
    <span class="palette-swatch" aria-hidden="true" style="--swatch-color:${shades[0]};background: linear-gradient(180deg, ${(id === 'mixed' ? ['#A9B3DD', '#F3C482', '#FFD6DC', '#D9F2CD'] : shades).map((shade, i) => `${shade} ${i * 25}% ${(i + 1) * 25}%`).join(', ')})"></span>
    <span>${name}</span>
  </button>
`).join('')

const immersiveCategories = [
  { id: 'model', label: 'Model', icon: '<path d="M12 3v4M7 15h10M5 15a7 7 0 0 1 14 0v2H5zM9 20h6"/>' },
  { id: 'color', label: 'Color', icon: '<circle cx="9" cy="8" r="4"/><circle cx="15" cy="8" r="4"/><circle cx="12" cy="14" r="4"/>' },
  { id: 'material', label: 'Material', icon: '<path d="m12 3 9 5-9 5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5"/>' },
  { id: 'temperature', label: 'Light Temperature', icon: '<path d="M10 14V5a2 2 0 0 1 4 0v9a4 4 0 1 1-4 0ZM12 8v9M17 6h3M17 10h2"/>' },
  { id: 'pattern', label: 'Pattern Studio', icon: '<path d="m14 4 6 6-9 9H5v-6zM12 6l6 6M4 21h16"/>' },
]

document.querySelector('#app').innerHTML = `
  <div class="site-shell">
    <header class="site-header">
      <a class="logo" href="#" aria-label="Stap lighting home"><span>sta</span><span>p</span></a>
      <div class="header-rule" aria-hidden="true"></div>
      <button class="menu-button" id="immersive-trigger" type="button" aria-label="Open immersive lamp view" title="Open immersive view" aria-expanded="false"><svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 16s4.5-9 13-9 13 9 13 9-4.5 9-13 9S3 16 3 16Z"/><circle cx="16" cy="16" r="4.5"/></svg></button>
    </header>
    <h1 class="page-title">Lorem ipsum dolor sit amet consectetur.</h1>
    <main class="configurator">
      <section class="viewer" aria-label="Interactive 3D lamp viewer">
        <div class="viewer-copy">
          <p class="eyebrow">Your light, your mood</p>
          <h2 id="lamp-title">Dome <span>01</span></h2>
        </div>
        <div class="scene-backdrop" aria-hidden="true"><span></span><span></span></div>
        <div class="canvas-wrap" id="canvas-wrap"></div>
        <button class="immersive-exit" id="immersive-exit" type="button" aria-label="Exit immersive view">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </button>
        <div class="viewer-toolbar">
          <p><span class="drag-icon" aria-hidden="true">↔</span> Drag to rotate</p>
          <button id="reset-view" type="button">Reset view</button>
          <p class="viewer-price"><span>Final price</span> <strong id="price">€355</strong></p>
        </div>
        <div class="immersive-dock">
          <section class="immersive-popup" id="immersive-popup" aria-labelledby="immersive-popup-title" hidden>
            <div class="immersive-popup-heading">
              <h2 id="immersive-popup-title">Model</h2>
              <div class="immersive-popup-actions">
                <button id="close-immersive-popup" type="button" aria-label="Close options">×</button>
              </div>
            </div>
            <div class="immersive-popup-content"></div>
          </section>
          <div class="immersive-bar" role="group" aria-label="Lamp configuration">
            ${immersiveCategories.map(({ id, label, icon }) => `
              <button type="button" class="immersive-tool" data-panel="${id}" aria-controls="immersive-popup" aria-expanded="false">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icon}</svg>
                <span>${label}</span>
              </button>
            `).join('')}
          </div>
        </div>
      </section>

      <aside class="controls" aria-label="Lamp configuration">
        <section class="control-section model-control">
          <div class="section-title"><span>01.</span><h3>Model</h3></div>
          <div class="model-grid" role="radiogroup" aria-label="Lamp model">
            ${models.map((model, index) => `
              <button class="model-option${index === 0 ? ' is-selected' : ''}" type="button" role="radio" aria-label="${model.name}" title="${model.name}" aria-checked="${index === 0}" data-model="${model.id}">
                ${modelIcon(model.id)}
                <span>${model.name}</span>
                <small>0${index + 1}</small>
              </button>
            `).join('')}
          </div>
        </section>

        <section class="control-section color-control">
            <div class="section-title"><span>02.</span><h3>Color</h3></div>
            <div class="color-row" role="group" aria-label="Lamp colors">
              ${paletteButtons()}
            </div>
        </section>
        <section class="control-section material-control">
            <div class="section-title"><span>03.</span><h3>Material</h3></div>
            <div class="material-grid" role="radiogroup" aria-label="Lamp material">
              ${materials.map((material, index) => `
                <button class="material-option${index === 0 ? ' is-selected' : ''}" type="button" role="radio" aria-label="${material.name}" title="${material.name}" aria-checked="${index === 0}" data-material="${material.id}">
                  <i class="material-sample material-sample--${material.id}"></i>
                  <span>${material.name}</span>
                </button>
              `).join('')}
            </div>
        </section>

        <section class="control-section temperature-control">
          <div class="section-title">
            <button class="light-toggle is-on" id="light-toggle" type="button" aria-pressed="true" aria-label="Turn lamp light off" title="Light on — click to switch off">
              <span class="light-toggle__icon" aria-hidden="true">04.</span><span id="light-label">Light on</span>
            </button>
            <h3>Light temperature</h3><output id="temperature-value" for="temperature">3550K</output>
          </div>
          <input id="temperature" type="range" min="0" max="100" step="0.1" value="32" aria-label="Light temperature" aria-describedby="temperature-help">
          <div class="range-labels"><span>Warm</span><span>Neutral</span><span>Cool</span></div>
          <p id="temperature-help" class="sr-only">Turn on the lamp to adjust its light temperature.</p>
        </section>

        <section class="control-section pattern-entry">
          <div class="section-title"><span>05.</span><h3>Studio</h3></div>
          <button id="open-pattern-studio" type="button" aria-label="Start Pattern Studio" aria-expanded="false" aria-controls="pattern-panel">start now</button>
        </section>
        <section class="control-section background-control">
          <div class="section-title"><span>06.</span><h3>Background</h3></div>
          <div class="background-options" role="group" aria-label="Viewer background">
            ${[{id:'pink', name:'Pink', color:'#FFD6DC'}, {id:'blue', name:'Periwinkle', color:'#C5D0FF'}, {id:'peach', name:'Peach', color:'#F3C482'}].map(({id,name,color}) => `<button type="button" data-background="${id}" aria-label="${name} background" aria-pressed="false" title="${name} background — click again for cream" style="--background-swatch:${color}"></button>`).join('')}
          </div>
        </section>
        <section class="pattern-panel" id="pattern-panel" aria-label="Pattern Studio" hidden></section>
      </aside>
    </main>
    <p id="color-status" class="sr-only" role="status"></p>
  </div>
`

const canvasWrap = document.querySelector('#canvas-wrap')
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// Let the canvas follow its container in both layouts, without a fixed inline size.
renderer.setSize(canvasWrap.clientWidth, canvasWrap.clientHeight, false)
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.NeutralToneMapping
renderer.toneMappingExposure = 0.95
canvasWrap.appendChild(renderer.domElement)
const ceramicEnvironment = createCeramicEnvironment(renderer)

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(32, canvasWrap.clientWidth / canvasWrap.clientHeight, 0.1, 100)
camera.position.set(5.2, 1.1, 8.5)

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.enablePan = false
controls.minDistance = 6
controls.maxDistance = 13
controls.minPolarAngle = Math.PI * 0.27
controls.maxPolarAngle = Math.PI * 0.66
controls.target.set(0, -0.25, 0)

scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d6cc, 1))

const keyLight = new THREE.DirectionalLight(0xffd9a6, 2.6)
keyLight.position.set(-4, 7, 3)
keyLight.castShadow = true
keyLight.shadow.mapSize.set(1024, 1024)
keyLight.shadow.normalBias = 0.025
keyLight.shadow.camera.left = -5
keyLight.shadow.camera.right = 5
keyLight.shadow.camera.top = 6
keyLight.shadow.camera.bottom = -5
scene.add(keyLight)

const fillLight = new THREE.DirectionalLight(0xbec8ff, 0.65)
fillLight.position.set(4, 1, -4)
scene.add(fillLight)

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(14, 14),
  new THREE.ShadowMaterial({ color: 0x58524c, opacity: 0.14 }),
)
floor.rotation.x = -Math.PI / 2
floor.position.y = -2.72
floor.receiveShadow = true
// The reference uses a flat, graphic shadow inside the circular backdrop.
floor.visible = false
scene.add(floor)

const lampRoot = new THREE.Group()
scene.add(lampRoot)
let lampLight
let lampBulb
let revealScale = 1
let normalStudioOpen = false
const studio = createPatternStudio({ canvas: renderer.domElement, camera, controls, root: lampRoot, onClose: closePatternStudio })

function finishMaterial(color, materialId) {
  const base = new THREE.Color(color)
  const options = { color: base, side: THREE.DoubleSide }

  if (materialId === 'crystal') {
    return new THREE.MeshPhysicalMaterial({
      ...options,
      transparent: true,
      opacity: 0.72,
      transmission: 0.68,
      thickness: 1.1,
      roughness: 0.08,
      ior: 1.42,
      clearcoat: 1,
    })
  }
  if (materialId === 'shine') {
    return new THREE.MeshPhysicalMaterial({ ...options, roughness: 0.08, metalness: 0.02, clearcoat: 1, clearcoatRoughness: 0.06 })
  }
  if (materialId === 'matte') {
    return new THREE.MeshStandardMaterial({ ...options, roughness: 0.88, metalness: 0 })
  }
  return createCeramicMaterial(base, ceramicEnvironment.texture)
}

function addMesh(geometry, material, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
  // Keep procedural grain equally sized on narrow, round, and flattened parts.
  if (material.userData.isCeramic) geometry.scale(...scale)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(...position)
  mesh.rotation.set(...rotation)
  if (!material.userData.isCeramic) mesh.scale.set(...scale)
  mesh.castShadow = true
  mesh.receiveShadow = true
  lampRoot.add(mesh)
  return mesh
}

function addCable(topY, material) {
  const ceilingY = 3.15
  addMesh(new THREE.CylinderGeometry(0.026, 0.026, ceilingY - topY, 16), material, [0, topY + (ceilingY - topY) / 2, 0])
}

function addGlow(y, size = 0.58) {
  const glowMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: state.lightOn ? 2.2 : 0,
    roughness: 0.2,
  })
  lampBulb = addMesh(new THREE.SphereGeometry(size, 48, 32), glowMaterial, [0, y, 0])
  lampBulb.userData.isBulb = true
  lampLight = new THREE.PointLight(0xffb25e, state.lightOn ? 7 : 0, 8, 1.8)
  lampLight.position.set(0, y - 0.1, 0)
  lampRoot.add(lampLight)
  return lampBulb
}

function buildDome(material, accent, trim, cable) {
  addCable(1.28, cable)
  addMesh(new THREE.CylinderGeometry(0.43, 0.56, 0.78, 48), accent, [0, 0.905, 0])
  // Close the shade's open shoulder so the neck seats on an actual surface.
  addMesh(new THREE.CylinderGeometry(1.45, 1.467, 0.05, 64), material, [0, 0.505, 0])
  addMesh(new THREE.CylinderGeometry(1.45, 1.82, 1.08, 64, 1, true), material, [0, -0.02, 0])
  addMesh(new THREE.TorusGeometry(1.81, 0.055, 16, 64), trim, [0, -0.56, 0], [Math.PI / 2, 0, 0])
  // The broad underside is a finished surface, separate from the glowing bulb.
  addMesh(new THREE.CircleGeometry(1.81, 64), trim,
    [0, -0.555, 0], [Math.PI / 2, 0, 0])
  addGlow(-0.72, 0.44)
}

function buildOrbit(material, accent, trim, cable) {
  addCable(1.22, cable)
  addMesh(new THREE.SphereGeometry(0.38, 48, 32), accent, [0, 0.92, 0])
  // A short hub joins the upper ball to the body through the decorative ring.
  addMesh(new THREE.CylinderGeometry(0.24, 0.24, 0.47, 40), accent, [0, 0.485, 0])
  addMesh(new THREE.TorusGeometry(0.72, 0.19, 24, 64), trim, [0, 0.46, 0], [Math.PI / 2, 0, 0])
  addMesh(new THREE.SphereGeometry(1.35, 64, 32), material, [0, -0.08, 0], [0, 0, 0], [1.24, 0.34, 1.24])
  addMesh(new THREE.TorusGeometry(1.45, 0.08, 18, 64), trim, [0, -0.08, 0], [Math.PI / 2, 0, 0])
  addGlow(-0.78, 0.62)
}

function buildTier(material, accent, trim, cable) {
  // Keep the shade sizes; seat each one slightly inside the shade above it.
  const jointOverlap = 0.015
  const topY = 0.7
  const topHeight = 0.36
  const middleHeight = 0.4
  const lowerHeight = 0.54
  const middleY = topY - topHeight / 2 - middleHeight / 2 + jointOverlap
  const lowerY = middleY - middleHeight / 2 - lowerHeight / 2 + jointOverlap
  const stemBottom = topY + topHeight / 2 - jointOverlap
  const stemTop = 1.365
  addCable(1.35, cable)
  addMesh(new THREE.CylinderGeometry(0.22, 0.28, stemTop - stemBottom, 40), accent, [0, (stemTop + stemBottom) / 2, 0])
  addMesh(new THREE.CylinderGeometry(1.54, 1.54, topHeight, 64), material, [0, topY, 0])
  addMesh(new THREE.CylinderGeometry(1.2, 1.2, middleHeight, 64), accent, [0, middleY, 0])
  addMesh(new THREE.CylinderGeometry(0.78, 0.78, lowerHeight, 64), trim, [0, lowerY, 0])
  addGlow(-0.72, 0.48)
}

function buildGlass(material, accent, trim, cable) {
  addCable(1.67, cable)
  addMesh(new THREE.SphereGeometry(0.36, 48, 32), accent, [0, 1.47, 0], [0, 0, 0], [1.15, 0.6, 1.15])
  // Fill the collar's central opening and seat it over the shade's mouth.
  const neckBottom = 0.93
  const neckTop = 1.43
  addMesh(new THREE.CylinderGeometry(0.38, 0.38, neckTop - neckBottom, 48), accent, [0, (neckTop + neckBottom) / 2, 0])
  addMesh(new THREE.TorusGeometry(0.48, 0.13, 22, 64), trim, [0, 1.08, 0], [Math.PI / 2, 0, 0])

  const points = [
    new THREE.Vector2(0.55, -1.55),
    new THREE.Vector2(0.76, -1.42),
    new THREE.Vector2(0.82, -0.92),
    new THREE.Vector2(0.8, 0.46),
    new THREE.Vector2(0.68, 0.74),
    new THREE.Vector2(0.38, 0.9),
    new THREE.Vector2(0.3, 1.08),
  ]
  const glassMaterial = ['crystal', 'ceramic'].includes(state.material.id)
    ? material
    : new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(state.shades[0]),
        transparent: true,
        opacity: state.material.id === 'matte' ? 0.76 : 0.62,
        transmission: state.material.id === 'matte' ? 0.18 : 0.72,
        thickness: 1.35,
        roughness: state.material.id === 'matte' ? 0.45 : 0.08,
        ior: 1.42,
        clearcoat: state.material.id === 'shine' ? 1 : 0.45,
      })
  glassMaterial.userData.colorSlot = 0
  addMesh(new THREE.LatheGeometry(points, 72), glassMaterial, [0, -0.08, 0])
  // The internal stem reaches the neck and ends just inside the bulb.
  const stemBottom = -0.4
  const stemTop = neckBottom + 0.03
  addMesh(new THREE.CylinderGeometry(0.22, 0.22, stemTop - stemBottom, 32), accent, [0, (stemTop + stemBottom) / 2, 0])
  addGlow(-0.72, 0.36)
}

function disposeLamp() {
  while (lampRoot.children.length) {
    const child = lampRoot.children.pop()
    child.geometry?.dispose()
    if (Array.isArray(child.material)) child.material.forEach((item) => item.dispose())
    else child.material?.dispose()
  }
}

function buildLamp({ reframe = true } = {}) {
  disposeLamp()
  lampLight = null
  lampBulb = null
  const finishes = state.shades.map((color, slot) => {
    const finish = finishMaterial(color, slot === 1 && state.material.id === 'crystal' ? 'shine' : state.material.id)
    finish.userData.colorSlot = slot
    return finish
  })
  const builders = { dome: buildDome, orbit: buildOrbit, tier: buildTier, glass: buildGlass }
  builders[state.model.id](...finishes)
  studio.paint.bind()

  lampRoot.rotation.y = -0.32
  revealScale = 0.84
  updateLight()
  if (reframe) requestAnimationFrame(() => document.body.classList.contains('is-immersive') ? frameLampForImmersive() : frameLampForNormal())
}

function updateLight() {
  const { color, tint, kelvin } = lightTemperature(state.temperature)
  const slider = document.querySelector('#temperature')
  slider.disabled = !state.lightOn
  slider.value = state.temperature
  slider.setAttribute('aria-valuetext', `${kelvin} kelvin`)
  document.querySelector('.temperature-control').classList.toggle('is-disabled', !state.lightOn)
  document.querySelector('.viewer').classList.toggle('is-light-off', !state.lightOn)
  document.querySelector('#temperature-value').textContent = `${kelvin}K`
  document.documentElement.style.setProperty('--glow-color', `#${tint.getHexString()}`)
  // Studio illumination stays fixed; only the lamp's own light changes.
  if (lampLight) {
    lampLight.color.copy(color)
    lampLight.intensity = state.lightOn ? 7 : 0
  }
  // Only the dedicated bulb emits light. Painted parts retain their complete
  // finish, including base color and emissive settings, at every temperature.
  if (lampBulb) {
    lampBulb.material.emissive.copy(color)
    lampBulb.material.emissiveIntensity = state.lightOn ? 2.2 : 0
  }
  document.querySelector('#light-toggle').classList.toggle('is-on', state.lightOn)
  document.querySelector('#light-toggle').setAttribute('aria-pressed', state.lightOn)
  document.querySelector('#light-label').textContent = state.lightOn ? 'Light on' : 'Light off'
  document.querySelector('#light-toggle').setAttribute('aria-label', state.lightOn ? 'Turn lamp light off' : 'Turn lamp light on')
  document.querySelector('#light-toggle').title = state.lightOn ? 'Light on — click to switch off' : 'Light off — click to switch on'
}

function updateSummary() {
  const index = models.indexOf(state.model) + 1
  document.querySelector('#lamp-title').innerHTML = `${state.model.name} <span>0${index}</span>`
  document.querySelector('#price').textContent = `€${state.model.price + state.material.price}`
}

function selectGroup(selector, selected) {
  document.querySelectorAll(selector).forEach((button) => {
    const active = button === selected
    button.classList.toggle('is-selected', active)
    button.setAttribute('aria-checked', active)
  })
}

document.querySelectorAll('[data-model]').forEach((button) => {
  button.addEventListener('click', async () => {
    if (state.model.id === button.dataset.model) return
    studio.paint.finishStroke()
    if (studio.paint.hasArtwork() && !await studio.confirm({
      title: 'Switch lamp model?',
      copy: 'Your drawing fits this lamp’s surfaces. Switching models will remove it and its undo history. Your colors, finish, and light settings will stay.',
      action: 'Switch model',
    })) return
    studio.paint.reset()
    state.model = models.find((model) => model.id === button.dataset.model)
    selectGroup('[data-model]', button)
    buildLamp()
    updateSummary()
  })
})

document.querySelectorAll('[data-palette]').forEach((button) => {
  button.addEventListener('click', () => {
    const palette = palettes.find((item) => item.id === button.dataset.palette)
    state.palette = palette.id
    state.shades = palette.id === 'mixed' ? mixedShades(state.shades) : [...palette.shades]
    // Recolor existing materials: keep geometry, finish, lighting, and camera intact.
    lampRoot.traverse((part) => {
      const slot = part.material?.userData.colorSlot
      if (slot !== undefined) part.material.color.set(state.shades[slot])
    })
    document.querySelectorAll('[data-palette]').forEach((option) => {
      const selected = option.dataset.palette === state.palette
      option.classList.toggle('is-selected', selected)
      option.setAttribute('aria-pressed', selected)
      if (option.dataset.palette === 'mixed' && state.palette === 'mixed') {
        option.querySelector('.palette-swatch').style.background =
          `linear-gradient(180deg, ${state.shades.map((shade, i) => `${shade} ${i * 25}% ${(i + 1) * 25}%`).join(', ')})`
      }
    })
    document.querySelector('#color-status').textContent = palette.id === 'mixed'
      ? `New mixed colors: ${state.shades.join(', ')}`
      : `${palette.name} palette applied`
  })
})

document.querySelectorAll('[data-material]').forEach((button) => {
  button.addEventListener('click', () => {
    state.material = materials.find((material) => material.id === button.dataset.material)
    selectGroup('[data-material]', button)
    buildLamp({ reframe: false })
    updateSummary()
  })
})

document.querySelector('#temperature').addEventListener('input', (event) => {
  if (!state.lightOn) {
    event.target.value = state.temperature
    return
  }
  state.temperature = Number(event.target.value)
  updateLight()
})

// Keep the native range input's mouse, touch, and keyboard behavior. Its
// gestures belong to the slider, never to the adjacent OrbitControls canvas.
for (const type of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'touchstart', 'touchmove', 'touchend']) {
  document.querySelector('#temperature').addEventListener(type, (event) => event.stopPropagation(), { passive: true })
}

document.querySelector('#light-toggle').addEventListener('click', () => {
  state.lightOn = !state.lightOn
  updateLight()
})

document.querySelector('#reset-view').addEventListener('click', () => {
  camera.position.set(5.2, 1.1, 8.5)
  controls.target.set(0, -0.25, 0)
  controls.update()
  frameLampForNormal()
})

document.querySelectorAll('[data-background]').forEach(button => button.addEventListener('click', () => {
  state.background = state.background === button.dataset.background ? 'cream' : button.dataset.background
  const colors = { cream: '#FFFBE5', pink: '#FFD6DC', blue: '#C5D0FF', peach: '#F3C482' }
  document.documentElement.style.setProperty('--scene-color', colors[state.background])
  document.querySelectorAll('[data-background]').forEach(option => option.setAttribute('aria-pressed', option.dataset.background === state.background))
}))

const immersiveTrigger = document.querySelector('#immersive-trigger')
const immersiveExit = document.querySelector('#immersive-exit')
const immersiveDock = document.querySelector('.immersive-dock')
const immersivePopup = document.querySelector('#immersive-popup')
const popupContent = document.querySelector('.immersive-popup-content')
const popupActions = document.querySelector('.immersive-popup-actions')
const lightToggle = document.querySelector('#light-toggle')
const panelControls = {
  model: document.querySelector('.model-grid'),
  color: document.querySelector('.color-row'),
  material: document.querySelector('.material-grid'),
  temperature: document.querySelector('.temperature-control'),
  pattern: studio.panel,
}
// Move the original controls into the popup, retaining their listeners and state.
const controlHomes = new Map()
for (const element of [...Object.values(panelControls), lightToggle]) {
  const home = document.createComment('Control home')
  element.before(home)
  controlHomes.set(element, home)
}
let activePanel = null
let savedView = null

function restoreControl(element) {
  controlHomes.get(element).after(element)
}

function closeImmersivePopup(restoreFocus = true) {
  if (!activePanel) return
  const trigger = document.querySelector(`[data-panel="${activePanel}"]`)
  restoreControl(panelControls[activePanel])
  if (activePanel === 'pattern') {
    studio.panel.hidden = true
    studio.paint.setOpen(false)
  }
  restoreControl(lightToggle)
  activePanel = null
  immersiveDock.classList.remove('has-pattern')
  immersivePopup.hidden = true
  trigger.setAttribute('aria-expanded', 'false')
  if (restoreFocus) trigger.focus({ preventScroll: true })
  layoutImmersiveView()
}

function toggleImmersivePopup(id) {
  const wasOpen = activePanel === id
  closeImmersivePopup(false)
  if (wasOpen) return
  activePanel = id
  immersiveDock.classList.toggle('has-pattern', id === 'pattern')
  document.querySelector('#immersive-popup-title').textContent =
    immersiveCategories.find((category) => category.id === id).label
  popupContent.append(panelControls[id])
  if (id === 'pattern') {
    studio.panel.hidden = false
    studio.paint.setOpen(true)
  }
  if (id === 'temperature') popupActions.prepend(lightToggle)
  immersivePopup.hidden = false
  immersivePopup.classList.toggle('is-pattern-popup', id === 'pattern')
  document.querySelector(`[data-panel="${id}"]`).setAttribute('aria-expanded', 'true')
  layoutImmersiveView()
  const selected = popupContent.querySelector('[data-paint-mode][aria-pressed="true"]') || popupContent.querySelector('.is-selected') ||
    popupContent.querySelector('input:not(:disabled), button') || lightToggle
  selected.focus({ preventScroll: true })
}

function closePatternStudio() {
  if (document.body.classList.contains('is-immersive')) closeImmersivePopup()
  else {
    normalStudioOpen = false
    studio.panel.hidden = true
    studio.paint.setOpen(false)
    document.querySelector('.controls').classList.remove('is-pattern-studio')
    document.querySelector('#open-pattern-studio').setAttribute('aria-expanded', 'false')
    document.querySelector('#open-pattern-studio').focus({ preventScroll: true })
  }
}

document.querySelector('#open-pattern-studio').addEventListener('click', () => {
  // On narrow screens, keep the lamp and drawing tools together in the viewport.
  if (window.matchMedia('(max-width: 1100px)').matches) {
    enterImmersiveView()
    toggleImmersivePopup('pattern')
    return
  }
  normalStudioOpen = true
  studio.panel.hidden = false
  document.querySelector('.controls').classList.add('is-pattern-studio')
  document.querySelector('#open-pattern-studio').setAttribute('aria-expanded', 'true')
  studio.paint.setOpen(true)
  studio.panel.querySelector('[data-paint-mode="draw"]').focus()
})

function layoutImmersiveView() {
  if (!document.body.classList.contains('is-immersive')) return
  const viewerBounds = document.querySelector('.viewer').getBoundingClientRect()
  const dockBounds = immersiveDock.getBoundingClientRect()
  // Short landscape screens put the dock beside the scene to retain lamp size.
  if (window.matchMedia('(max-height: 500px) and (min-aspect-ratio: 3/2)').matches ||
      (activePanel === 'pattern' && window.matchMedia('(min-width: 900px)').matches)) {
    canvasWrap.style.right = `${viewerBounds.right - dockBounds.left + 24}px`
    canvasWrap.style.bottom = '24px'
  } else {
    canvasWrap.style.removeProperty('right')
    // Give the whole dock its own space, including when a popup grows on mobile.
    canvasWrap.style.bottom = `${viewerBounds.bottom - dockBounds.top + 24}px`
  }
  resize()
}

function enterImmersiveView() {
  if (document.body.classList.contains('is-immersive')) return

  savedView = {
    position: camera.position.clone(),
    target: controls.target.clone(),
    minDistance: controls.minDistance,
    maxDistance: controls.maxDistance,
  }

  controls.minDistance = 5.5
  controls.maxDistance = 14

  document.body.classList.add('is-immersive')
  // The immersive scene has no floor, so its shadow cannot clip at the dock.
  floor.visible = false
  document.querySelector('.controls').inert = true
  document.querySelector('.site-header').inert = true
  immersiveTrigger.setAttribute('aria-expanded', 'true')
  if (normalStudioOpen) toggleImmersivePopup('pattern')
  requestAnimationFrame(() => {
    layoutImmersiveView()
    frameLampForImmersive()
    immersiveExit.focus()
  })
}

function frameLampForImmersive() {
  if (!document.body.classList.contains('is-immersive')) return
  // Fit the final size, rather than the temporary model-reveal animation scale.
  const bounds = new THREE.Box3().setFromObject(lampRoot)
  bounds.min.divideScalar(lampRoot.scale.x)
  bounds.max.divideScalar(lampRoot.scale.x)
  const center = bounds.getCenter(new THREE.Vector3())
  const viewingDirection = camera.position.clone().sub(controls.target).normalize()
  const right = new THREE.Vector3().crossVectors(camera.up, viewingDirection).normalize()
  const up = new THREE.Vector3().crossVectors(viewingDirection, right).normalize()
  const verticalFov = THREE.MathUtils.degToRad(camera.fov)
  const verticalSlope = Math.tan(verticalFov / 2)
  const horizontalSlope = verticalSlope * camera.aspect
  let distance = 0
  for (const x of [bounds.min.x, bounds.max.x]) {
    for (const y of [bounds.min.y, bounds.max.y]) {
      for (const z of [bounds.min.z, bounds.max.z]) {
        const corner = new THREE.Vector3(x, y, z).sub(center)
        const depth = corner.dot(viewingDirection)
        distance = Math.max(distance,
          depth + Math.abs(corner.dot(up)) * 1.16 / verticalSlope,
          depth + Math.abs(corner.dot(right)) * 1.16 / horizontalSlope)
      }
    }
  }

  controls.minDistance = Math.min(5.5, distance * 0.65)
  controls.maxDistance = Math.max(14, distance * 2)
  controls.target.copy(center)
  camera.position.copy(center).add(viewingDirection.multiplyScalar(distance))
  controls.update()
}

function frameLampForNormal() {
  if (document.body.classList.contains('is-immersive') || !lampRoot.children.length) return
  lampRoot.updateMatrixWorld(true)
  // In the reference, the suspension cord continues to the circle's upper
  // edge. Fit the complete lamp body and let the existing cord hang from it.
  const parts = lampRoot.children.filter(mesh => mesh.geometry && mesh.material?.userData.colorSlot !== 3)
  const bounds = new THREE.Box3()
  parts.forEach(mesh => bounds.expandByObject(mesh))
  bounds.min.divideScalar(lampRoot.scale.x)
  bounds.max.divideScalar(lampRoot.scale.x)
  const center = bounds.getCenter(new THREE.Vector3())
  const size = bounds.getSize(new THREE.Vector3())
  // Lift the composition within the circle, leaving the reference's lower space.
  center.y -= size.y * 0.03
  const direction = camera.position.clone().sub(controls.target).normalize()
  const right = new THREE.Vector3().crossVectors(camera.up, direction).normalize()
  const up = new THREE.Vector3().crossVectors(direction, right).normalize()
  const slope = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))
  let distance = 0
  const point = new THREE.Vector3()
  // Fit the actual silhouette rather than an oversized box around the cable
  // and shade. Leave more space below the lamp, as in the reference artwork.
  for (const mesh of parts) {
    const positions = mesh.geometry?.attributes.position
    if (!positions) continue
    for (let i = 0; i < positions.count; i++) {
      point.fromBufferAttribute(positions, i).applyMatrix4(mesh.matrixWorld).divideScalar(lampRoot.scale.x).sub(center)
      const vertical = point.dot(up)
      distance = Math.max(distance, point.dot(direction) + Math.max(
        Math.abs(vertical) / (slope * (vertical > 0 ? .71 : .68)),
        Math.abs(point.dot(right)) / (slope * camera.aspect * .84),
      ))
    }
  }
  controls.target.copy(center)
  controls.minDistance = distance * 0.55
  controls.maxDistance = distance * 2
  camera.position.copy(center).addScaledVector(direction, distance)
  controls.update()
}

function exitImmersiveView() {
  if (!document.body.classList.contains('is-immersive')) return

  closeImmersivePopup(false)
  document.body.classList.remove('is-immersive')
  canvasWrap.style.removeProperty('bottom')
  canvasWrap.style.removeProperty('right')
  floor.visible = false
  document.querySelector('.controls').inert = false
  document.querySelector('.site-header').inert = false
  studio.panel.hidden = !normalStudioOpen
  studio.paint.setOpen(normalStudioOpen)
  immersiveTrigger.setAttribute('aria-expanded', 'false')

  if (savedView) {
    camera.position.copy(savedView.position)
    controls.target.copy(savedView.target)
    controls.minDistance = savedView.minDistance
    controls.maxDistance = savedView.maxDistance
    controls.update()
  }

  requestAnimationFrame(() => {
    resize(true)
    immersiveTrigger.focus()
  })
}

immersiveTrigger.addEventListener('click', enterImmersiveView)
immersiveExit.addEventListener('click', exitImmersiveView)
document.querySelectorAll('[data-panel]').forEach((button) => {
  button.addEventListener('click', () => toggleImmersivePopup(button.dataset.panel))
})
document.querySelector('#close-immersive-popup').addEventListener('click', () => closeImmersivePopup())
document.addEventListener('pointerdown', (event) => {
  if (studio.confirming) return
  if (activePanel === 'pattern' && canvasWrap.contains(event.target)) return
  if (activePanel && !immersiveDock.contains(event.target)) closeImmersivePopup(false)
})
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return
  if (studio.confirming) return
  if (activePanel) closeImmersivePopup()
  else if (normalStudioOpen && !document.body.classList.contains('is-immersive')) closePatternStudio()
  else exitImmersiveView()
})

let canvasWidth = 0
let canvasHeight = 0
function resize(preserveView = false) {
  const { width, height } = canvasWrap.getBoundingClientRect()
  if (!width || !height || (width === canvasWidth && height === canvasHeight)) return
  canvasWidth = width
  canvasHeight = height
  renderer.setSize(width, height, false)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  if (document.body.classList.contains('is-immersive')) frameLampForImmersive()
  else if (!preserveView) frameLampForNormal()
}

window.addEventListener('resize', () => {
  if (normalStudioOpen && !document.body.classList.contains('is-immersive') &&
      window.matchMedia('(max-width: 1100px)').matches) enterImmersiveView()
  if (document.body.classList.contains('is-immersive')) layoutImmersiveView()
  else resize()
})
new ResizeObserver(() => resize()).observe(canvasWrap)
new ResizeObserver(layoutImmersiveView).observe(immersiveDock)

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  revealScale += (1 - revealScale) * 0.08
  lampRoot.scale.setScalar(revealScale)
  renderer.render(scene, camera)
}

buildLamp()
updateSummary()
animate()
