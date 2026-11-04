import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PerspectiveCamera, Vector3 } from 'three'
import { suspensionZoomLimit } from '../src/camera-framing.js'

test('maximum distance keeps the cable beyond the top edge throughout the orbit range', () => {
  const target = new Vector3(0, -0.13, 0)
  const tip = new Vector3(0, 3.15, 0)
  for (const aspect of [1, 0.75, 1.5]) {
    const camera = new PerspectiveCamera(32, aspect, 0.1, 100)
    for (let phi = Math.PI * 0.27; phi <= Math.PI * 0.66; phi += 0.025) {
      for (const theta of [0, 1.2, 3.5, 5.8]) {
        const direction = new Vector3().setFromSphericalCoords(1, phi, theta)
        camera.position.copy(target).addScaledVector(direction, 10)
        const limit = suspensionZoomLimit(camera, target, tip)
        assert.ok(Number.isFinite(limit) && limit > 0)
        camera.position.copy(target).addScaledVector(direction, limit)
        camera.lookAt(target)
        camera.updateMatrixWorld()
        const projected = tip.clone().project(camera)
        assert.ok(Math.abs(projected.x) < 1e-10)
        assert.ok(projected.y > 1 && projected.y < 1.03)
      }
    }
  }
})

test('limit uses the current target and field of view without changing the camera', () => {
  const camera = new PerspectiveCamera(45, 1, 0.1, 100)
  camera.zoom = 1.2
  camera.updateProjectionMatrix()
  const target = new Vector3(0, 0.6, 0)
  const tip = new Vector3(0, 3.15, 0)
  camera.position.set(4, 1.5, 7)
  const before = camera.position.clone()
  const limit = suspensionZoomLimit(camera, target, tip)
  assert.deepEqual(camera.position, before)
  camera.position.sub(target).setLength(limit).add(target)
  camera.lookAt(target)
  camera.updateMatrixWorld()
  assert.ok(tip.clone().project(camera).y > 1)
})
