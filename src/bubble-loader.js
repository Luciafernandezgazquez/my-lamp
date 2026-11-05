const animationComplete = element =>
  Promise.all(
    element.getAnimations({ subtree: true }).map(animation =>
      animation.finished.catch(error => {
        if (error.name !== 'AbortError') throw error // Reduced motion cancels CSS animations.
      }),
    ),
  )

export function createBubbleLoader({
  screen = document.querySelector('#bubble-loader'),
  app = document.querySelector('#app'),
  page = document.documentElement,
  motion = window.matchMedia('(prefers-reduced-motion: reduce)'),
  reload = () => window.location.reload(),
} = {}) {
  let state = 'filling'
  let reduced = motion.matches
  const reduceMotion = event => {
    if (!event.matches) return
    reduced = true // Do not restart a cancelled sequence if preferences change again.
    screen.classList.add('is-still')
  }
  reduceMotion(motion)
  motion.addEventListener('change', reduceMotion)
  // Finish the visual sequence even on fast connections. On slow connections,
  // replace the completed circles with one flat yellow fill until sceneReady.
  const filled = animationComplete(screen).then(() => {
    if (state !== 'failed' && !reduced) screen.classList.add('is-filled')
  })

  return {
    async reveal(startConfigurator) {
      if (state !== 'filling') return
      state = 'revealing'
      await filled
      if (state === 'failed') return
      screen.classList.add('is-leaving')
      await animationComplete(screen)
      if (state === 'failed') return
      // Render the lamp's first entrance frame before exposing its canvas.
      startConfigurator()
      app.inert = false
      app.removeAttribute('aria-busy')
      page.classList.remove('is-preparing')
      motion.removeEventListener('change', reduceMotion)
      screen.remove()
      state = 'complete'
    },
    fail() {
      if (state === 'complete' || state === 'failed') return
      state = 'failed'
      motion.removeEventListener('change', reduceMotion)
      screen.classList.remove('is-filled', 'is-leaving')
      screen.classList.add('has-error')
      screen.setAttribute('role', 'button')
      screen.setAttribute('aria-label', 'Unable to load configurator. Activate to retry.')
      screen.tabIndex = 0
      screen.addEventListener('click', reload, { once: true })
      screen.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          reload()
        }
      })
      screen.focus()
    },
  }
}
