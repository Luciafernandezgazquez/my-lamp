import { createLoadingScreen } from './loading-screen.js'

const loading = createLoadingScreen()

try {
  // The overlay is already animating while Vite loads the scene and its CSS.
  const { sceneReady, startConfigurator } = await import('./main.js')
  await sceneReady
  await loading.reveal(startConfigurator)
} catch (error) {
  console.error('Unable to prepare the STAP configurator:', error)
  loading.fail()
}
