import { useRef, useEffect } from 'react'
import { useGameStore } from '../../core/engine/store'

export default function DPad() {
  const pressed = useRef({ up: false, down: false, left: false, right: false })

  const sync = () => {
    const p = pressed.current
    let x = 0, y = 0
    if (p.left) x -= 1
    if (p.right) x += 1
    if (p.up) y -= 1
    if (p.down) y += 1
    useGameStore.setState({ touchInput: { x, y } })
  }

  const setKey = (key, val) => {
    pressed.current[key] = val
    sync()
  }

  useEffect(() => {
    const clear = () => {
      pressed.current = { up: false, down: false, left: false, right: false }
      sync()
    }
    window.addEventListener('pointerup', clear)
    window.addEventListener('blur', clear)
    return () => {
      window.removeEventListener('pointerup', clear)
      window.removeEventListener('blur', clear)
    }
  }, [])

  const btnStyle = {
    width: 56, height: 56,
    background: 'rgba(20,20,30,0.9)',
    color: '#fff',
    border: '2px solid #fff',
    borderRadius: 8,
    fontSize: 20,
    fontFamily: 'monospace',
    touchAction: 'none',
    userSelect: 'none',
    cursor: 'pointer',
    padding: 0,
    pointerEvents: 'auto',
    zIndex: 100,
  }

  const bind = (key) => ({
    onPointerDown: (e) => {
      e.preventDefault()
      e.stopPropagation()
      setKey(key, true)
    },
    onPointerUp: (e) => {
      e.stopPropagation()
      setKey(key, false)
    },
    onPointerLeave: () => setKey(key, false),
    onPointerCancel: () => setKey(key, false),
    onContextMenu: (e) => e.preventDefault(),
  })

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      onPointerMove={(e) => e.stopPropagation()}
      onPointerUp={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        display: 'grid',
        gridTemplateColumns: '56px 56px 56px',
        gridTemplateRows: '56px 56px 56px',
        gap: 4,
        zIndex: 100,
        touchAction: 'none',
        pointerEvents: 'auto',
      }}
    >
      <div />
      <button {...bind('up')} style={btnStyle}>▲</button>
      <div />
      <button {...bind('left')} style={btnStyle}>◀</button>
      <div />
      <button {...bind('right')} style={btnStyle}>▶</button>
      <div />
      <button {...bind('down')} style={btnStyle}>▼</button>
      <div />
    </div>
  )
}