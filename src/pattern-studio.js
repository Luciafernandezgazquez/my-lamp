import { SurfacePaint } from './surface-paint.js'

export function createPatternStudio({ canvas, camera, controls, root, onClose }) {
  const panel = document.querySelector('.pattern-panel')
  panel.innerHTML = `
    <div class="studio-heading"><div><p class="eyebrow">Make your mark</p><h3>Pattern Studio</h3></div><button type="button" id="studio-done">Done</button></div>
    <div class="studio-modes" role="group" aria-label="Interaction mode">
      <button type="button" data-paint-mode="draw" aria-pressed="true">✎ Draw</button>
      <button type="button" data-paint-mode="rotate" aria-pressed="false">↔ Rotate</button>
    </div>
    <div class="studio-tools" role="group" aria-label="Decoration tool">
      <button type="button" data-paint-tool="watercolor" aria-pressed="true"><i class="brush-preview brush-preview--watercolor" aria-hidden="true"></i>Watercolor</button>
      <button type="button" data-paint-tool="lines" aria-pressed="false"><i class="brush-preview brush-preview--lines" aria-hidden="true"></i>Lines</button>
      <button type="button" data-paint-tool="dots" aria-pressed="false"><i class="brush-preview brush-preview--dots" aria-hidden="true"></i>Polka dots</button>
      <button type="button" data-paint-tool="eraser" aria-pressed="false"><i class="brush-preview brush-preview--eraser" aria-hidden="true"></i>Eraser</button>
    </div>
    <div class="studio-colors" role="group" aria-label="Drawing color">
      ${['#D9819F', '#E8C75F', '#929FD5', '#8ABCAF', '#71566E', '#FFFFFF', '#202020'].map((color, i) => `<button type="button" data-ink="${color}" aria-label="${['Candy pink', 'Butter yellow', 'Periwinkle', 'Mint', 'Plum', 'White', 'Black'][i]} ink" aria-pressed="${i === 0}" style="--ink-color:${color}"></button>`).join('')}
      <label class="custom-ink" title="Choose a drawing color"><span class="sr-only">Custom drawing color</span><input type="color" id="drawing-color" value="#D9819F"></label>
    </div>
    <div class="studio-sliders">
      <label for="drawing-size">Tool size <output id="drawing-size-value">28</output><input id="drawing-size" type="range" min="12" max="72" value="28"></label>
      <label for="drawing-spacing" id="drawing-spacing-label" hidden>Dot spacing <output id="drawing-spacing-value">1.6×</output><input id="drawing-spacing" type="range" min="1.1" max="3" step="0.1" value="1.6"></label>
    </div>
    <div class="studio-actions">
      <button type="button" id="drawing-undo" disabled title="Undo (Ctrl or Command + Z)">↶ Undo</button>
      <button type="button" id="drawing-redo" disabled title="Redo (Ctrl or Command + Shift + Z)">↷ Redo</button>
      <button type="button" id="drawing-clear" disabled>Clear drawing</button>
    </div>
    <p class="studio-hint" id="studio-hint" role="status">Draw on the lamp. Switch to Rotate to decorate another side.</p>
  `
  const dialog = document.createElement('dialog')
  dialog.className = 'studio-confirm'
  dialog.setAttribute('aria-labelledby', 'studio-confirm-title')
  dialog.innerHTML = `<form method="dialog"><h2 id="studio-confirm-title"></h2><p id="studio-confirm-copy"></p><div><button value="cancel" autofocus>Cancel</button><button value="confirm" id="studio-confirm-action"></button></div></form>`
  document.body.append(dialog)
  function confirm({ title, copy, action }) {
    if (dialog.open) return Promise.resolve(false)
    document.querySelector('#studio-confirm-title').textContent = title
    document.querySelector('#studio-confirm-copy').textContent = copy
    document.querySelector('#studio-confirm-action').textContent = action
    dialog.returnValue = 'cancel'
    return new Promise(resolve => {
      dialog.addEventListener('close', () => resolve(dialog.returnValue === 'confirm'), { once: true })
      dialog.showModal()
    })
  }
  const paint = new SurfacePaint({ canvas, camera, controls, root, onChange: updateHistory })
  function updateHistory() {
    panel.querySelector('#drawing-undo').disabled = paint.undoStack.length === 0
    panel.querySelector('#drawing-redo').disabled = paint.redoStack.length === 0
    panel.querySelector('#drawing-clear').disabled = !paint.hasArtwork()
  }
  panel.querySelector('#studio-done').addEventListener('click', onClose)
  panel.querySelectorAll('[data-paint-mode]').forEach(button => button.addEventListener('click', () => {
    paint.setMode(button.dataset.paintMode)
    panel.querySelectorAll('[data-paint-mode]').forEach(option => option.setAttribute('aria-pressed', option === button))
    panel.querySelector('#studio-hint').textContent = button.dataset.paintMode === 'draw'
      ? 'Draw on the lamp. Switch to Rotate to decorate another side.'
      : 'Drag to rotate, scroll or pinch to zoom. Your drawing stays in place.'
  }))
  panel.querySelectorAll('[data-paint-tool]').forEach(button => button.addEventListener('click', () => {
    paint.finishStroke()
    paint.settings.tool = button.dataset.paintTool
    panel.querySelectorAll('[data-paint-tool]').forEach(option => option.setAttribute('aria-pressed', option === button))
    panel.querySelector('#drawing-spacing-label').hidden = button.dataset.paintTool !== 'dots'
  }))
  function setColor(color) {
    paint.settings.color = color
    panel.querySelector('#drawing-color').value = color
    panel.querySelectorAll('[data-ink]').forEach(option => option.setAttribute('aria-pressed', option.dataset.ink.toLowerCase() === color.toLowerCase()))
  }
  panel.querySelectorAll('[data-ink]').forEach(button => button.addEventListener('click', () => setColor(button.dataset.ink)))
  panel.querySelector('#drawing-color').addEventListener('input', event => setColor(event.target.value))
  panel.querySelector('#drawing-size').addEventListener('input', event => {
    paint.settings.size = Number(event.target.value)
    panel.querySelector('#drawing-size-value').textContent = event.target.value
  })
  panel.querySelector('#drawing-spacing').addEventListener('input', event => {
    paint.settings.spacing = Number(event.target.value)
    panel.querySelector('#drawing-spacing-value').textContent = `${event.target.value}×`
  })
  panel.querySelector('#drawing-undo').addEventListener('click', () => paint.history())
  panel.querySelector('#drawing-redo').addEventListener('click', () => paint.history(true))
  panel.querySelector('#drawing-clear').addEventListener('click', async () => {
    if (await confirm({ title: 'Clear your drawing?', copy: 'The lamp’s colors and finish will stay as they are. You can undo this while you stay on this model.', action: 'Clear drawing' })) paint.clear()
  })
  document.addEventListener('keydown', event => {
    if (!paint.open || dialog.open || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return
    if ((event.ctrlKey || event.metaKey) && ['z', 'y'].includes(event.key.toLowerCase())) {
      event.preventDefault()
      paint.history(event.key.toLowerCase() === 'y' || event.shiftKey)
    }
  })
  return { panel, paint, confirm, get confirming() { return dialog.open } }
}
