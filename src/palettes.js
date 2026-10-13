// Four distinct tones per family keep the lamp's existing part assignments clear.
const pink = ['#EDB5C5', '#D69BAE', '#F4CCD7', '#FBE5EA']
const yellow = ['#F2E3AB', '#D9C78F', '#E8CEAA', '#FCF4D9']
const blue = ['#BEC5E7', '#9DA8CE', '#D5D9EF', '#EEF0FA']

export const palettes = [
  { id: 'pink', name: 'Pink', shades: pink },
  { id: 'yellow', name: 'Yellow', shades: yellow },
  { id: 'blue', name: 'Blue', shades: blue },
  { id: 'white', name: 'White', shades: Array(4).fill('#FFFFFF') },
  { id: 'black', name: 'Black', shades: Array(4).fill('#000000') },
  { id: 'mixed', name: 'Mixed colors', shades: [pink[0], yellow[0], blue[0], blue[3]] },
]

// Alternate the main shade's color family, not just a similar shade within it.
// Every slot changes and all three color families appear in every combination.
export function mixedShades(previous = [], random = Math.random) {
  const families = palettes.slice(0, 3).map((palette) => palette.shades)
  const orders = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]
    .filter((order) => !families[order[0]].includes(previous[0]))
  const pick = (values) => values[Math.floor(random() * values.length)]
  const order = pick(orders)
  const result = []
  for (let slot = 0; slot < 4; slot++) {
    result.push(pick(families[order[slot % 3]].filter((color) =>
      color !== previous[slot] && !result.includes(color))))
  }
  return result
}
