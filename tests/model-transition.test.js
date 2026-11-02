import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { applyCarouselPose, createModelTransition } from '../src/model-transition.js'

test('outgoing carousel travels sideways and back without modifying the lamp', () => {
  const root = new THREE.Group()
  root.rotation.y = -0.32
  const part = new THREE.Mesh(new THREE.CylinderGeometry(1, 2, 1), new THREE.MeshStandardMaterial())
  part.position.y = 0.9
  root.add(part)
  const vertices = part.geometry.attributes.position.array.slice()
  const rest = { position: root.position.clone(), rotation: root.rotation.clone(), scale: root.scale.clone() }
  const path = { right: new THREE.Vector3(1, 0, 0), towardCamera: new THREE.Vector3(0, 0, 1), distance: 7, depth: 1, direction: 1 }
  applyCarouselPose(root, rest, path, -0.5)
  assert.equal(root.position.x, -3.5)
  assert.equal(root.position.z, -0.5)
  assert.ok(root.rotation.y < rest.rotation.y)
  assert.deepEqual(root.scale.toArray(), [1, 1, 1])
  applyCarouselPose(root, rest, path, -1)
  assert.equal(root.position.x, -7)
  assert.equal(part.position.y, 0.9)
  assert.deepEqual(part.geometry.attributes.position.array, vertices)
  applyCarouselPose(root, rest, path, 0)
  assert.deepEqual(root.position.toArray(), rest.position.toArray())
  assert.deepEqual(root.rotation.toArray(), rest.rotation.toArray())
})

function fixture(reduced = false) {
  const root = new THREE.Group()
  root.rotation.y = -0.32
  const scene = new THREE.Scene()
  scene.add(root)
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
  camera.position.set(5.2, 1.1, 8.5)
  const controls = { target: new THREE.Vector3(0, -0.25, 0), minDistance: 6, maxDistance: 13 }
  const preference = new EventTarget()
  preference.matches = reduced
  let id = 'a'
  const swaps = [], disposed = [], locks = []
  const add = () => root.add(new THREE.Mesh(new THREE.SphereGeometry(1.5), new THREE.MeshStandardMaterial()))
  add()
  const transition = createModelTransition({
    root, scene, camera, controls, motionPreference: preference,
    modelIds: ['a', 'b', 'c', 'd'], currentId: () => id,
    swap(next) {
      const old = new THREE.Group()
      old.position.copy(root.position)
      old.rotation.copy(root.rotation)
      for (const child of [...root.children]) old.add(child)
      id = next
      swaps.push(next)
      add()
      return old
    },
    frame() { camera.position.set(4, 1, 7); controls.target.set(0, 0.1, 0) },
    dispose(old) { disposed.push(old); old.clear() },
    onLock(locked) { locks.push(locked) },
  })
  return { transition, root, scene, camera, controls, preference, swaps, disposed, locks }
}

test('incoming model is solid, restores its exact pose, and disposes the outgoing model', () => {
  const { transition, root, scene, camera, disposed, locks } = fixture()
  transition.request('b')
  assert.equal(scene.children.length, 2)
  assert.equal(transition.active, true)
  assert.notEqual(root.position.x, 0)
  assert.equal(root.children[0].material.opacity, 1)
  transition.update(100)
  const position = root.position.clone()
  transition.update(550)
  assert.notDeepEqual(root.position.toArray(), position.toArray())
  transition.withRestPose(() => assert.deepEqual(root.position.toArray(), [0, 0, 0]))
  transition.update(1000)
  assert.deepEqual(root.position.toArray(), [0, 0, 0])
  assert.deepEqual(root.rotation.toArray(), [0, -0.32, 0, 'XYZ'])
  assert.deepEqual(root.scale.toArray(), [1, 1, 1])
  assert.deepEqual(camera.position.toArray(), [4, 1, 7])
  assert.equal(scene.children.length, 1)
  assert.equal(disposed.length, 1)
  assert.deepEqual(locks, [true, false])
})

test('rapid selections retain only the latest choice and never more than two lamps', () => {
  const { transition, scene, swaps, disposed } = fixture()
  transition.request('b')
  transition.update(0)
  transition.request('c')
  transition.request('a')
  transition.request('d')
  assert.deepEqual(swaps, ['b'])
  transition.update(900)
  assert.deepEqual(swaps, ['b', 'd'])
  assert.equal(scene.children.length, 2)
  transition.update(1000)
  transition.update(1900)
  assert.equal(scene.children.length, 1)
  assert.equal(disposed.length, 2)
  assert.equal(transition.active, false)
})

test('selecting the arriving model cancels a queued change without another animation', () => {
  const { transition, swaps } = fixture()
  transition.request('b')
  transition.update(0)
  transition.request('c')
  transition.request('b')
  transition.update(900)
  assert.deepEqual(swaps, ['b'])
  assert.equal(transition.active, false)
})

test('reduced motion and interrupted transitions settle the latest selection immediately', () => {
  const reduced = fixture(true)
  reduced.transition.request('c')
  assert.equal(reduced.transition.active, false)
  assert.deepEqual(reduced.root.position.toArray(), [0, 0, 0])
  assert.equal(reduced.scene.children.length, 1)
  const running = fixture()
  running.transition.request('b')
  running.transition.request('d')
  running.preference.matches = true
  const event = new Event('change')
  event.matches = true
  running.preference.dispatchEvent(event)
  assert.deepEqual(running.swaps, ['b', 'd'])
  assert.equal(running.transition.active, false)
  assert.equal(running.scene.children.length, 1)
  assert.deepEqual(running.root.position.toArray(), [0, 0, 0])
  running.transition.finish()
  assert.equal(running.disposed.length, 2)
})

test('wide viewports maintain continuous travel toward the destination', () => {
  const { transition, root, camera, controls } = fixture()
  camera.aspect = 5
  const direction = camera.position.clone().sub(controls.target).normalize()
  const right = new THREE.Vector3().crossVectors(camera.up, direction).normalize()
  transition.request('b')
  let oldPosition = 0
  let newPosition = root.position.dot(right)
  for (let time = 0; time < 900; time += 30) {
    transition.update(time)
    const outgoing = transition.outgoing.position.dot(right)
    const incoming = root.position.dot(right)
    assert.ok(outgoing <= oldPosition + 1e-9)
    assert.ok(incoming <= newPosition + 1e-9)
    oldPosition = outgoing
    newPosition = incoming
  }
  transition.update(900)
  assert.deepEqual(root.position.toArray(), [0, 0, 0])
})
