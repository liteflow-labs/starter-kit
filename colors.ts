function interpolateColor(color1: string, color2: string, ratio: number) {
  const r1 = parseInt(color1.substring(1, 3), 16)
  const g1 = parseInt(color1.substring(3, 5), 16)
  const b1 = parseInt(color1.substring(5, 7), 16)

  const r2 = parseInt(color2.substring(1, 3), 16)
  const g2 = parseInt(color2.substring(3, 5), 16)
  const b2 = parseInt(color2.substring(5, 7), 16)

  const r = Math.round(r1 + (r2 - r1) * ratio)
    .toString(16)
    .padStart(2, '0')
  const g = Math.round(g1 + (g2 - g1) * ratio)
    .toString(16)
    .padStart(2, '0')
  const b = Math.round(b1 + (b2 - b1) * ratio)
    .toString(16)
    .padStart(2, '0')

  return `#${r}${g}${b}`.toUpperCase()
}

export function generatePalette(color: string, extra = 0.05) {
  const palette: { [key: number]: string } = {
    ...[50, 100, 200, 300, 400].reduce(
      (prev, x) => ({
        ...prev,
        [x]: interpolateColor(color, '#FFFFFF', 1 - x / 500 + extra),
      }),
      {},
    ),
    500: color,
    ...[600, 700, 800, 900, 950].reduce(
      (prev, x) => ({
        ...prev,
        [x]: interpolateColor(color, '#000000', x / 500 - 1 - extra),
      }),
      {},
    ),
  }

  return {
    ...palette,
    black: palette[950],
  }
}
