import { useEffect, useState } from 'react'
import { useGameStore } from '../../core/engine/store'

export default function HUD({ islaActual, onChangeIsla }) {
  const camFollow = useGameStore((s) => s.camFollow)
  const setCamFollow = useGameStore((s) => s.setCamFollow)
  const setCamPan = useGameStore((s) => s.setCamPan)
  const setCamRotation = useGameStore((s) => s.setCamRotation)
  const setCamPitch = useGameStore((s) => s.setCamPitch)

  // Detectar si es pantalla chica (móvil)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const islas = [
    { id: 'tocho', label: isMobile ? '🏈' : '🏈 Tocho' },
    { id: 'codigo', label: isMobile ? '💻' : '💻 Código' },
    { id: 'montana', label: isMobile ? '🏔️' : '🏔️ Montaña' },
  ]

  const resetCam = () => {
    setCamFollow(true)
    setCamPan([0, 0])
  }

  const resetAll = () => {
    setCamFollow(true)
    setCamPan([0, 0])
    setCamRotation(Math.PI / 4)
    setCamPitch(Math.PI / 4)
  }

  const btnBase = {
    color: '#fff',
    border: '2px solid #fff',
    cursor: 'pointer',
    fontFamily: 'monospace',
    borderRadius: 6,
    touchAction: 'manipulation',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    padding: isMobile ? '6px 8px' : '8px 12px',
    fontSize: isMobile ? 12 : 12,
    flex: '0 0 auto',
  }

  return (
    <>
      {/* ─── FILA SUPERIOR: selector de islas (izq) + estado de cámara (der) ─── */}
      <div style={{
        position: 'fixed',
        top: 8, left: 8, right: 8,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 8,
        zIndex: 10,
        pointerEvents: 'none', // los hijos sí reciben clicks
        maxWidth: 'calc(100vw - 16px)',
        flexWrap: 'nowrap',
      }}>
        {/* Selector de islas */}
        <div style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          pointerEvents: 'auto',
        }}>
          {islas.map((i) => (
            <button
              key={i.id}
              onClick={() => onChangeIsla(i.id)}
              style={{
                ...btnBase,
                background: islaActual === i.id ? '#c0392b' : 'rgba(20,20,30,0.85)',
              }}
              title={i.id}
            >
              {i.label}
            </button>
          ))}
        </div>

        {/* Estado de cámara + botones */}
        <div style={{
          display: 'flex',
          gap: 6,
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          pointerEvents: 'auto',
        }}>
          {!isMobile && (
            <span style={{
              color: camFollow ? '#22c55e' : '#f59e0b',
              fontFamily: 'monospace',
              fontSize: 11,
              padding: '6px 10px',
              background: 'rgba(20,20,30,0.85)',
              borderRadius: 6,
              border: '1px solid rgba(255,255,255,0.2)',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
            }}>
              {camFollow ? '● FOLLOW' : '● FREE'}
            </span>
          )}

          {!camFollow && (
            <button
              onClick={resetCam}
              style={{
                ...btnBase,
                background: '#22c55e',
                padding: isMobile ? '6px 8px' : '6px 12px',
                fontSize: 11,
              }}
              title="Centrar en el avatar"
            >
              {isMobile ? '⊙' : '⊙ Centrar'}
            </button>
          )}

          <button
            onClick={resetAll}
            style={{
              ...btnBase,
              background: 'rgba(20,20,30,0.85)',
              padding: isMobile ? '6px 8px' : '6px 12px',
              fontSize: 11,
            }}
            title="Reset cámara"
          >
            {isMobile ? '⟳' : '⟳ Reset'}
          </button>
        </div>
      </div>

      {/* ─── Hints desktop (solo en desktop, abajo derecha) ─── */}
      {!isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 12, right: 12,
          color: '#9aa',
          fontFamily: 'monospace',
          fontSize: 11,
          textAlign: 'right',
          zIndex: 10,
          opacity: 0.85,
          maxWidth: 260,
          lineHeight: 1.5,
          pointerEvents: 'none',
          userSelect: 'none',
        }}>
          <div>WASD / ↑←↓→ mover</div>
          <div>Rueda: zoom</div>
          <div>Clic der: orbitar</div>
          <div>Clic medio: pan</div>
          <div>Doble clic der: follow</div>
        </div>
      )}

      {/* ─── Hints móvil (solo en móvil, abajo derecha, arriba del D-pad) ─── */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          bottom: 12, right: 12,
          color: '#9aa',
          fontFamily: 'monospace',
          fontSize: 9,
          textAlign: 'right',
          zIndex: 10,
          opacity: 0.7,
          lineHeight: 1.35,
          pointerEvents: 'none',
          userSelect: 'none',
          maxWidth: 130,
        }}>
          <div>1 dedo der: rotar</div>
          <div>2 dedos: zoom/pan</div>
          <div>Doble tap: centrar</div>
        </div>
      )}
    </>
  )
}