import { Vector3, MathUtils } from 'three'

// The upright suspension cord and orbit target share the viewer's centerline.
// Solve its perspective projection for a tip just beyond the circular mask.
export function suspensionZoomLimit(camera, target, cableTop) {
  const direction = new Vector3().subVectors(camera.position, target).normalize()
  const up = camera.up.clone().addScaledVector(direction, -camera.up.dot(direction)).normalize()
  const tip = new Vector3().subVectors(cableTop, target)
  const slope = Math.tan(MathUtils.degToRad(camera.getEffectiveFOV() / 2))
  return tip.dot(direction) + tip.dot(up) / (slope * 1.015)
}
