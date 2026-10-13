import { Color } from 'three'

// Subtle tints in linear color space, with equal luminance so moving the
// temperature control changes hue rather than the lamp's light output.
export function lightTemperature(value) {
  const position = Math.max(0, Math.min(100, value))
  const warm = new Color('#FFE6AD')
  const neutral = new Color('#FFFFFF')
  // A near-white endpoint keeps the cool light crisp without a blue cast.
  const cool = new Color('#F4F7FF')
  const tint = position <= 50
    ? warm.lerp(neutral, position / 50)
    : neutral.lerp(cool, (position - 50) / 50)
  const luminance = tint.r * 0.2126 + tint.g * 0.7152 + tint.b * 0.0722
  const color = tint.clone().multiplyScalar(1 / luminance)
  const kelvin = Math.round((position <= 50
    ? 2700 + position * 26
    : 4000 + (position - 50) * 50) / 50) * 50
  return { color, tint, kelvin }
}
