import { useGameStore } from '../../core/engine/store'

export default function HUD({ islaActual, onChangeIsla }) {
  const camFollow = useGameStore((s) => s.camFollow)
  const setCamFollow = useGameStore((s) => s.setCamFollow)
  const setCamPan = useGameStore((s) => s.setCamPan)

  const islas = [
    { id: 'tocho', label: '🏈 Tocho' },
    { id: 'codigo', label: '💻 Código' },
    { id: 'montana', label: '🏔️ Montaña' },
  ]

  const resetCam = () => {
    setCamFollow(true)
    setCamPan([0, 0])
  }

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 12, left: 12,
        display: 'flex', gap: 8, flexWrap: 'wrap',
        zIndex: 10,
        maxWidth: 'calc(100vw - 24px)',
      }}>
        {islas.map((i) => (
          <button
            key={i.id}
            onClick={() => onChangeIsla(i.id)}
            style={{
              padding: '8px 12px',
              background: islaActual === i.id ? '#c0392b' : 'rgba(20,20,30,0.75)',
              color: '#fff',
              border: '2px solid #fff',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: 12,
              borderRadius: 6,
            }}
          >
            {i.label}
          </button>
        ))}
      </div>

      {/* Indicador de cámara */}
      <div style={{
        position: 'fixed',
        top: 12, right: 12,
        display: 'flex', gap: 8, alignItems: 'center',
        zIndex: 10,
      }}>
        <span style={{
          color: camFollow ? '#22c55e' : '#f59e0b',
          fontFamily: 'monospace',
          fontSize: 11,
          padding: '6px 10px',
          background: 'rgba(20,20,30,0.75)',
          borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.2)',
        }}>
          {camFollow ? '● FOLLOW' : '● FREE'}
        </span>
        {!camFollow && (
          <button
            onClick={resetCam}
            style={{
              padding: '6px 10px',
              background: 'rgba(20,20,30,0.75)',
              color: '#fff',
              border: '2px solid #fff',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: 11,
              borderRadius: 6,
            }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Hints de controles */}
      <div style={{
        position: 'fixed',
        bottom: 12, right: 12,
        color: '#9aa',
        fontFamily: 'monospace',
        fontSize: 11,
        textAlign: 'right',
        zIndex: 10,
        opacity: 0.85,
        maxWidth: 240,
        lineHeight: 1.5,
        pointerEvents: 'none',
      }}>
        <div>WASD / ↑←↓→ mover</div>
        <div>Rueda: zoom</div>
        <div>Clic der: orbitar</div>
        <div>Clic medio: pan</div>
        <div>Doble clic der: follow</div>
      </div>
    </>
  )
}