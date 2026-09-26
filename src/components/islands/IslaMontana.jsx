import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import { COLORS } from '../../core/engine/constants'

// ─────────────────────────────────────────────────────────────
// GRADIENTE CEL-SHADING (toon)
// Se construye UNA sola vez al cargar el módulo (no por render,
// no por componente). Da el look de bandas planas de color —
// la firma visual de animación tipo Rick & Morty — en vez del
// degradado suave de un material PBR estándar.
// ─────────────────────────────────────────────────────────────
const CEL_STEPS = 4
const celGradient = (() => {
  if (typeof document === 'undefined') return null
  const canvas = document.createElement('canvas')
  canvas.width = CEL_STEPS
  canvas.height = 1
  const ctx = canvas.getContext('2d')
  for (let i = 0; i < CEL_STEPS; i++) {
    const v = Math.round((i / (CEL_STEPS - 1)) * 255)
    ctx.fillStyle = `rgb(${v},${v},${v})`
    ctx.fillRect(i, 0, 1, 1)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.minFilter = THREE.NearestFilter
  tex.magFilter = THREE.NearestFilter
  tex.generateMipmaps = false
  return tex
})()

// ─── Paleta local (campamento, mundo, marcadores de estado) ───
const PALETTE = {
  tienda: '#e8823c',
  tiendaSombra: '#c2601f',
  fogata: '#ff9d3d',
  fogataNucleo: '#fff3b0',
  ascuas: '#ff5a1f',
  mochila: '#4f8a52',
  mochilaSolapa: '#356b3b',
  linterna: '#ffe08a',
  huella: '#a58f66',
  visitado: '#4ade80',
  metaPendiente: '#c7ced6',
  globoMar: '#3b82f6',
  globoTierra: '#4d9e5c',
  brujulaCuerpo: '#e5e7eb',
  brujulaSur: '#e5e7eb',
  brujulaNorte: '#ef4444',
  maleta: '#7c4a2d',
  maletaDetalle: '#5a3a22',
  sticker1: '#f43f5e',
  sticker2: '#fbbf24',
  sticker3: '#22d3ee',
  avion: '#f8fafc',
  letreroPoste: '#8a5a34',
  letreroPlaca: '#e8823c',
  piedraAltar: '#6b6459',
  piedraAltarMedio: '#5a5448',
  piedraAltarAlto: '#4a453b',
}

// ─────────────────────────────────────────────────────────────
// MONTAÑA — silueta procedural con desplazamiento tipo low-poly.
// Se conserva el algoritmo original (ha demostrado dar siluetas
// reconocibles para cada volcán); solo cambia el material a toon.
// ─────────────────────────────────────────────────────────────
function Montaña({
  position,
  altura,
  radio,
  color,
  nieve = false,
  nieveAltura = 0.3,
  segments = 8,
  perfil = null,
}) {
  const geo = useMemo(() => {
    const g = new THREE.ConeGeometry(radio, altura, segments, 6)
    const pos = g.attributes.position

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = pos.getZ(i)

      const t = (y + altura / 2) / altura

      let factor = 1
      if (perfil) {
        factor = perfil(t)
      } else {
        factor = 1 - t * 0.85
      }

      const noise = 0.85 + Math.random() * 0.3
      const snapX = Math.round(x * factor * 4 * noise) / 4
      const snapZ = Math.round(z * factor * 4 * noise) / 4
      const snapY = Math.round(y * 4) / 4

      pos.setXYZ(i, snapX, snapY, snapZ)
    }
    g.computeVertexNormals()
    return g
  }, [altura, radio, segments, perfil])

  return (
    <group position={position}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshToonMaterial color={color} gradientMap={celGradient} flatShading />
      </mesh>

      {nieve && (
        <mesh position={[0, altura * nieveAltura, 0]} castShadow>
          <coneGeometry args={[radio * 0.32, altura * 0.42, segments]} />
          <meshToonMaterial color={COLORS.nieve} gradientMap={celGradient} flatShading />
        </mesh>
      )}
    </group>
  )
}

// ─── Adoratorio prehispánico — el sitio ceremonial real en la cima de Tláloc ───
function Altar({ position = [0, 0, 0] }) {
  return (
    <group position={position} rotation={[0, 0.4, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.09, 0]}>
        <boxGeometry args={[0.6, 0.18, 0.6]} />
        <meshToonMaterial color={PALETTE.piedraAltar} gradientMap={celGradient} flatShading />
      </mesh>
      <mesh castShadow position={[0, 0.24, 0]}>
        <boxGeometry args={[0.42, 0.14, 0.42]} />
        <meshToonMaterial color={PALETTE.piedraAltarMedio} gradientMap={celGradient} flatShading />
      </mesh>
      <mesh castShadow position={[0, 0.36, 0]}>
        <boxGeometry args={[0.26, 0.1, 0.26]} />
        <meshToonMaterial color={PALETTE.piedraAltarAlto} gradientMap={celGradient} flatShading />
      </mesh>
    </group>
  )
}

// ─── Monte Tláloc — el volcán de las decenas de visitas ────────
function MonteTlaloc({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <Montaña
        position={[0, 0.25, 0]}
        altura={4.8}
        radio={2.4}
        color="#6fa15a"
        nieve
        nieveAltura={0.3}
        segments={8}
      />
      <Altar position={[0, 4.5, 0]} />
    </group>
  )
}

// ─── Popocatépetl — la meta que aún falta por conquistar ───────
function Popocatepetl({ position = [0, 0, 0] }) {
  const smokeRef = useRef()
  const craterRef = useRef()
  const hazeRef = useRef()
  const metaRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (craterRef.current) {
      craterRef.current.material.emissiveIntensity = 0.5 + Math.sin(t * 2) * 0.25
    }
    if (smokeRef.current) {
      smokeRef.current.position.y = 8.6 + Math.sin(t * 1.2) * 0.15
      smokeRef.current.scale.setScalar(1 + Math.sin(t * 0.8) * 0.15)
    }
    if (hazeRef.current) {
      hazeRef.current.material.opacity = 0.22 + Math.sin(t * 0.4) * 0.06
    }
    if (metaRef.current) {
      metaRef.current.position.y = 9.4 + Math.sin(t * 1.4) * 0.15
      metaRef.current.rotation.z = t * 0.8
      const s = 1 + Math.sin(t * 2) * 0.08
      metaRef.current.scale.set(s, 1, s)
    }
  })

  return (
    <group position={position}>
      <Montaña
        position={[0, 0.25, 0]}
        altura={8}
        radio={3.6}
        color="#a3907d"
        nieve
        nieveAltura={0.32}
        segments={10}
      />

      {/* Nieve en lenguas */}
      {[
        [0.6, 6.5, 0.8], [-0.7, 6.2, -0.4], [0.2, 6.8, -0.6],
        [-0.3, 6.4, 0.9], [0.8, 5.9, 0.2],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.4, 6, 5]} />
          <meshToonMaterial color={COLORS.nieve} gradientMap={celGradient} flatShading />
        </mesh>
      ))}

      {/* Cráter incandescente — sigue activo, sigue llamando */}
      <mesh ref={craterRef} position={[0, 8.15, 0]} castShadow>
        <sphereGeometry args={[0.35, 8, 6]} />
        <meshToonMaterial
          color="#ff6b35"
          emissive="#ff3300"
          emissiveIntensity={0.7}
          gradientMap={celGradient}
        />
      </mesh>

      <mesh position={[0, 8.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.55, 12]} />
        <meshToonMaterial color="#3d2f28" gradientMap={celGradient} side={THREE.DoubleSide} />
      </mesh>

      {/* Humo */}
      <mesh ref={smokeRef} position={[0, 8.6, 0]}>
        <sphereGeometry args={[0.5, 8, 6]} />
        <meshBasicMaterial color="#c9c9c9" transparent opacity={0.3} />
      </mesh>

      {/* Velo de neblina — aún no conquistada, envuelta en misterio */}
      <mesh ref={hazeRef} position={[0, 4.2, 0]}>
        <sphereGeometry args={[4.6, 12, 10]} />
        <meshBasicMaterial color="#c7d2dc" transparent opacity={0.22} depthWrite={false} />
      </mesh>

      {/* Marcador de objetivo — waypoint flotante */}
      <group ref={metaRef} position={[0, 9.4, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.32, 0.045, 8, 20]} />
          <meshBasicMaterial color={PALETTE.metaPendiente} transparent opacity={0.85} />
        </mesh>
      </group>
      <mesh position={[0, 8.75, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.2, 6]} />
        <meshBasicMaterial color={PALETTE.metaPendiente} transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

// ─── Banderín de cumbre — marca las montañas ya visitadas ──────
function BanderaCumbre({ position = [0, 0, 0] }) {
  const panoRef = useRef()
  useFrame((state) => {
    if (!panoRef.current) return
    panoRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2.2) * 0.18
  })
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.7, 6]} />
        <meshToonMaterial color="#8a7256" gradientMap={celGradient} />
      </mesh>
      <mesh ref={panoRef} position={[0.12, 0.62, 0]}>
        <planeGeometry args={[0.24, 0.16]} />
        <meshToonMaterial color={PALETTE.visitado} gradientMap={celGradient} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// ─── Iztaccíhuatl, "la mujer dormida" — ya visitada ─────────────
function Iztaccihuatl({ position = [0, 0, 0] }) {
  const perfil = (t) => {
    if (t < 0.2) return 1.05
    if (t < 0.5) return 1.0 - (t - 0.2) * 0.8
    if (t < 0.75) return 0.76 - (t - 0.5) * 0.6
    return 0.6 - (t - 0.75) * 1.4
  }

  return (
    <group position={position}>
      <Montaña
        position={[0, 0.25, 0]}
        altura={6.8}
        radio={3.4}
        color="#8f7a63"
        nieve
        nieveAltura={0.34}
        segments={10}
        perfil={perfil}
      />

      {/* Nieve en franjas */}
      {[
        [-0.8, 5.6, 0.4], [0.9, 5.4, -0.5], [0, 5.9, 0.8],
        [-0.4, 5.7, -0.7], [0.5, 5.3, 0.6],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <sphereGeometry args={[0.35, 6, 5]} />
          <meshToonMaterial color={COLORS.nieve} gradientMap={celGradient} flatShading />
        </mesh>
      ))}

      {/* Cumbre secundaria ("senos de la mujer dormida") */}
      <mesh position={[-0.9, 6.2, 0]} castShadow>
        <coneGeometry args={[0.7, 1.2, 7]} />
        <meshToonMaterial color="#8f7a63" gradientMap={celGradient} flatShading />
      </mesh>
      <mesh position={[-0.9, 6.9, 0]} castShadow>
        <coneGeometry args={[0.35, 0.5, 7]} />
        <meshToonMaterial color={COLORS.nieve} gradientMap={celGradient} flatShading />
      </mesh>

      <BanderaCumbre position={[0, 7.0, 0.15]} />
    </group>
  )
}

// ─── Nube baja tipo niebla ──────────────────────────────────────
function CloudBank({ position = [0, 0, 0], radio = 3, count = 6 }) {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.2) * 0.5
    }
  })
  return (
    <group ref={ref} position={position}>
      {Array.from({ length: count }).map((_, i) => {
        const a = (i / count) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[
              Math.cos(a) * radio,
              Math.random() * 0.4,
              Math.sin(a) * radio,
            ]}
          >
            <sphereGeometry args={[0.8 + Math.random() * 0.5, 8, 6]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.15} />
          </mesh>
        )
      })}
    </group>
  )
}

// ─── Etiqueta 3D flotante ────────────────────────────────────────
function MountainLabel({ position, text, subtext = '', color = '#ffffff' }) {
  return (
    <Billboard position={position} follow lockX={false} lockY={false} lockZ={false}>
      <Text
        fontSize={0.45}
        color={color}
        outlineWidth={0.02}
        outlineColor="#000000"
        anchorX="center"
        anchorY="middle"
      >
        {text}
      </Text>
      {subtext && (
        <Text
          position={[0, -0.5, 0]}
          fontSize={0.22}
          color="#b0c4de"
          outlineWidth={0.015}
          outlineColor="#000000"
          anchorX="center"
          anchorY="middle"
        >
          {subtext}
        </Text>
      )}
    </Billboard>
  )
}

// ─── Árbol (oyamel / pino) — ahora con balanceo suave ───────────
function Arbol({ position = [0, 0, 0], escala = 1 }) {
  const ref = useRef()
  const fase = useMemo(() => Math.random() * Math.PI * 2, [])
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.z = Math.sin(t * 0.8 + fase) * 0.03
    ref.current.rotation.x = Math.sin(t * 0.6 + fase) * 0.025
  })
  return (
    <group ref={ref} position={position} scale={escala}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.15, 0.8, 5]} />
        <meshToonMaterial color="#5a3a1a" gradientMap={celGradient} />
      </mesh>
      <mesh position={[0, 1.05, 0]} castShadow>
        <coneGeometry args={[0.5, 1.0, 6]} />
        <meshToonMaterial color="#2d8f42" gradientMap={celGradient} flatShading />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <coneGeometry args={[0.35, 0.7, 6]} />
        <meshToonMaterial color="#3fae5a" gradientMap={celGradient} flatShading />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────
// CAMPAMENTO — el ritual de las decenas de subidas a Tláloc
// ─────────────────────────────────────────────────────────────
function Tienda({ position = [0, 0, 0], rotationY = 0 }) {
  const flapRef = useRef()
  useFrame((state) => {
    if (!flapRef.current) return
    flapRef.current.rotation.x = -0.3 + Math.sin(state.clock.elapsedTime * 1.4) * 0.06
  })
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.42, 0]}>
        <coneGeometry args={[0.62, 0.85, 4]} />
        <meshToonMaterial color={PALETTE.tienda} gradientMap={celGradient} />
      </mesh>
      <mesh ref={flapRef} position={[0, 0.22, 0.42]} rotation={[-0.3, 0, 0]}>
        <planeGeometry args={[0.32, 0.4]} />
        <meshToonMaterial color={PALETTE.tiendaSombra} gradientMap={celGradient} side={THREE.DoubleSide} />
      </mesh>
      {[[-0.42, 0, 0.3], [0.42, 0, 0.3]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]} rotation={[0, 0, Math.PI / 5]}>
          <cylinderGeometry args={[0.012, 0.012, 0.22, 4]} />
          <meshToonMaterial color="#6b7280" gradientMap={celGradient} />
        </mesh>
      ))}
    </group>
  )
}

function Fogata({ position = [0, 0, 0] }) {
  const flameRef = useRef()
  const coreRef = useRef()
  const emberRefs = useRef([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (flameRef.current) {
      flameRef.current.scale.y = 1 + Math.sin(t * 9) * 0.12 + Math.sin(t * 5.3) * 0.06
      flameRef.current.rotation.y = t * 1.2
    }
    if (coreRef.current) {
      coreRef.current.material.opacity = 0.7 + Math.sin(t * 10) * 0.2
    }
    emberRefs.current.forEach((e, i) => {
      if (!e) return
      const prog = (t * 0.4 + i / emberRefs.current.length) % 1
      e.position.y = 0.3 + prog * 1.1
      e.position.x = Math.sin(t * 2 + i) * 0.08
      e.material.opacity = 1 - prog
    })
  })

  return (
    <group position={position}>
      <mesh rotation={[0, 0.6, Math.PI / 2.5]} position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.6, 6]} />
        <meshToonMaterial color="#5a3a22" gradientMap={celGradient} />
      </mesh>
      <mesh rotation={[0, -0.6, Math.PI / 2.5]} position={[0, 0.08, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 0.6, 6]} />
        <meshToonMaterial color="#4a2f1a" gradientMap={celGradient} />
      </mesh>

      <mesh ref={flameRef} position={[0, 0.34, 0]}>
        <coneGeometry args={[0.16, 0.5, 6]} />
        <meshBasicMaterial color={PALETTE.fogata} />
      </mesh>
      <mesh ref={coreRef} position={[0, 0.26, 0]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshBasicMaterial color={PALETTE.fogataNucleo} transparent opacity={0.85} />
      </mesh>

      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} ref={(el) => { emberRefs.current[i] = el }} position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.02, 4, 4]} />
          <meshBasicMaterial color={PALETTE.ascuas} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Mochila({ position = [0, 0, 0], rotationY = 0 }) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[0.34, 0.44, 0.22]} />
        <meshToonMaterial color={PALETTE.mochila} gradientMap={celGradient} />
      </mesh>
      <mesh castShadow position={[0, 0.4, 0.12]}>
        <boxGeometry args={[0.28, 0.14, 0.1]} />
        <meshToonMaterial color={PALETTE.mochilaSolapa} gradientMap={celGradient} />
      </mesh>
    </group>
  )
}

function Linterna({ position = [0, 0, 0] }) {
  const glowRef = useRef()
  useFrame((state) => {
    if (!glowRef.current) return
    const t = state.clock.elapsedTime
    glowRef.current.material.opacity = 0.65 + Math.sin(t * 6) * 0.15 + Math.sin(t * 13) * 0.05
  })
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.7, 6]} />
        <meshToonMaterial color="#3f3a33" gradientMap={celGradient} />
      </mesh>
      <mesh ref={glowRef} position={[0, 0.72, 0]}>
        <boxGeometry args={[0.12, 0.16, 0.12]} />
        <meshBasicMaterial color={PALETTE.linterna} transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

function Campamento({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <Tienda position={[-0.9, 0, 0.3]} rotationY={0.5} />
      <Fogata position={[0.4, 0, -0.2]} />
      <Mochila position={[-0.5, 0, -0.9]} rotationY={-0.4} />
      <Linterna position={[0.9, 0, -0.7]} />
    </group>
  )
}

// ─── Senda de huellas — el rastro de tantas subidas repetidas ──
function SendaHuellas({ from, to, pares = 5 }) {
  const dx = to[0] - from[0]
  const dz = to[2] - from[2]
  const largo = Math.hypot(dx, dz) || 1
  const glowRef = useRef()

  useFrame((state) => {
    if (!glowRef.current) return
    const t = state.clock.elapsedTime
    const prog = (t * 0.12) % 1
    glowRef.current.position.set(from[0] + dx * prog, 0.29, from[2] + dz * prog)
    glowRef.current.material.opacity = 0.5 + Math.sin(prog * Math.PI) * 0.4
  })

  const huellas = useMemo(() => {
    const perpX = -dz / largo
    const perpZ = dx / largo
    const angle = Math.atan2(dx, dz)
    const arr = []
    for (let i = 0; i < pares; i++) {
      const p = (i + 0.5) / pares
      const side = i % 2 === 0 ? 1 : -1
      arr.push([
        from[0] + dx * p + perpX * 0.09 * side,
        from[2] + dz * p + perpZ * 0.09 * side,
        angle,
      ])
    }
    return arr
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from[0], from[2], to[0], to[2], pares])

  return (
    <group>
      {huellas.map(([x, z, angle], i) => (
        <mesh key={i} position={[x, 0.28, z]} rotation={[-Math.PI / 2, 0, angle]}>
          <circleGeometry args={[0.06, 8]} />
          <meshToonMaterial color={PALETTE.huella} gradientMap={celGradient} transparent opacity={0.55} />
        </mesh>
      ))}
      <mesh ref={glowRef} position={from}>
        <sphereGeometry args={[0.05, 6, 6]} />
        <meshBasicMaterial color={PALETTE.visitado} transparent opacity={0.6} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────
// RINCÓN TROTAMUNDOS — la pasión por conocer el mundo
// ─────────────────────────────────────────────────────────────
function Globo({ position = [0, 0, 0] }) {
  const spinRef = useRef()
  const bobRef = useRef()

  const continentes = useMemo(() => ([
    [0.38, 0.32, 0.38, 0.15],
    [-0.45, 0.15, 0.28, 0.13],
    [0.1, -0.4, -0.38, 0.14],
    [-0.3, -0.25, 0.4, 0.11],
    [0.45, -0.1, -0.32, 0.12],
  ]), [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (spinRef.current) spinRef.current.rotation.y = t * 0.5
    if (bobRef.current) bobRef.current.position.y = position[1] + Math.sin(t * 1.3) * 0.06
  })

  return (
    <group ref={bobRef} position={position}>
      <group ref={spinRef}>
        <mesh castShadow>
          <sphereGeometry args={[0.55, 16, 12]} />
          <meshToonMaterial color={PALETTE.globoMar} gradientMap={celGradient} />
        </mesh>
        {continentes.map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]}>
            <sphereGeometry args={[r, 6, 6]} />
            <meshToonMaterial color={PALETTE.globoTierra} gradientMap={celGradient} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, -0.68, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.16, 0.3, 8]} />
        <meshToonMaterial color={PALETTE.maleta} gradientMap={celGradient} />
      </mesh>
    </group>
  )
}

function Brujula({ position = [0, 0, 0] }) {
  const needleRef = useRef()
  useFrame((state) => {
    if (!needleRef.current) return
    const t = state.clock.elapsedTime
    // La aguja siempre busca el norte, nunca termina de asentarse —
    // igual que las ganas de seguir explorando.
    needleRef.current.rotation.y = Math.sin(t * 0.7) * 0.5 + Math.sin(t * 2.3) * 0.08
  })
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.26, 0.28, 0.1, 12]} />
        <meshToonMaterial color={PALETTE.brujulaCuerpo} gradientMap={celGradient} />
      </mesh>
      <group ref={needleRef} position={[0, 0.14, 0]}>
        <mesh position={[0, 0, 0.09]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.045, 0.2, 4]} />
          <meshToonMaterial color={PALETTE.brujulaNorte} gradientMap={celGradient} />
        </mesh>
        <mesh position={[0, 0, -0.09]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.045, 0.2, 4]} />
          <meshToonMaterial color={PALETTE.brujulaSur} gradientMap={celGradient} />
        </mesh>
      </group>
    </group>
  )
}

function Maleta({ position = [0, 0, 0], rotationY = 0 }) {
  const stickers = useMemo(() => ([
    [-0.14, 0.28, PALETTE.sticker1],
    [0.05, 0.16, PALETTE.sticker2],
    [0.16, 0.3, PALETTE.sticker3],
  ]), [])
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <mesh castShadow position={[0, 0.22, 0]}>
        <boxGeometry args={[0.5, 0.36, 0.16]} />
        <meshToonMaterial color={PALETTE.maleta} gradientMap={celGradient} />
      </mesh>
      <mesh castShadow position={[0, 0.44, 0]}>
        <boxGeometry args={[0.16, 0.08, 0.05]} />
        <meshToonMaterial color={PALETTE.maletaDetalle} gradientMap={celGradient} />
      </mesh>
      {stickers.map(([x, y, c], i) => (
        <mesh key={i} position={[x, y, 0.085]}>
          <circleGeometry args={[0.045, 8]} />
          <meshBasicMaterial color={c} />
        </mesh>
      ))}
    </group>
  )
}

function AvionPapel({ center = [0, 0, 0], radio = 1.4, altura = 1.8, speed = 0.25 }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime * speed
    const x = center[0] + Math.cos(t) * radio
    const z = center[2] + Math.sin(t) * radio
    const y = altura + Math.sin(t * 2) * 0.2
    ref.current.position.set(x, y, z)
    ref.current.rotation.y = -t + Math.PI / 2
    ref.current.rotation.z = Math.sin(t * 2) * 0.3
  })
  return (
    <group ref={ref}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.07, 0.32, 3]} />
        <meshToonMaterial color={PALETTE.avion} gradientMap={celGradient} flatShading />
      </mesh>
    </group>
  )
}

function RinconTrotamundos({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      <Globo position={[0, 1.1, 0]} />
      <Brujula position={[0.9, 0, 0.5]} />
      <Maleta position={[-0.85, 0, 0.55]} rotationY={0.6} />
      <AvionPapel radio={1.6} altura={2.6} />
      <Billboard position={[0, 2.6, 0]}>
        <Text fontSize={0.28} color="#93c5fd" anchorX="center" anchorY="middle" outlineWidth={0.015} outlineColor="#031420">
          EXPLORAR EL MUNDO
        </Text>
      </Billboard>
    </group>
  )
}

// ─── Letrero de Texcoco — el punto de partida de cada subida ───
function LetreroTexcoco({ position = [0, 0, 0] }) {
  const placas = useMemo(() => ([
    { y: 1.05, texto: 'TEXCOCO', rot: 0.15, color: '#fbbf24' },
    { y: 0.85, texto: 'MONTE TLÁLOC', rot: -0.2, color: '#86efac' },
    { y: 0.65, texto: 'IZTA · POPO', rot: 0.25, color: '#93c5fd' },
  ]), [])

  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 1.2, 6]} />
        <meshToonMaterial color={PALETTE.letreroPoste} gradientMap={celGradient} />
      </mesh>
      {placas.map((s, i) => (
        <group key={i} position={[0, s.y, 0]} rotation={[0, s.rot, 0]}>
          <mesh position={[0.28, 0, 0]} castShadow>
            <boxGeometry args={[0.5, 0.14, 0.03]} />
            <meshToonMaterial color={PALETTE.letreroPlaca} gradientMap={celGradient} />
          </mesh>
          <Billboard position={[0.28, 0, 0.05]}>
            <Text fontSize={0.09} color={s.color} anchorX="center" anchorY="middle">
              {s.texto}
            </Text>
          </Billboard>
        </group>
      ))}
    </group>
  )
}

// ─────────────────────────────────────────────────────────────
// ISLA PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function IslaMontana() {
  const pasto = useMemo(() => {
    const geo = new THREE.BoxGeometry(20, 0.5, 20)
    const mat = new THREE.MeshToonMaterial({
      color: '#5a9450',
      gradientMap: celGradient,
    })
    const m = new THREE.Mesh(geo, mat)
    m.receiveShadow = true
    return m
  }, [])

  return (
    <group>
      <primitive object={pasto} />

      {/* ─── Monte Tláloc — decenas de visitas, el campamento habitual ─── */}
      <group position={[-6.5, 0.25, -2]}>
        <MonteTlaloc />
        <Campamento position={[-2.6, 0, 1.6]} />
        <SendaHuellas from={[-2.6, 0, 1.6]} to={[0, 0, 0]} pares={5} />
        <MountainLabel
          position={[0, 6, 0]}
          text="Monte Tláloc"
          subtext="4,120 m · decenas de visitas"
          color="#bff0b0"
        />
      </group>

      {/* ─── Popocatépetl — la meta que sigue pendiente ─── */}
      <group position={[-1.5, 0.25, -6]}>
        <Popocatepetl />
        <MountainLabel
          position={[0, 9.8, 0]}
          text="Popocatépetl"
          subtext="5,426 m · próxima meta"
          color="#c7d2dc"
        />
      </group>

      {/* ─── Iztaccíhuatl — ya visitada ─── */}
      <group position={[4, 0.25, -4]}>
        <Iztaccihuatl />
        <MountainLabel
          position={[0, 8.4, 0]}
          text="Iztaccíhuatl"
          subtext="5,230 m · visitada"
          color="#a9c9ff"
        />
      </group>

      {/* ─── Nubes bajas al pie ─── */}
      <CloudBank position={[-1, 1.2, -4]} radio={5} count={8} />
      <CloudBank position={[5, 1.0, -3]} radio={4} count={6} />

      {/* ─── Bosque alrededor ─── */}
      {[
        [-9, 0.5, 6, 1.1], [-8, 0.5, 7, 0.9], [-7, 0.5, 6, 1.0],
        [7, 0.5, 5, 1.0], [8, 0.5, 6, 1.1], [9, 0.5, 7, 0.9],
        [-5, 0.5, 7, 1.2], [5, 0.5, 7, 1.1],
        [-9, 0.5, 2, 0.9], [9, 0.5, 2, 1.0],
      ].map(([x, y, z, s], i) => (
        <Arbol key={i} position={[x, y, z]} escala={s} />
      ))}

      {/* ─── Rincón trotamundos — la pasión por viajar ─── */}
      <RinconTrotamundos position={[7.2, 0, 0.6]} />

      {/* ─── Letrero de Texcoco — de donde sale cada expedición ─── */}
      <LetreroTexcoco position={[0, 0, 8.6]} />

      {/* ─── Lago al pie, con brillo ─── */}
      <mesh position={[0, 0.27, 4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial
          color={COLORS.aguaClara}
          roughness={0.12}
          metalness={0.6}
          transparent
          opacity={0.85}
        />
      </mesh>

      <mesh position={[0, 0.28, 4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 2]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.12} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────
// NOTAS PARA collisions.js (isla "montana")
//
// No se movió NINGUNA posición/radio de las montañas ni de los
// árboles: siguen siendo exactamente las mismas que ya tienes
// registradas hoy en obstaclesByIsland.montana, así que ese
// bloque NO necesita cambios.
//
// Lo nuevo (campamento, altar, rincón trotamundos, letrero) son
// props decorativos de bajo perfil que dejé caminables a propósito
// — no rompen el paso del avatar. Si prefieres que bloqueen el
// paso, estas son las posiciones/radios sugeridos (opcional):
//
// ALTAR (Tláloc, cima)        circle  x:-6.5  z:-2    r:0.4
// CAMPAMENTO (Tláloc, base)   circle  x:-9.1  z:-0.4  r:0.9
// RINCÓN TROTAMUNDOS          circle  x:7.2   z:0.6   r:1.1
// LETRERO TEXCOCO             circle  x:0     z:8.6   r:0.3
// ─────────────────────────────────────────────────────────────