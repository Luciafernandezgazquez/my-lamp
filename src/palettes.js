export const palettes = [
  { id: 'pink', name: 'Pink', shades: ['#E06D86', '#E2AFB6', '#E4818E', '#FFD6DC'] },
  { id: 'yellow', name: 'Yellow', shades: ['#F3E082', '#E2CA52', '#F3C482', '#FFF6BA'] },
  { id: 'blue', name: 'Blue', shades: ['#A9B3DD', '#6D7FCD', '#C5D0FF', '#3850ED'] },
  { id: 'white', name: 'White', shades: Array(4).fill('#FFFFFF') },
  { id: 'black', name: 'Black', shades: Array(4).fill('#000000') },
  { id: 'mixed', name: 'Mixed colors', shades: ['#E06D86', '#F3E082', '#A9B3DD', '#3850ED'] },
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
