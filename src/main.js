import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { palettes, mixedShades } from './palettes.js'

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
  { id: 'shine', name: 'Shine', price: 55 },
]

const state = {
  model: models[0],
  palette: 'yellow',
  shades: [...palettes[1].shades],
  material: materials[0],
  temperature: 32,
  lightOn: true,
}

const modelIcon = (id) => `
  <span class="model-icon model-icon--${id}" aria-hidden="true">
    <i></i><b></b><em></em>
  </span>
`

const paletteButtons = () => palettes.map(({ id, name, shades }) => `
  <button class="color-option${state.palette === id ? ' is-selected' : ''}"
    type="button" aria-pressed="${state.palette === id}" data-palette="${id}"
    title="${id === 'mixed' ? 'Generate a new combination every time' : name}">
    <span class="palette-swatch" aria-hidden="true" style="background: linear-gradient(90deg, ${shades.map((shade, i) => `${shade} ${i * 25}% ${(i + 1) * 25}%`).join(', ')})"></span>
    <span>${name}</span>
  </button>
`).join('')

document.querySelector('#app').innerHTML = `
  <div class="site-shell">
    <header class="site-header">
      <a class="logo" href="#" aria-label="Stap lighting home"><span>sta</span><span>p</span></a>
      <p>Lighting with character</p>
      <button class="menu-button" id="immersive-trigger" type="button" aria-label="Open immersive lamp view" aria-expanded="false"><span></span><span></span></button>
    </header>

    <main class="configurator">
      <section class="viewer" aria-label="Interactive 3D lamp viewer">
        <div class="viewer-copy">
          <p class="eyebrow">Your light, your mood</p>
          <h1 id="lamp-title">Dome <span>01</span></h1>
        </div>
        <div class="warm-wash" aria-hidden="true"></div>
        <div class="canvas-wrap" id="canvas-wrap"></div>
        <button class="immersive-exit" id="immersive-exit" type="button" aria-label="Exit immersive view">
          <span aria-hidden="true"></span>
          <span aria-hidden="true"></span>
        </button>
        <div class="viewer-toolbar">
          <p><span class="drag-icon" aria-hidden="true">↔</span> Drag to rotate</p>
          <button id="reset-view" type="button">Reset view</button>
        </div>
        <button class="light-toggle is-on" id="light-toggle" type="button" aria-pressed="true">
          <span class="light-toggle__icon" aria-hidden="true">✦</span>
          <span id="light-label">Light on</span>
        </button>
        <p class="model-count"><span id="model-index">01</span> / 04</p>
        <div class="immersive-palette color-row" role="group" aria-label="Lamp colors">
          ${paletteButtons()}
        </div>
      </section>

      <aside class="controls" aria-label="Lamp configuration">
        <div class="controls-heading">
          <div>
            <p class="eyebrow">Build your own</p>
            <h2>Make it yours.</h2>
          </div>
          <p class="intro">Choose a shape, finish and glow that brings your room to life.</p>
        </div>

        <section class="control-section">
          <div class="section-title"><span>01</span><h3>Model</h3></div>
          <div class="model-grid" role="radiogroup" aria-label="Lamp model">
            ${models.map((model, index) => `
              <button class="model-option${index === 0 ? ' is-selected' : ''}" type="button" role="radio" aria-checked="${index === 0}" data-model="${model.id}">
                ${modelIcon(model.id)}
                <span>${model.name}</span>
                <small>0${index + 1}</small>
              </button>
            `).join('')}
          </div>
        </section>

        <section class="control-section control-section--split">
          <div>
            <div class="section-title"><span>02</span><h3>Color</h3></div>
            <div class="color-row" role="group" aria-label="Lamp colors">
              ${paletteButtons()}
            </div>
          </div>
          <div>
            <div class="section-title"><span>03</span><h3>Material</h3></div>
            <div class="material-grid" role="radiogroup" aria-label="Lamp material">
              ${materials.map((material, index) => `
                <button class="material-option${index === 0 ? ' is-selected' : ''}" type="button" role="radio" aria-checked="${index === 0}" data-material="${material.id}">
                  <i class="material-sample material-sample--${material.id}"></i>
                  <span>${material.name}</span>
                </button>
              `).join('')}
            </div>
          </div>
        </section>

        <section class="control-section temperature-control">
          <div class="section-title"><span>04</span><h3>Light temperature</h3><output id="temperature-value">3200K</output></div>
          <input id="temperature" type="range" min="0" max="100" value="32" aria-label="Light temperature">
          <div class="range-labels"><span>Warm</span><span>Cool</span></div>
        </section>

        <div class="purchase-row">
          <div class="price"><span>Final price</span><strong id="price">€355</strong></div>
        </div>
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
scene.add(floor)

const lampRoot = new THREE.Group()
scene.add(lampRoot)
let lampLight
let revealScale = 1

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
  return new THREE.MeshPhysicalMaterial({ ...options, roughness: 0.3, clearcoat: 0.55, clearcoatRoughness: 0.24 })
}

function addMesh(geometry, material, position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) {
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.set(...position)
  mesh.rotation.set(...rotation)
  mesh.scale.set(...scale)
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
    color: 0xfff6df,
    emissive: 0xffb85d,
    emissiveIntensity: state.lightOn ? 2.2 : 0.08,
    roughness: 0.2,
  })
  const bulb = addMesh(new THREE.SphereGeometry(size, 48, 32), glowMaterial, [0, y, 0])
  bulb.userData.isBulb = true
  lampLight = new THREE.PointLight(0xffb25e, state.lightOn ? 7 : 0, 8, 1.8)
  lampLight.position.set(0, y - 0.1, 0)
  lampRoot.add(lampLight)
  return bulb
}

function buildDome(material, accent, trim, cable) {
  addCable(1.28, cable)
  addMesh(new THREE.CylinderGeometry(0.43, 0.56, 0.78, 48), accent, [0, 0.92, 0])
  addMesh(new THREE.CylinderGeometry(1.45, 1.82, 1.08, 64, 1, true), material, [0, -0.02, 0])
  addMesh(new THREE.TorusGeometry(1.81, 0.055, 16, 64), trim, [0, -0.56, 0], [Math.PI / 2, 0, 0])
  addMesh(new THREE.CircleGeometry(1.7, 64), new THREE.MeshBasicMaterial({ color: 0xfff4d8, side: THREE.DoubleSide }), [0, -0.555, 0], [Math.PI / 2, 0, 0])
  addGlow(-0.72, 0.44)
}

function buildOrbit(material, accent, trim, cable) {
  addCable(1.22, cable)
  addMesh(new THREE.SphereGeometry(0.38, 48, 32), accent, [0, 0.92, 0])
  addMesh(new THREE.TorusGeometry(0.72, 0.19, 24, 64), trim, [0, 0.46, 0], [Math.PI / 2, 0, 0])
  addMesh(new THREE.SphereGeometry(1.35, 64, 32), material, [0, -0.08, 0], [0, 0, 0], [1.24, 0.34, 1.24])
  addMesh(new THREE.TorusGeometry(1.45, 0.08, 18, 64), trim, [0, -0.08, 0], [Math.PI / 2, 0, 0])
  addGlow(-0.78, 0.62)
}

function buildTier(material, accent, trim, cable) {
  addCable(1.35, cable)
  addMesh(new THREE.CylinderGeometry(0.22, 0.28, 0.34, 40), accent, [0, 1.18, 0])
  addMesh(new THREE.CylinderGeometry(1.54, 1.54, 0.36, 64), material, [0, 0.7, 0])
  addMesh(new THREE.CylinderGeometry(1.2, 1.2, 0.4, 64), accent, [0, 0.2, 0])
  addMesh(new THREE.CylinderGeometry(0.78, 0.78, 0.54, 64), trim, [0, -0.31, 0])
  addGlow(-0.72, 0.48)
}

function buildGlass(material, accent, trim, cable) {
  addCable(1.74, cable)
  addMesh(new THREE.SphereGeometry(0.36, 48, 32), accent, [0, 1.47, 0], [0, 0, 0], [1.15, 0.6, 1.15])
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
  const glassMaterial = state.material.id === 'crystal'
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
  addMesh(new THREE.CylinderGeometry(0.22, 0.22, 1.45, 32), accent, [0, -0.14, 0])
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

function buildLamp() {
  disposeLamp()
  lampLight = null
  const finishes = state.shades.map((color, slot) => {
    const finish = finishMaterial(color, slot === 1 && state.material.id === 'crystal' ? 'shine' : state.material.id)
    finish.userData.colorSlot = slot
    return finish
  })
  const builders = { dome: buildDome, orbit: buildOrbit, tier: buildTier, glass: buildGlass }
  builders[state.model.id](...finishes)

  lampRoot.rotation.y = -0.32
  revealScale = 0.84
  updateLight()
  if (document.body.classList.contains('is-immersive')) {
    requestAnimationFrame(frameLampForImmersive)
  }
}

function temperatureColor(value) {
  const warm = new THREE.Color('#ffad55')
  const neutral = new THREE.Color('#fff0c2')
  const cool = new THREE.Color('#dbe5ff')
  return value < 50 ? warm.clone().lerp(neutral, value / 50) : neutral.clone().lerp(cool, (value - 50) / 50)
}

function updateLight() {
  const color = temperatureColor(state.temperature)
  const kelvin = Math.round((2200 + state.temperature * 30) / 100) * 100
  document.querySelector('#temperature-value').textContent = `${kelvin}K`
  document.documentElement.style.setProperty('--glow-color', `#${color.getHexString()}`)
  keyLight.color.copy(color)
  if (lampLight) {
    lampLight.color.copy(color)
    lampLight.intensity = state.lightOn ? 7 : 0
  }
  lampRoot.traverse((child) => {
    if (child.userData.isBulb) {
      child.material.emissive.copy(color)
      child.material.emissiveIntensity = state.lightOn ? 2.2 : 0.08
    }
  })
  document.querySelector('#light-toggle').classList.toggle('is-on', state.lightOn)
  document.querySelector('#light-toggle').setAttribute('aria-pressed', state.lightOn)
  document.querySelector('#light-label').textContent = state.lightOn ? 'Light on' : 'Light off'
}

function updateSummary() {
  const index = models.indexOf(state.model) + 1
  document.querySelector('#lamp-title').innerHTML = `${state.model.name} <span>0${index}</span>`
  document.querySelector('#model-index').textContent = `0${index}`
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
  button.addEventListener('click', () => {
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
          `linear-gradient(90deg, ${state.shades.map((shade, i) => `${shade} ${i * 25}% ${(i + 1) * 25}%`).join(', ')})`
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
    buildLamp()
    updateSummary()
  })
})

document.querySelector('#temperature').addEventListener('input', (event) => {
  state.temperature = Number(event.target.value)
  updateLight()
})

document.querySelector('#light-toggle').addEventListener('click', () => {
  state.lightOn = !state.lightOn
  updateLight()
})

document.querySelector('#reset-view').addEventListener('click', () => {
  camera.position.set(5.2, 1.1, 8.5)
  controls.target.set(0, -0.25, 0)
  controls.update()
})

const immersiveTrigger = document.querySelector('#immersive-trigger')
const immersiveExit = document.querySelector('#immersive-exit')
let savedView = null

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
  immersiveTrigger.setAttribute('aria-expanded', 'true')
  requestAnimationFrame(() => {
    resize()
    frameLampForImmersive()
    immersiveExit.focus()
  })
}

function frameLampForImmersive() {
  const bounds = new THREE.Box3().setFromObject(lampRoot)
  const center = bounds.getCenter(new THREE.Vector3())
  const size = bounds.getSize(new THREE.Vector3())
  const viewingDirection = camera.position.clone().sub(controls.target).normalize()
  const verticalFov = THREE.MathUtils.degToRad(camera.fov)
  const horizontalFov = 2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect)
  const verticalDistance = (size.y / 2) / Math.tan(verticalFov / 2)
  const horizontalDistance = (size.x / 2) / Math.tan(horizontalFov / 2)
  const distance = Math.max(verticalDistance, horizontalDistance) * 1.18 + size.z * 0.25

  controls.target.copy(center)
  camera.position.copy(center).add(viewingDirection.multiplyScalar(distance))
  controls.update()
}

function exitImmersiveView() {
  if (!document.body.classList.contains('is-immersive')) return

  document.body.classList.remove('is-immersive')
  immersiveTrigger.setAttribute('aria-expanded', 'false')

  if (savedView) {
    camera.position.copy(savedView.position)
    controls.target.copy(savedView.target)
    controls.minDistance = savedView.minDistance
    controls.maxDistance = savedView.maxDistance
    controls.update()
  }

  requestAnimationFrame(() => {
    resize()
    immersiveTrigger.focus()
  })
}

immersiveTrigger.addEventListener('click', enterImmersiveView)
immersiveExit.addEventListener('click', exitImmersiveView)
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') exitImmersiveView()
})

function resize() {
  const width = canvasWrap.clientWidth
  const height = canvasWrap.clientHeight
  renderer.setSize(width, height, false)
  camera.aspect = width / height
  camera.updateProjectionMatrix()
}

window.addEventListener('resize', resize)
new ResizeObserver(resize).observe(canvasWrap)

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
