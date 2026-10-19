import * as THREE from 'three'

const RESOLUTION = 1024
const TILE = 128
const HISTORY_LIMIT = 30
const HISTORY_BYTES = 32 * 1024 * 1024

// Give cylinder caps their own atlas space; Three's default UVs overlap the
// caps and walls. Other primitives already have non-overlapping surface UVs.
function paintUVs(geometry) {
  const uv = geometry.attributes.uv.clone()
  if (geometry.type === 'CylinderGeometry') {
    const visited = new Set()
    for (const group of geometry.groups) {
      for (let i = group.start; i < group.start + group.count; i++) {
        const vertex = geometry.index.getX(i)
        if (visited.has(vertex)) continue
        visited.add(vertex)
        const u = uv.getX(vertex), v = uv.getY(vertex)
        if (group.materialIndex === 0) uv.setXY(vertex, u, v * 0.66)
        else uv.setXY(vertex, u * 0.3 + (group.materialIndex === 1 ? 0.02 : 0.52), 0.69 + v * 0.3)
      }
    }
  }
  geometry.setAttribute('patternUv', uv)
}

function clipPolygon(points, axis, limit, sign) {
  const output = []
  for (let i = 0; i < points.length; i++) {
    const a = points[i], b = points[(i + 1) % points.length]
    const da = limit - sign * a[axis], db = limit - sign * b[axis]
    if (da >= 0) output.push(a)
    if ((da >= 0) !== (db >= 0)) {
      const t = da / (da - db)
      output.push(Object.fromEntries(['x', 'y', 'z', 'u', 'v'].map(key => [key, a[key] + (b[key] - a[key]) * t])))
    }
  }
  return output
}

export class SurfacePaint {
  constructor({ canvas, camera, controls, root, onChange }) {
    Object.assign(this, { canvas, camera, controls, root, onChange })
    this.settings = { tool: 'watercolor', color: '#D9819F', size: 28, spacing: 1.6, mode: 'draw' }
    this.records = new Map()
    this.undoStack = []
    this.redoStack = []
    this.meshes = []
    this.open = false
    this.pointer = null
    this.raycaster = new THREE.Raycaster()
    this.blank = new THREE.DataTexture(new Uint8Array(4), 1, 1)
    this.blank.needsUpdate = true
    this.cursor = document.createElement('div')
    this.cursor.className = 'paint-cursor'
    this.cursor.hidden = true
    document.body.append(this.cursor)
    for (const type of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'lostpointercapture']) {
      canvas.addEventListener(type, event => this.pointerEvent(event), { capture: true, passive: false })
    }
    canvas.addEventListener('pointerleave', () => { this.cursor.hidden = true })
    window.addEventListener('blur', () => this.finishStroke())
  }

  bind() {
    this.finishStroke()
    this.meshes = this.root.children.filter(mesh => mesh.isMesh && mesh.material?.userData.colorSlot !== undefined)
    const originals = new Set()
    this.meshes.forEach((mesh, index) => {
      const key = String(index)
      let record = this.records.get(key)
      if (!record) {
        record = { key, uniform: { value: this.blank }, canvas: null, texture: null }
        this.records.set(key, record)
      }
      mesh.userData.paintRecord = record
      paintUVs(mesh.geometry)
      const original = mesh.material
      originals.add(original)
      const material = original.clone()
      const originalCompile = original.onBeforeCompile
      const originalKey = original.customProgramCacheKey()
      material.customProgramCacheKey = () => `${originalKey}|surface-paint-v1`
      material.onBeforeCompile = (shader, renderer) => {
        originalCompile.call(material, shader, renderer)
        shader.uniforms.patternMap = record.uniform
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', '#include <common>\nattribute vec2 patternUv; varying vec2 vPatternUv;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPatternUv = patternUv;')
        shader.fragmentShader = shader.fragmentShader
          .replace('#include <common>', '#include <common>\nuniform sampler2D patternMap; varying vec2 vPatternUv;')
          .replace('#include <color_fragment>', `#include <color_fragment>
            // Separate front/back sheets also protect thin, double-sided parts.
            vec2 paintUv = vec2(vPatternUv.x, vPatternUv.y * 0.5 + (gl_FrontFacing ? 0.5 : 0.0));
            vec4 paint = texture2D(patternMap, paintUv);
            diffuseColor.rgb = mix(diffuseColor.rgb, paint.rgb, paint.a);
          `)
      }
      mesh.material = material
    })
    originals.forEach(material => material.dispose())
  }

  ensureCanvas(record) {
    if (record.canvas) return
    const canvas = document.createElement('canvas')
    canvas.width = RESOLUTION
    canvas.height = RESOLUTION * 2
    record.canvas = canvas
    record.context = canvas.getContext('2d', { willReadFrequently: true })
    record.texture = new THREE.CanvasTexture(canvas)
    record.texture.colorSpace = THREE.SRGBColorSpace
    record.texture.generateMipmaps = false
    record.texture.minFilter = THREE.LinearFilter
    record.uniform.value = record.texture
  }

  setOpen(open) {
    this.finishStroke()
    this.open = open
    this.setMode(this.settings.mode)
  }

  setMode(mode) {
    this.finishStroke()
    this.settings.mode = mode
    // Settle any remaining OrbitControls damping before locking the camera.
    if (this.open && mode === 'draw') {
      const damping = this.controls.enableDamping
      this.controls.enableDamping = false
      this.controls.update()
      this.controls.enableDamping = damping
    }
    this.controls.enabled = !(this.open && mode === 'draw')
    this.canvas.classList.toggle('is-drawing', !this.controls.enabled)
    this.cursor.hidden = true
  }

  hit(x, y) {
    const rect = this.canvas.getBoundingClientRect()
    this.raycaster.setFromCamera(new THREE.Vector2((x - rect.left) / rect.width * 2 - 1, 1 - (y - rect.top) / rect.height * 2), this.camera)
    // Include the bulb as an occluder, but never decorate it or cast through it.
    this.root.updateMatrixWorld(true)
    const first = this.raycaster.intersectObjects(this.root.children.filter(part => part.isMesh), false)[0]
    return first?.object.userData.paintRecord ? first : null
  }

  pointerEvent(event) {
    if (!this.open || this.settings.mode !== 'draw') return
    event.preventDefault()
    event.stopImmediatePropagation()
    if (event.type === 'pointerdown') {
      if (this.pointer !== null || event.button !== 0) return
      this.pointer = event.pointerId
      this.canvas.setPointerCapture(event.pointerId)
      this.transaction = new Map()
      this.brush = this.makeBrush()
      this.previousScreen = { x: event.clientX, y: event.clientY }
      this.lastHit = null
      this.travel = 0
      this.sample(event.clientX, event.clientY)
    } else if (event.type === 'pointermove') {
      this.updateCursor(event)
      if (event.pointerId !== this.pointer) return
      const from = this.previousScreen
      const distance = this.camera.position.distanceTo(this.controls.target)
      const diameterPixels = (this.settings.size / 100) * this.canvas.clientHeight /
        (2 * distance * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)))
      const samplePixels = Math.max(0.4, Math.min(3, diameterPixels / 8))
      const count = Math.max(1, Math.ceil(Math.hypot(event.clientX - from.x, event.clientY - from.y) / samplePixels))
      for (let i = 1; i <= count; i++) this.sample(from.x + (event.clientX - from.x) * i / count, from.y + (event.clientY - from.y) * i / count)
      this.previousScreen = { x: event.clientX, y: event.clientY }
    } else if (event.pointerId === this.pointer) {
      this.finishStroke()
    }
  }

  updateCursor(event) {
    const hit = this.hit(event.clientX, event.clientY)
    this.cursor.hidden = !hit || event.pointerType === 'touch'
    if (!hit) return
    const distance = hit.point.clone().applyMatrix4(this.camera.matrixWorldInverse).z * -1
    const pixels = (this.settings.size / 100) * this.canvas.clientHeight / (2 * distance * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)))
    Object.assign(this.cursor.style, { left: `${event.clientX}px`, top: `${event.clientY}px`, width: `${pixels}px`, height: `${pixels}px`, borderColor: this.settings.tool === 'eraser' ? '#101010' : this.settings.color })
  }

  sample(x, y) {
    const hit = this.hit(x, y)
    if (!hit) { this.lastHit = null; this.travel = 0; return }
    const diameter = this.settings.size / 100
    const step = diameter * (this.settings.tool === 'dots' ? this.settings.spacing : 0.16)
    if (!this.lastHit || this.lastHit.object !== hit.object) {
      this.stamp(hit)
      this.travel = 0
    } else {
      const distance = hit.point.distanceTo(this.lastHit.point)
      // A silhouette jump is a new visible surface, never a bridge to its back.
      if (distance > Math.max(diameter * 2, 0.3)) this.travel = 0
      else {
        this.travel += distance
        if (this.travel >= step) {
          this.stamp(hit)
          this.travel %= step
        }
      }
    }
    this.lastHit = hit
  }

  makeBrush() {
    const brush = document.createElement('canvas')
    brush.width = brush.height = 128
    const context = brush.getContext('2d')
    if (this.settings.tool !== 'watercolor') {
      context.fillStyle = this.settings.color
      context.beginPath(); context.arc(64, 64, 62, 0, Math.PI * 2); context.fill()
      return brush
    }
    const pixels = context.createImageData(128, 128)
    const color = this.settings.color.match(/\w\w/g).map(channel => parseInt(channel, 16))
    let seed = 1937
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296 }
    for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
      const dx = (x - 64) / 62, dy = (y - 64) / 62
      const angle = Math.atan2(dy, dx)
      const edge = 0.94 + Math.sin(angle * 7) * 0.025 + Math.sin(angle * 11 + 1) * 0.025
      const radius = Math.hypot(dx, dy) / edge
      const alpha = Math.max(0, Math.min(1, (1 - radius) / 0.24)) * 0.16 * (0.68 + random() * 0.32)
      const i = (y * 128 + x) * 4
      pixels.data.set([...color, Math.round(alpha * 255)], i)
    }
    context.putImageData(pixels, 0, 0)
    return brush
  }

  remember(record, minX, minY, maxX, maxY) {
    for (let y = Math.max(0, Math.floor(minY / TILE)); y <= Math.min(15, Math.floor(maxY / TILE)); y++) {
      for (let x = Math.max(0, Math.floor(minX / TILE)); x <= Math.min(7, Math.floor(maxX / TILE)); x++) {
        const key = `${record.key}:${x}:${y}`
        if (!this.transaction.has(key)) this.transaction.set(key, { record, x: x * TILE, y: y * TILE, before: record.context.getImageData(x * TILE, y * TILE, TILE, TILE) })
      }
    }
  }

  stamp(hit) {
    const mesh = hit.object, record = mesh.userData.paintRecord
    this.ensureCanvas(record)
    const context = record.context, geometry = mesh.geometry
    const positions = geometry.attributes.position, uv = geometry.attributes.patternUv
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld)
    const normal = hit.face.normal.clone().applyMatrix3(normalMatrix).normalize()
    const front = normal.dot(this.raycaster.ray.direction) < 0
    if (!front) normal.negate()
    const cameraRight = new THREE.Vector3().setFromMatrixColumn(this.camera.matrixWorld, 0)
    const right = cameraRight.addScaledVector(normal, -cameraRight.dot(normal)).normalize()
    const up = new THREE.Vector3().crossVectors(normal, right).normalize()
    const radius = this.settings.size / 200
    const depth = radius * 0.4
    const offsetY = front ? 0 : RESOLUTION
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3()
    const faceNormal = new THREE.Vector3()
    const count = geometry.index?.count ?? positions.count
    for (let i = 0; i < count; i += 3) {
      const indices = [0, 1, 2].map(j => geometry.index ? geometry.index.getX(i + j) : i + j)
      const points = [a, b, c].map((point, j) => point.fromBufferAttribute(positions, indices[j]).applyMatrix4(mesh.matrixWorld))
      faceNormal.crossVectors(b.clone().sub(a), c.clone().sub(a)).normalize()
      if (!front) faceNormal.negate()
      if (faceNormal.dot(normal) < 0.2 || faceNormal.dot(this.raycaster.ray.direction) >= 0) continue
      const triangle = points.map((point, j) => {
        const delta = point.clone().sub(hit.point)
        return { x: delta.dot(right), y: delta.dot(up), z: delta.dot(normal), u: uv.getX(indices[j]) * RESOLUTION, v: (1 - uv.getY(indices[j])) * RESOLUTION + offsetY }
      })
      let polygon = triangle
      for (const [axis, limit] of [['x', radius], ['y', radius], ['z', depth]]) {
        polygon = clipPolygon(polygon, axis, limit, 1)
        polygon = clipPolygon(polygon, axis, limit, -1)
        if (!polygon.length) break
      }
      if (polygon.length < 3) continue
      const [p, q, r] = triangle
      const dx1 = q.x - p.x, dy1 = q.y - p.y, dx2 = r.x - p.x, dy2 = r.y - p.y
      const det = dx1 * dy2 - dx2 * dy1
      if (Math.abs(det) < 1e-9) continue
      const ax = ((q.u - p.u) * dy2 - (r.u - p.u) * dy1) / det
      const ay = ((r.u - p.u) * dx1 - (q.u - p.u) * dx2) / det
      const bx = ((q.v - p.v) * dy2 - (r.v - p.v) * dy1) / det
      const by = ((r.v - p.v) * dx1 - (q.v - p.v) * dx2) / det
      this.remember(record, Math.min(...polygon.map(p => p.u)) - 1, Math.min(...polygon.map(p => p.v)) - 1, Math.max(...polygon.map(p => p.u)) + 1, Math.max(...polygon.map(p => p.v)) + 1)
      context.save()
      context.beginPath()
      polygon.forEach((p, index) => index ? context.lineTo(p.u, p.v) : context.moveTo(p.u, p.v))
      context.closePath(); context.clip()
      context.globalCompositeOperation = this.settings.tool === 'eraser' ? 'destination-out' : 'source-over'
      const scale = radius * 2 / 128
      context.setTransform(ax * scale, bx * scale, ay * scale, by * scale,
        p.u - ax * p.x - ay * p.y - radius * (ax + ay), p.v - bx * p.x - by * p.y - radius * (bx + by))
      context.drawImage(this.brush, 0, 0)
      context.restore()
    }
    record.texture.needsUpdate = true
  }

  finishStroke() {
    const pointer = this.pointer
    this.pointer = null
    if (pointer !== null && this.canvas.hasPointerCapture(pointer)) this.canvas.releasePointerCapture(pointer)
    if (!this.transaction) return
    const changes = [...this.transaction.values()].filter(change => {
      change.after = change.record.context.getImageData(change.x, change.y, TILE, TILE)
      return change.after.data.some((value, i) => value !== change.before.data[i])
    })
    this.transaction = null
    this.lastHit = null
    if (changes.length) {
      this.undoStack.push(changes)
      let bytes = this.undoStack.reduce((sum, stroke) => sum + stroke.length * TILE * TILE * 8, 0)
      while (this.undoStack.length > 1 && (this.undoStack.length > HISTORY_LIMIT || bytes > HISTORY_BYTES)) {
        bytes -= this.undoStack.shift().length * TILE * TILE * 8
      }
      this.redoStack = []
    }
    this.onChange?.()
  }

  history(redo = false) {
    this.finishStroke()
    const source = redo ? this.redoStack : this.undoStack
    const changes = source.pop()
    if (!changes) return
    for (const change of changes) {
      change.record.context.putImageData(redo ? change.after : change.before, change.x, change.y)
      change.record.texture.needsUpdate = true
    }
    ;(redo ? this.undoStack : this.redoStack).push(changes)
    this.onChange?.()
  }

  hasArtwork() {
    return [...this.records.values()].some(record => {
      if (!record.canvas) return false
      const data = record.context.getImageData(0, 0, RESOLUTION, RESOLUTION * 2).data
      for (let i = 3; i < data.length; i += 4) if (data[i]) return true
      return false
    })
  }

  clear() {
    this.finishStroke()
    this.transaction = new Map()
    for (const record of this.records.values()) if (record.canvas) {
      this.remember(record, 0, 0, RESOLUTION - 1, RESOLUTION * 2 - 1)
      record.context.clearRect(0, 0, RESOLUTION, RESOLUTION * 2)
      record.texture.needsUpdate = true
    }
    this.finishStroke()
  }

  reset() {
    this.finishStroke()
    this.records.forEach(record => record.texture?.dispose())
    this.records.clear()
    this.undoStack = []
    this.redoStack = []
    this.onChange?.()
  }
}
