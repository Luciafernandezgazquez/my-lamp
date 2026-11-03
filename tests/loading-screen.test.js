import test from 'node:test'
import assert from 'node:assert/strict'
import { createLoadingScreen } from '../src/loading-screen.js'

const deferred = () => {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}
const flush = () => new Promise(resolve => setImmediate(resolve))

function fixture({ reduced = false } = {}) {
  const expansion = deferred(), contraction = deferred()
  const classes = new Set()
  const app = { inert: true, removeAttribute(name) { this.removedAttribute = name } }
  const page = { classList: { remove(name) { this.removed = name } } }
  const message = {}, retry = { hidden: true, addEventListener(type, fn) { this.click = fn }, focus() { this.focused = true } }
  const disc = { getAnimations: () => reduced ? [] : [{ finished: (classes.has('is-revealing') ? contraction : expansion).promise }] }
  const screen = {
    classList: { add: name => classes.add(name) },
    querySelector: selector => ({ '.loading-disc': disc, '.loading-message': message, '#loading-retry': retry })[selector],
    remove() { this.removed = true },
  }
  let reloads = 0
  return { expansion, contraction, classes, app, page, screen, message, retry, get reloads() { return reloads },
    loading: createLoadingScreen({ screen, app, page, reload: () => reloads++ }) }
}

test('fast readiness still waits for both circle phases and starts the lamp once', async () => {
  const f = fixture(); let starts = 0
  const reveal = f.loading.reveal(() => { assert.equal(f.app.inert, true); starts++ })
  await f.loading.reveal(() => starts++)
  await flush()
  assert.equal(starts, 0)
  assert.equal(f.classes.has('is-revealing'), false)
  f.expansion.resolve(); await flush()
  assert.equal(f.classes.has('is-revealing'), true)
  assert.equal(f.app.inert, true)
  assert.equal(starts, 0)
  f.contraction.resolve(); await reveal
  assert.equal(starts, 1)
  assert.equal(f.app.inert, false)
  assert.equal(f.app.removedAttribute, 'aria-busy')
  assert.equal(f.page.classList.removed, 'is-loading')
  assert.equal(f.screen.removed, true)
  await f.loading.reveal(() => starts++)
  assert.equal(starts, 1)
})

test('completed expansion holds until scene readiness requests the reveal', async () => {
  const f = fixture()
  f.expansion.resolve(); await flush()
  assert.equal(f.classes.has('is-revealing'), false)
  assert.equal(f.app.inert, true)
  const reveal = f.loading.reveal(() => {})
  await flush()
  f.contraction.resolve(); await reveal
  assert.equal(f.screen.removed, true)
})

test('reduced motion has no animation wait; cancellation also releases the overlay', async () => {
  const reduced = fixture({ reduced: true })
  await reduced.loading.reveal(() => {})
  assert.equal(reduced.app.inert, false)
  const changed = fixture()
  const reveal = changed.loading.reveal(() => {})
  changed.expansion.reject(new DOMException('Motion reduced', 'AbortError'))
  await flush()
  changed.contraction.reject(new DOMException('Motion reduced', 'AbortError'))
  await reveal
  assert.equal(changed.app.inert, false)
})

test('failed preparation offers retry without revealing or unlocking an incomplete scene', async () => {
  const f = fixture(); let starts = 0
  const reveal = f.loading.reveal(() => starts++)
  f.loading.fail()
  f.expansion.resolve(); await reveal
  assert.equal(starts, 0)
  assert.equal(f.app.inert, true)
  assert.equal(f.screen.removed, undefined)
  assert.equal(f.classes.has('has-error'), true)
  assert.equal(f.retry.hidden, false)
  assert.equal(f.retry.focused, true)
  f.retry.click()
  assert.equal(f.reloads, 1)
})
