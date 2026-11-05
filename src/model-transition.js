import * as THREE from 'three'

const ease = t => t * t * (3 - 2 * t)

// Reference: https://ca.pinterest.com/pin/286893438754010068/
// The reference keeps objects solid and upright as they travel around a
// horizontal carousel. Move the root only; never scale or deform its parts.
export function applyCarouselPose(
  root,
  rest,
  { right, towardCamera, distance, depth, direction },
  amount,
) {
  root.position
    .copy(rest.position)
    .addScaledVector(right, direction * distance * amount)
    .addScaledVector(towardCamera, -depth * Math.abs(amount))
  root.rotation.copy(rest.rotation)
  root.rotation.y += direction * 0.72 * amount
  root.scale.copy(rest.scale)
}

function pose(root) {
  return {
    position: root.position.clone(),
    rotation: root.rotation.clone(),
    scale: root.scale.clone(),
  }
}

export function createModelTransition({
  root,
  scene,
  camera,
  controls,
  motionPreference,
  currentId,
  modelIds,
  swap,
  frame,
  dispose,
  onLock,
}) {
  let running = null
  let queued = null
  const duration = 900

  function view() {
    return {
      position: camera.position.clone(),
      target: controls.target.clone(),
      min: controls.minDistance,
      max: controls.maxDistance,
    }
  }

  function blendView(from, to, amount) {
    camera.position.lerpVectors(from.position, to.position, amount)
    controls.target.lerpVectors(from.target, to.target, amount)
    controls.minDistance = THREE.MathUtils.lerp(from.min, to.min, amount)
    controls.maxDistance = THREE.MathUtils.lerp(from.max, to.max, amount)
    camera.lookAt(controls.target)
  }

  function begin(id, immediate = false) {
    if (id === currentId()) return
    const direction = modelIds.indexOf(id) > modelIds.indexOf(currentId()) ? 1 : -1
    onLock(true)
    const from = view()
    const outgoing = swap(id)
    scene.add(outgoing)
    const rest = pose(root)
    const oldRest = pose(outgoing)
    frame()
    const to = view()
    if (immediate || motionPreference.matches) {
      scene.remove(outgoing)
      dispose(outgoing)
      onLock(false)
      return
    }

    const towardCamera = from.position.clone().sub(from.target).normalize()
    const right = new THREE.Vector3().crossVectors(camera.up, towardCamera).normalize()
    const sizes = [root, outgoing].map(object =>
      new THREE.Box3().setFromObject(object).getSize(new THREE.Vector3()),
    )
    const radius = Math.max(...sizes.map(size => Math.max(size.x, size.z) / 2))
    const halfWidth =
      Math.max(from.position.distanceTo(from.target), to.position.distanceTo(to.target)) *
      Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
      camera.aspect
    const distance = Math.max(halfWidth + radius * 1.5, radius * 2.6)
    const path = {
      right,
      towardCamera,
      direction,
      distance,
      // Limit the inward curve so wide immersive views never reverse travel.
      spacing: Math.max(radius * 2.12, distance * 0.6),
      depth: radius * 0.35,
    }
    running = { outgoing, rest, oldRest, from, to, path, start: undefined }
    blendView(from, to, 0)
    applyCarouselPose(root, rest, path, 1)
  }

  function complete() {
    if (!running) return
    const { outgoing, rest, from, to, path } = running
    applyCarouselPose(root, rest, path, 0)
    blendView(from, to, 1)
    scene.remove(outgoing)
    dispose(outgoing)
    running = null
    onLock(false)
  }

  // Resize, view/material changes, and reduced motion settle the latest choice.
  function finish() {
    complete()
    const next = queued
    queued = null
    if (next !== null) begin(next, true)
  }

  motionPreference.addEventListener('change', event => {
    if (event.matches) finish()
  })

  return {
    get active() {
      return running !== null
    },
    get outgoing() {
      return running?.outgoing ?? null
    },
    request(id) {
      if (running)
        queued = id // Latest choice wins; never accumulate a backlog.
      else begin(id)
    },
    update(time) {
      if (!running) return
      running.start ??= time
      const progress = Math.min(1, Math.max(0, (time - running.start) / duration))
      const amount = ease(progress)
      const { outgoing, rest, oldRest, path, from, to } = running
      // Bring the pair closer through the center of the carousel, keeping a
      // physical gap. At either end, travel fully beyond the viewer's edges.
      const movingPath = {
        ...path,
        distance: THREE.MathUtils.lerp(path.distance, path.spacing, Math.sin(Math.PI * amount)),
      }
      applyCarouselPose(outgoing, oldRest, movingPath, -amount)
      applyCarouselPose(root, rest, movingPath, 1 - amount)
      blendView(from, to, amount)
      if (progress === 1) {
        complete()
        const next = queued
        queued = null
        if (next !== null) begin(next)
      }
    },
    finish,
    withRestPose(callback) {
      if (!running) return callback()
      const animated = pose(root)
      applyCarouselPose(root, running.rest, running.path, 0)
      root.updateMatrixWorld(true)
      try {
        return callback()
      } finally {
        root.position.copy(animated.position)
        root.rotation.copy(animated.rotation)
        root.scale.copy(animated.scale)
        root.updateMatrixWorld(true)
      }
    },
  }
}
