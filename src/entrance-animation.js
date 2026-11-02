// A single, time-based reveal. Rebuilds finish it; they never start it again.
const smooth = value => {
  const t = Math.max(0, Math.min(1, value))
  return t * t * t * (t * (t * 6 - 15) + 10)
}

// Palette slots identify the existing physical pieces. Shared shade surfaces
// travel together; the bulb and its point light share the same path.
const assemblyMotion = [
  { offsetY: -0.06, delay: 80 }, // shade
  { offsetY: 0.26, delay: 0 },   // collar
  { offsetY: -0.3, delay: 140 }, // trim / underside
  { offsetY: 0.3, delay: 0 },   // cable
]
const bulbMotion = { offsetY: -0.58, delay: 250 }
const timing = { fade: 850, arrival: 1700, assemblyStart: 950, assemblyDuration: 1450, lightStart: 2650, duration: 3600 }

export function createEntranceAnimation({ root, canvas, motionPreference, onLock, onLight = () => {} }) {
  const restScale = root.scale.clone()
  const restRotation = root.rotation.clone()
  const originalOpacity = canvas.style.opacity
  let started = false
  let active = false
  let startTime
  let parts = []

  function restorePose() {
    root.scale.copy(restScale)
    root.rotation.copy(restRotation)
    for (const { object, position } of parts) object.position.copy(position)
  }

  function finish() {
    if (!active) return
    active = false
    restorePose()
    parts = [] // Do not retain old meshes when a later selection rebuilds them.
    canvas.style.opacity = originalOpacity
    onLight(1)
    onLock(false)
  }

  function update(time) {
    if (!active) return
    startTime ??= time
    const elapsed = time - startTime
    if (elapsed >= timing.duration) return finish()
    const arrival = smooth(elapsed / timing.arrival)
    root.scale.copy(restScale).multiplyScalar(0.88 + 0.12 * arrival)
    root.rotation.set(
      restRotation.x + 0.06 * (1 - arrival),
      restRotation.y - 0.7 * (1 - arrival),
      restRotation.z - 0.08 * (1 - arrival),
      restRotation.order,
    )
    // The renderer is transparent and contains only the lamp (the floor is
    // hidden). Fade its canvas so crystal and ceramic shaders stay untouched.
    canvas.style.opacity = String(smooth(elapsed / timing.fade))
    for (const { object, position, offsetY, delay } of parts) {
      const assembled = smooth((elapsed - timing.assemblyStart - delay) / timing.assemblyDuration)
      object.position.copy(position)
      object.position.y += offsetY * (1 - assembled)
    }
    onLight(smooth((elapsed - timing.lightStart) / (timing.duration - timing.lightStart)))
  }

  motionPreference.addEventListener('change', event => {
    if (event.matches) finish()
  })

  return {
    get active() { return active },
    start() {
      if (started) return
      started = true
      if (motionPreference.matches) return
      parts = root.children.flatMap(object => {
        const motion = object.userData.isBulb || object.isPointLight
          ? bulbMotion : assemblyMotion[object.material?.userData.colorSlot]
        return motion ? [{ object, position: object.position.clone(), ...motion }] : []
      })
      active = true
      onLock(true)
      update(0)
      startTime = undefined // Begin the clock on the first rendered frame.
    },
    update,
    finish,
    // Camera fitting must always measure the final model, including on resize.
    withRestPose(callback) {
      if (!active) return callback()
      const scale = root.scale.clone()
      const rotation = root.rotation.clone()
      const positions = parts.map(({ object }) => object.position.clone())
      restorePose()
      root.updateMatrixWorld(true)
      try {
        return callback()
      } finally {
        root.scale.copy(scale)
        root.rotation.copy(rotation)
        parts.forEach(({ object }, index) => object.position.copy(positions[index]))
        root.updateMatrixWorld(true)
      }
    },
  }
}
