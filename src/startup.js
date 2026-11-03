import { createBubbleLoader } from './bubble-loader.js'

const loading = createBubbleLoader()
try {
  const { sceneReady, startConfigurator } = await import('./main.js')
  // Preserve the existing preparation fallback (for example, a missing UI
  // preview image must not prevent the generated lamp from opening).
  await sceneReady.catch(error => console.error('Unable to prepare the STAP configurator:', error))
  await loading.reveal(startConfigurator)
} catch (error) {
  console.error('Unable to start the STAP configurator:', error)
  loading.fail()
}
