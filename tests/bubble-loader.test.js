import test from 'node:test'
import assert from 'node:assert/strict'
import { createBubbleLoader } from '../src/bubble-loader.js'

const deferred = () => {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
const flush = () => new Promise(resolve => setImmediate(resolve))

function setup(reduced = false) {
  const fill = deferred(),
    fade = deferred(),
    classes = new Set(),
    listeners = new Map()
  const motion = {
    matches: reduced,
    addEventListener(type, fn) {
      this.listener = fn
    },
    removeEventListener() {
      this.listener = undefined
    },
  }
  const app = {
    inert: true,
    removeAttribute(name) {
      this.removed = name
    },
  }
  const page = {
    classList: {
      remove(name) {
        this.removed = name
      },
    },
  }
  const screen = {
    classList: {
      add: name => classes.add(name),
      remove: (...names) => names.forEach(name => classes.delete(name)),
    },
    getAnimations: () =>
      classes.has('is-still')
        ? []
        : [{ finished: (classes.has('is-leaving') ? fade : fill).promise }],
    setAttribute(name, value) {
      this[name] = value
    },
    addEventListener: (type, fn) => listeners.set(type, fn),
    focus() {
      this.focused = true
    },
    remove() {
      this.removed = true
    },
  }
  let reloads = 0
  const loader = createBubbleLoader({ screen, app, page, motion, reload: () => reloads++ })
  return {
    loader,
    fill,
    fade,
    classes,
    app,
    page,
    screen,
    motion,
    listeners,
    get reloads() {
      return reloads
    },
  }
}

test('fast readiness completes the bubble fill and quick reveal before starting the lamp once', async () => {
  const f = setup()
  let starts = 0
  const done = f.loader.reveal(() => {
    assert.equal(f.app.inert, true)
    starts++
  })
  await f.loader.reveal(() => starts++)
  await flush()
  assert.equal(starts, 0)
  f.fill.resolve()
  await flush()
  assert.ok(f.classes.has('is-filled'))
  assert.ok(f.classes.has('is-leaving'))
  assert.equal(f.app.inert, true)
  assert.equal(starts, 0)
  f.fade.resolve()
  await done
  assert.equal(starts, 1)
  assert.equal(f.app.inert, false)
  assert.equal(f.app.removed, 'aria-busy')
  assert.equal(f.page.classList.removed, 'is-preparing')
  assert.equal(f.screen.removed, true)
  assert.equal(f.motion.listener, undefined)
  await f.loader.reveal(() => starts++)
  assert.equal(starts, 1)
})

test('slow readiness holds a solid yellow screen and leaves input locked', async () => {
  const f = setup()
  f.fill.resolve()
  await flush()
  assert.ok(f.classes.has('is-filled'))
  assert.equal(f.classes.has('is-leaving'), false)
  assert.equal(f.app.inert, true)
  const done = f.loader.reveal(() => {})
  await flush()
  f.fade.resolve()
  await done
  assert.equal(f.screen.removed, true)
})

test('reduced motion waits for readiness with static bubbles and no full-color flash', async () => {
  const f = setup(true)
  await flush()
  assert.ok(f.classes.has('is-still'))
  assert.equal(f.classes.has('is-filled'), false)
  assert.equal(f.app.inert, true)
  await f.loader.reveal(() => {})
  assert.equal(f.app.inert, false)
})

test('enabling reduced motion cancels the fill without restarting it on later preference changes', async () => {
  const f = setup()
  f.motion.listener({ matches: true })
  f.fill.reject(new DOMException('Motion reduced', 'AbortError'))
  await flush()
  f.motion.listener({ matches: false })
  assert.ok(f.classes.has('is-still'))
  await f.loader.reveal(() => {})
  assert.equal(f.app.inert, false)
})

test('module failure keeps the scene locked and offers a bubble-only keyboard retry', async () => {
  const f = setup()
  let starts = 0
  const done = f.loader.reveal(() => starts++)
  f.loader.fail()
  f.fill.resolve()
  await done
  assert.equal(starts, 0)
  assert.equal(f.app.inert, true)
  assert.equal(f.screen.role, 'button')
  assert.equal(f.screen.focused, true)
  assert.equal(f.motion.listener, undefined)
  f.listeners.get('keydown')({ key: 'Enter', preventDefault() {} })
  assert.equal(f.reloads, 1)
})
