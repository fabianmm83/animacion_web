import { useGameStore } from '../../core/engine/store'

export default function HUD({ islaActual, onChangeIsla }) {
  const camFollow = useGameStore((s) => s.camFollow)
  const setCamFollow = useGameStore((s) => s.setCamFollow)
  const setCamPan = useGameStore((s) => s.setCamPan)
  const setCamRotation = useGameStore((s) => s.setCamRotation)
  const setCamPitch = useGameStore((s) => s.setCamPitch)

  const islas = [
    { id: 'tocho', label: '🏈 Tocho' },
    { id: 'codigo', label: '💻 Código' },
    { id: 'montana', label: '🏔️ Montaña' },
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

  return (
    <>
      {/* ─── Selector de islas (arriba izquierda) ─── */}
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
              touchAction: 'manipulation',
              userSelect: 'none',
            }}
          >
            {i.label}
          </button>
        ))}
      </div>

      {/* ─── Estado de cámara + botones (arriba derecha) ─── */}
      <div style={{
        position: 'fixed',
        top: 12, right: 12,
        display: 'flex', gap: 8, alignItems: 'center',
        zIndex: 10,
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        maxWidth: 'calc(100vw - 24px)',
      }}>
        <span style={{
          color: camFollow ? '#22c55e' : '#f59e0b',
          fontFamily: 'monospace',
          fontSize: 11,
          padding: '6px 10px',
          background: 'rgba(20,20,30,0.75)',
          borderRadius: 6,
          border: '1px solid rgba(255,255,255,0.2)',
          userSelect: 'none',
        }}>
          {camFollow ? '● FOLLOW' : '● FREE'}
        </span>

        {!camFollow && (
          <button
            onClick={resetCam}
            style={{
              padding: '6px 12px',
              background: '#22c55e',
              color: '#fff',
              border: '2px solid #fff',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: 11,
              borderRadius: 6,
              touchAction: 'manipulation',
              userSelect: 'none',
            }}
          >
            ⊙ Centrar
          </button>
        )}

        <button
          onClick={resetAll}
          style={{
            padding: '6px 12px',
            background: 'rgba(20,20,30,0.75)',
            color: '#fff',
            border: '2px solid #fff',
            cursor: 'pointer',
            fontFamily: 'monospace',
            fontSize: 11,
            borderRadius: 6,
            touchAction: 'manipulation',
            userSelect: 'none',
          }}
          title="Reset cámara completa (rotación + pitch + pan)"
        >
          ⟳ Reset
        </button>
      </div>

      {/* ─── Hints de controles (abajo derecha, oculto en móvil) ─── */}
      <div
        className="hud-hints"
        style={{
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
        }}
      >
        <div>WASD / ↑←↓→ mover</div>
        <div>Rueda: zoom</div>
        <div>Clic der: orbitar</div>
        <div>Clic medio: pan</div>
        <div>Doble clic der: follow</div>
      </div>

      {/* ─── Hints móvil (abajo izquierda, sobre el D-pad) ─── */}
      <div
        className="hud-hints-mobile"
        style={{
          position: 'fixed',
          bottom: 12, left: 12,
          color: '#9aa',
          fontFamily: 'monospace',
          fontSize: 10,
          zIndex: 10,
          opacity: 0.75,
          lineHeight: 1.4,
          pointerEvents: 'none',
          userSelect: 'none',
          maxWidth: 140,
        }}
      >
        <div>1 dedo izq: mover</div>
        <div>1 dedo der: rotar</div>
        <div>2 dedos: zoom/pan</div>
        <div>Doble tap: centrar</div>
      </div>
    </>
  )
}