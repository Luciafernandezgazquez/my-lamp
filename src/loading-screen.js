// CSS starts the expansion while JavaScript and the scene are still loading.
// Animation completion, not a duplicate timer, controls the minimum duration.
const finished = element => Promise.all(element.getAnimations().map(animation =>
  animation.finished.catch(error => {
    // A reduced-motion preference change cancels the current CSS animation.
    if (error.name !== 'AbortError') throw error
  }),
))

export function createLoadingScreen({
  screen = document.querySelector('#loading-screen'),
  app = document.querySelector('#app'),
  page = document.documentElement,
  reload = () => window.location.reload(),
} = {}) {
  const disc = screen.querySelector('.loading-disc')
  const expansion = finished(disc)
  let state = 'loading'

  return {
    async reveal(startConfigurator) {
      if (state !== 'loading') return
      state = 'revealing'
      await expansion
      if (state === 'failed') return
      screen.classList.add('is-revealing')
      await finished(disc)
      if (state === 'failed') return
      // Start the lamp at its first entrance frame before exposing the canvas.
      startConfigurator()
      app.inert = false
      app.removeAttribute('aria-busy')
      page.classList.remove('is-loading')
      screen.remove()
      state = 'complete'
    },
    fail() {
      if (state === 'complete' || state === 'failed') return
      state = 'failed'
      screen.classList.add('has-error')
      screen.querySelector('.loading-message').textContent = 'STAP couldn’t finish loading. Please try again.'
      const retry = screen.querySelector('#loading-retry')
      retry.hidden = false
      retry.addEventListener('click', reload, { once: true })
      retry.focus()
    },
  }
}
