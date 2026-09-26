export function inputToWorldDirection(x, y) {
  const len = Math.hypot(x, y)
  if (len < 0.001) return [0, 0, 0]
  return [x / len, 0, y / len]
}

export function snapToGrid(v, grid = 1) {
  return Math.round(v / grid) * grid
}