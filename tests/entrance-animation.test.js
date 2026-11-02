import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Group, Mesh, BoxGeometry, MeshStandardMaterial, PointLight } from 'three'
import { createEntranceAnimation } from '../src/entrance-animation.js'

function fixture(reducedMotion = false) {
  const root = new Group()
  root.rotation.y = -0.32
  for (let slot = 0; slot < 4; slot++) {
    const material = new MeshStandardMaterial()
    material.userData.colorSlot = slot
    const part = new Mesh(new BoxGeometry(), material)
    part.position.set(0, slot * 0.2, 0)
    root.add(part)
  }
  const bulb = new Mesh(new BoxGeometry(), new MeshStandardMaterial())
  bulb.userData.isBulb = true
  bulb.position.y = -0.72
  const light = new PointLight()
  light.position.y = -0.82
  root.add(bulb, light)
  const canvas = { style: { opacity: '' } }
  const motionPreference = new EventTarget()
  motionPreference.matches = reducedMotion
  const locks = []
  const lights = []
  const entrance = createEntranceAnimation({ root, canvas, motionPreference, onLock: locked => locks.push(locked), onLight: amount => lights.push(amount) })
  return { root, canvas, motionPreference, locks, lights, entrance }
}

test('restores the exact pose and opacity and only starts once', () => {
  const { root, canvas, locks, entrance } = fixture()
  entrance.start()
  entrance.update(100)
  assert.equal(canvas.style.opacity, '0')
  assert.ok(root.scale.x < 1)
  assert.ok(root.rotation.y < -0.32)
  assert.deepEqual(locks, [true])
  entrance.update(600)
  assert.ok(Number(canvas.style.opacity) > 0 && Number(canvas.style.opacity) < 1)
  entrance.update(5000)
  assert.equal(entrance.active, false)
  assert.deepEqual(root.scale.toArray(), [1, 1, 1])
  assert.deepEqual(root.rotation.toArray(), [0, -0.32, 0, 'XYZ'])
  assert.equal(canvas.style.opacity, '')
  assert.deepEqual(locks, [true, false])
  entrance.start()
  entrance.update(6000)
  assert.equal(entrance.active, false)
  assert.deepEqual(locks, [true, false])
})

test('camera measurement sees the rest pose and always restores the animated pose', () => {
  const { root, entrance } = fixture()
  entrance.start()
  const scale = root.scale.clone()
  const rotation = root.rotation.clone()
  assert.throws(() => entrance.withRestPose(() => {
    assert.equal(root.scale.x, 1)
    assert.equal(root.rotation.y, -0.32)
    throw new Error('measurement failed')
  }), /measurement failed/)
  assert.deepEqual(root.scale, scale)
  assert.deepEqual(root.rotation.toArray(), rotation.toArray())
})

test('reduced motion skips the entrance and changing preference finishes immediately', () => {
  const reduced = fixture(true)
  reduced.entrance.start()
  assert.equal(reduced.entrance.active, false)
  assert.deepEqual(reduced.locks, [])
  assert.equal(reduced.canvas.style.opacity, '')
  const running = fixture()
  running.entrance.start()
  const event = new Event('change')
  event.matches = true
  running.motionPreference.dispatchEvent(event)
  assert.equal(running.entrance.active, false)
  assert.equal(running.root.scale.x, 1)
  assert.deepEqual(running.locks, [true, false])
})

test('early completion is idempotent and releases the interaction lock', () => {
  const { root, entrance, locks } = fixture()
  entrance.start()
  entrance.finish()
  entrance.finish()
  entrance.update(1000)
  assert.equal(root.rotation.y, -0.32)
  assert.deepEqual(locks, [true, false])
})

test('assembly restores every component exactly without changing geometry or local scale', () => {
  const { root, entrance } = fixture()
  const positions = root.children.map(part => part.position.toArray())
  const geometry = root.children.map(part => part.geometry?.attributes.position.array.slice())
  const scales = root.children.map(part => part.scale.toArray())
  entrance.start()
  entrance.update(0)
  assert.notDeepEqual(root.children.map(part => part.position.toArray()), positions)
  entrance.update(1500)
  entrance.withRestPose(() => assert.deepEqual(root.children.map(part => part.position.toArray()), positions))
  entrance.update(2650)
  assert.deepEqual(root.children.map(part => part.position.toArray()), positions)
  entrance.finish()
  assert.deepEqual(root.children.map(part => part.position.toArray()), positions)
  assert.deepEqual(root.children.map(part => part.geometry?.attributes.position.array), geometry)
  assert.deepEqual(root.children.map(part => part.scale.toArray()), scales)
})

test('light rises only after assembly and reaches full intensity at 3.6 seconds', () => {
  const { entrance, lights, locks } = fixture()
  entrance.start()
  entrance.update(0)
  entrance.update(2650)
  assert.equal(lights.at(-1), 0)
  entrance.update(3125)
  assert.equal(lights.at(-1), 0.5)
  assert.deepEqual(locks, [true])
  entrance.update(3600)
  assert.equal(lights.at(-1), 1)
  assert.deepEqual(locks, [true, false])
})
