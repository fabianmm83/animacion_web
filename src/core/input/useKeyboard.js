import { useEffect, useRef } from 'react'

/**
 * Devuelve un ref con el vector de input {-1..1} en x e y.
 * x: A/D o ←/→
 * y: W/S o ↑/↓
 */
export function useKeyboard() {
  const input = useRef({ x: 0, y: 0 })
  const keys = useRef(new Set())

  useEffect(() => {
    const down = (e) => keys.current.add(e.key.toLowerCase())
    const up = (e) => keys.current.delete(e.key.toLowerCase())
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)

    let raf
    const update = () => {
      const k = keys.current
      let x = 0, y = 0
      if (k.has('a') || k.has('arrowleft')) x -= 1
      if (k.has('d') || k.has('arrowright')) x += 1
      if (k.has('w') || k.has('arrowup')) y -= 1
      if (k.has('s') || k.has('arrowdown')) y += 1
      input.current.x = x
      input.current.y = y
      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)

    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      cancelAnimationFrame(raf)
    }
  }, [])

  return input
}