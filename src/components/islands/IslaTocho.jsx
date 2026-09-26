import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import PixelMesh from '../../core/engine/PixelMesh'
import { PIXEL_PALETTE as P } from '../../core/engine/constants'

// ─── Paleta ────────────────────────────────────────────────
const C = {
  pasto: '#2d6a3f',
  pastoClaro: '#3a8a52',
  pastoOscuro: '#1f4a2c',
  linea: '#ffffff',
  endzoneAzul: '#0c2340',
  endzoneRoja: '#c8102e',
  poste: '#f4d03f',
  posteGris: '#888888',
  balon: '#8b4513',
  meeseeksAzul: '#4fc3f7',
  meeseeksAzulSombra: '#0277bd',
  meeseeksRojo: '#ef4444',
  meeseeksRojoSombra: '#991b1b',
  meeseeksBoca: '#c2185b',
  burbujaBg: '#ffffff',
  burbujaBorde: '#000000',
  burbujaTexto: '#000000',
  jumbotron: '#0c2340',
  base: '#1a1a1a',
  baseGris: '#0f0f0f',
}

// ─── Cancha ─────────────────────────────────────────────────
function Cancha() {
  const yardas = useMemo(() => {
    const g = new THREE.Group()
    for (let i = -10; i <= 10; i++) {
      const x = i * 0.9
      const lineaGeo = new THREE.PlaneGeometry(0.07, 11)
      const lineaMat = new THREE.MeshBasicMaterial({ color: C.linea })
      const linea = new THREE.Mesh(lineaGeo, lineaMat)
      linea.rotation.x = -Math.PI / 2
      linea.position.set(x, 0.02, 0)
      g.add(linea)
    }
    return g
  }, [])

  const numeros = [
    { n: '1 0', x: -8.1 }, { n: '2 0', x: -6.3 }, { n: '3 0', x: -4.5 },
    { n: '4 0', x: -2.7 }, { n: '5 0', x: -0.9 },
    { n: '4 0', x: 0.9 }, { n: '3 0', x: 2.7 },
    { n: '2 0', x: 4.5 }, { n: '1 0', x: 6.3 },
  ]

  return (
    <group position={[0, 0.27, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial color={C.pasto} roughness={0.95} metalness={0.0} flatShading />
      </mesh>

      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={i}
          position={[-9.5 + i * 1, 0.005, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.5, 12]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? C.pasto : C.pastoClaro}
            roughness={0.95}
            metalness={0.0}
            flatShading
          />
        </mesh>
      ))}

      <primitive object={yardas} />

      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.12, 11]} />
        <meshBasicMaterial color={C.linea} />
      </mesh>

      {Array.from({ length: 66 }).map((_, i) => {
        const x = -9.9 + i * 0.3
        return (
          <group key={i}>
            <mesh position={[x, 0.015, -3]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.05, 0.3]} />
              <meshBasicMaterial color={C.linea} />
            </mesh>
            <mesh position={[x, 0.015, 3]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.05, 0.3]} />
              <meshBasicMaterial color={C.linea} />
            </mesh>
          </group>
        )
      })}

      {numeros.map((y, i) => (
        <Text
          key={i}
          position={[y.x, 0.02, 4]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.6}
          color={C.linea}
          anchorX="center"
          anchorY="middle"
        >
          {y.n}
        </Text>
      ))}
      {numeros.map((y, i) => (
        <Text
          key={`b-${i}`}
          position={[y.x, 0.02, -4]}
          rotation={[-Math.PI / 2, 0, Math.PI]}
          fontSize={0.6}
          color={C.linea}
          anchorX="center"
          anchorY="middle"
        >
          {y.n}
        </Text>
      ))}

      {/* Endzone izquierdo */}
      <mesh position={[-11.5, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 12]} />
        <meshStandardMaterial color={C.endzoneAzul} roughness={0.9} flatShading />
      </mesh>
      <Text
        position={[-11.5, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, Math.PI / 2]}
        fontSize={1.1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.1}
      >
        PATRIOTS
      </Text>

      {/* Endzone derecho */}
      <mesh position={[11.5, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.5, 12]} />
        <meshStandardMaterial color={C.endzoneRoja} roughness={0.9} flatShading />
      </mesh>
      <Text
        position={[11.5, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        fontSize={1.1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.1}
      >
        FABIAN 83
      </Text>
    </group>
  )
}

// ─── Poste de gol tipo H ───────────────────────────────────
function PosteGol({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const uprightHeight = 3
  const crossbarY = 3
  const uprightOffset = 1.75

  return (
    <group position={position} rotation={rotation}>
      <PixelMesh position={[0, crossbarY / 2, 0]} castShadow outlineWidth={0.06}>
        <cylinderGeometry args={[0.1, 0.1, crossbarY, 8]} />
        <meshStandardMaterial color={C.posteGris} roughness={0.6} metalness={0.35} flatShading />
      </PixelMesh>

      <PixelMesh position={[0, crossbarY, 0]} rotation={[0, 0, Math.PI / 2]} castShadow outlineWidth={0.06}>
        <cylinderGeometry args={[0.08, 0.08, uprightOffset * 2, 8]} />
        <meshStandardMaterial color={C.poste} roughness={0.4} metalness={0.45} flatShading />
      </PixelMesh>

      <PixelMesh position={[-uprightOffset, crossbarY + uprightHeight / 2, 0]} castShadow outlineWidth={0.06}>
        <cylinderGeometry args={[0.08, 0.08, uprightHeight, 8]} />
        <meshStandardMaterial color={C.poste} roughness={0.4} metalness={0.45} flatShading />
      </PixelMesh>

      <PixelMesh position={[uprightOffset, crossbarY + uprightHeight / 2, 0]} castShadow outlineWidth={0.06}>
        <cylinderGeometry args={[0.08, 0.08, uprightHeight, 8]} />
        <meshStandardMaterial color={C.poste} roughness={0.4} metalness={0.45} flatShading />
      </PixelMesh>

      <mesh position={[-uprightOffset, crossbarY + uprightHeight, 0]}>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[uprightOffset, crossbarY + uprightHeight, 0]}>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

// ─── Balón ovoide ───────────────────────────────────────────
function Balon({ position = [0, 0, 0] }) {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.008
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.15
    }
  })

  return (
    <group ref={ref} position={position}>
      <PixelMesh scale={[0.5, 0.33, 0.5]} castShadow outlineWidth={0.06}>
        <sphereGeometry args={[1, 20, 14]} />
        <meshStandardMaterial color={C.balon} roughness={0.5} metalness={0.05} flatShading />
      </PixelMesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.1, 0]}>
        <torusGeometry args={[0.38, 0.018, 6, 20]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.46, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.11, 0.013, 6, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.46, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.11, 0.013, 6, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0, 0.32]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.35, 0.012, 6, 20, Math.PI * 1.2]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

// ─── Jumbotron ──────────────────────────────────────────────
function Jumbotron({ position = [0, 0, 0] }) {
  const ref = useRef()
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y += 0.002
  })

  return (
    <group ref={ref} position={position}>
      <PixelMesh castShadow outlineWidth={0.03}>
        <boxGeometry args={[4, 2.4, 4]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.5} metalness={0.3} flatShading />
      </PixelMesh>

      {[
        { pos: [0, 0, 2.01], rot: [0, 0, 0] },
        { pos: [0, 0, -2.01], rot: [0, Math.PI, 0] },
        { pos: [2.01, 0, 0], rot: [0, Math.PI / 2, 0] },
        { pos: [-2.01, 0, 0], rot: [0, -Math.PI / 2, 0] },
      ].map((s, i) => (
        <group key={i} position={s.pos} rotation={s.rot}>
          <mesh>
            <planeGeometry args={[3.6, 2]} />
            <meshBasicMaterial color={C.jumbotron} />
          </mesh>
          <Text
            position={[0, 0.4, 0.01]}
            fontSize={0.55}
            color="#ff6b35"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.04}
            outlineWidth={0.01}
            outlineColor="#ff6b35"
          >
            ToroTech
          </Text>
          <Text
            position={[0, -0.3, 0.01]}
            fontSize={0.4}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.06}
            outlineWidth={0.008}
            outlineColor="#ffffff"
          >
            FABIAN 83
          </Text>
        </group>
      ))}

      <PixelMesh position={[0, -2, 0]} outlineWidth={0.06}>
        <cylinderGeometry args={[0.12, 0.12, 1.8, 8]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.4} flatShading />
      </PixelMesh>
    </group>
  )
}

function SpeechBubble({ mensaje }) {
  return (
    <group>
      {/* Borde negro exterior */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[3.6, 1.3]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* Fondo blanco puro interior */}
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[3.35, 1.05]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Colita inferior-izquierda (borde) */}
      <mesh position={[-1.05, -0.8, -0.02]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[0.42, 0.42]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* Colita inferior-izquierda (relleno) */}
      <mesh position={[-1.03, -0.75, -0.01]} rotation={[0, 0, Math.PI / 4]}>
        <planeGeometry args={[0.35, 0.35]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Texto — más grande, contraste negro puro, spacing amigable */}
      <Text
        position={[0, 0.02, 0.01]}
        fontSize={0.34}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        maxWidth={3.1}
        textAlign="center"
        lineHeight={1.25}
        letterSpacing={0.03}
      >
        {mensaje}
      </Text>
    </group>
  )
}

// ─── Label que sigue al Meeseeks ───────────────────────────
function FollowLabel({ targetRef, mensaje }) {
  const labelRef = useRef()

  useFrame(() => {
    if (labelRef.current && targetRef.current) {
      const p = targetRef.current.position
      labelRef.current.position.set(p.x, p.y + 2.9, p.z)
    }
  })

  return (
    <Billboard ref={labelRef}>
      <SpeechBubble mensaje={mensaje} />
    </Billboard>
  )
}

// ─── Meeseeks con animación + PixelMesh ────────────────────
function Meeseeks({
  bounds = { minX: -9, maxX: 9, minZ: -4.5, maxZ: 4.5 },
  mensaje = 'Existence is pain',
  color = C.meeseeksAzul,
  sombra = C.meeseeksAzulSombra,
  speed = 0.75,
  startPos = [0, 0.5, 0],
}) {
  const ref = useRef()
  const legLRef = useRef()
  const legRRef = useRef()
  const armLRef = useRef()
  const armRRef = useRef()

  const target = useRef([startPos[0], startPos[2]])
  const pos = useRef([startPos[0], startPos[2]])
  const angleRef = useRef(0)
  const walkRef = useRef(0)
  const nextChange = useRef(0)
  const idleUntil = useRef(0)

  const pickNewTarget = () => {
    target.current = [
      bounds.minX + Math.random() * (bounds.maxX - bounds.minX),
      bounds.minZ + Math.random() * (bounds.maxZ - bounds.minZ),
    ]
  }

  useFrame((state, delta) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime

    if (t > nextChange.current) {
      pickNewTarget()
      nextChange.current = t + 3 + Math.random() * 3
      idleUntil.current = t + (Math.random() < 0.3 ? 1 + Math.random() * 1.5 : 0)
    }

    const isIdle = t < idleUntil.current
    const dx = target.current[0] - pos.current[0]
    const dz = target.current[1] - pos.current[1]
    const dist = Math.hypot(dx, dz)

    let moving = false

    if (!isIdle && dist > 0.05) {
      const vx = (dx / dist) * speed * delta
      const vz = (dz / dist) * speed * delta
      pos.current[0] += vx
      pos.current[1] += vz
      moving = true

      const targetAngle = Math.atan2(dx, dz)
      let diff = targetAngle - angleRef.current
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      angleRef.current += diff * Math.min(1, delta * 6)
    }

    if (moving) {
      walkRef.current += delta * 10
    } else {
      walkRef.current += delta * 3
    }

    const swing = moving ? Math.sin(walkRef.current) * 0.5 : 0
    const bob = moving
      ? Math.abs(Math.sin(walkRef.current)) * 0.1
      : Math.sin(t * 1.5) * 0.02 + 0.02

    if (legLRef.current) legLRef.current.rotation.x = swing * 0.6
    if (legRRef.current) legRRef.current.rotation.x = -swing * 0.6
    if (armLRef.current) armLRef.current.rotation.x = -swing * 0.3
    if (armRRef.current) armRRef.current.rotation.x = swing * 0.3

    ref.current.position.set(pos.current[0], startPos[1] + bob, pos.current[1])
    ref.current.rotation.y = angleRef.current

    if (ref.current.children[0]) {
      ref.current.children[0].rotation.z = moving ? Math.sin(walkRef.current * 2) * 0.02 : 0
    }
  })

  const OUT = 0.07 // grosor contorno Meeseeks (piezas chicas)

  return (
    <group position={[0, 0, 0]}>
      <group ref={ref} position={startPos}>
        {/* Cabeza */}
        <PixelMesh position={[0, 1.4, 0]} castShadow outlineWidth={OUT}>
          <boxGeometry args={[0.7, 0.7, 0.5]} />
          <meshStandardMaterial color={color} roughness={0.6} metalness={0.05} flatShading />
        </PixelMesh>
        <PixelMesh position={[0, 1.75, 0]} outlineWidth={OUT}>
          <boxGeometry args={[0.5, 0.15, 0.52]} />
          <meshStandardMaterial color={sombra} roughness={0.6} flatShading />
        </PixelMesh>

        {/* Ojos */}
        <mesh position={[-0.13, 1.5, 0.26]}>
          <boxGeometry args={[0.1, 0.14, 0.02]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.13, 1.5, 0.26]}>
          <boxGeometry args={[0.1, 0.14, 0.02]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.13, 1.49, 0.28]}>
          <boxGeometry args={[0.06, 0.08, 0.01]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
        <mesh position={[0.13, 1.49, 0.28]}>
          <boxGeometry args={[0.06, 0.08, 0.01]} />
          <meshBasicMaterial color="#000000" />
        </mesh>

        {/* Boca */}
        <mesh position={[0, 1.25, 0.26]}>
          <boxGeometry args={[0.5, 0.2, 0.02]} />
          <meshBasicMaterial color={C.meeseeksBoca} />
        </mesh>
        <mesh position={[-0.15, 1.33, 0.28]}>
          <boxGeometry args={[0.08, 0.06, 0.01]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.15, 1.33, 0.28]}>
          <boxGeometry args={[0.08, 0.06, 0.01]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Cuello */}
        <PixelMesh position={[0, 1.05, 0]} outlineWidth={OUT}>
          <boxGeometry args={[0.15, 0.1, 0.15]} />
          <meshStandardMaterial color={sombra} roughness={0.6} flatShading />
        </PixelMesh>

        {/* Torso */}
        <PixelMesh position={[0, 0.65, 0]} castShadow outlineWidth={OUT}>
          <boxGeometry args={[0.35, 0.8, 0.25]} />
          <meshStandardMaterial color={color} roughness={0.6} metalness={0.05} flatShading />
        </PixelMesh>

        {/* Brazo izquierdo */}
        <group ref={armLRef} position={[-0.22, 0.9, 0]}>
          <PixelMesh position={[-0.18, -0.15, 0]} rotation={[0, 0, -0.5]} castShadow outlineWidth={OUT}>
            <boxGeometry args={[0.4, 0.15, 0.15]} />
            <meshStandardMaterial color={color} roughness={0.6} flatShading />
          </PixelMesh>
          <PixelMesh position={[-0.02, -0.45, 0]} outlineWidth={OUT}>
            <boxGeometry args={[0.15, 0.15, 0.15]} />
            <meshStandardMaterial color={sombra} roughness={0.6} flatShading />
          </PixelMesh>
        </group>

        {/* Brazo derecho */}
        <group ref={armRRef} position={[0.22, 0.9, 0]}>
          <PixelMesh position={[0.18, -0.15, 0]} rotation={[0, 0, 0.5]} castShadow outlineWidth={OUT}>
            <boxGeometry args={[0.4, 0.15, 0.15]} />
            <meshStandardMaterial color={color} roughness={0.6} flatShading />
          </PixelMesh>
          <PixelMesh position={[0.02, -0.45, 0]} outlineWidth={OUT}>
            <boxGeometry args={[0.15, 0.15, 0.15]} />
            <meshStandardMaterial color={sombra} roughness={0.6} flatShading />
          </PixelMesh>
        </group>

        {/* Pierna izquierda */}
        <group ref={legLRef} position={[-0.09, 0.25, 0]}>
          <PixelMesh position={[0, -0.2, 0]} castShadow outlineWidth={OUT}>
            <boxGeometry args={[0.12, 0.8, 0.12]} />
            <meshStandardMaterial color={sombra} roughness={0.65} flatShading />
          </PixelMesh>
          <PixelMesh position={[0, -0.65, 0.06]} castShadow outlineWidth={OUT}>
            <boxGeometry args={[0.18, 0.1, 0.3]} />
            <meshStandardMaterial color={color} roughness={0.6} flatShading />
          </PixelMesh>
        </group>

        {/* Pierna derecha */}
        <group ref={legRRef} position={[0.09, 0.25, 0]}>
          <PixelMesh position={[0, -0.2, 0]} castShadow outlineWidth={OUT}>
            <boxGeometry args={[0.12, 0.8, 0.12]} />
            <meshStandardMaterial color={sombra} roughness={0.65} flatShading />
          </PixelMesh>
          <PixelMesh position={[0, -0.65, 0.06]} castShadow outlineWidth={OUT}>
            <boxGeometry args={[0.18, 0.1, 0.3]} />
            <meshStandardMaterial color={color} roughness={0.6} flatShading />
          </PixelMesh>
        </group>
      </group>

      <FollowLabel targetRef={ref} mensaje={mensaje} />
    </group>
  )
}

// ─── Isla principal ─────────────────────────────────────────
export default function IslaTocho() {
  return (
    <group>
      {/* Base */}
      <PixelMesh position={[0, 0, 0]} receiveShadow outlineWidth={0.015}>
        <boxGeometry args={[40, 0.5, 32]} />
        <meshStandardMaterial color={C.base} roughness={0.9} metalness={0.05} flatShading />
      </PixelMesh>

      <mesh position={[0, 0.26, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[38, 30]} />
        <meshStandardMaterial color={C.baseGris} roughness={0.95} flatShading />
      </mesh>

      <Cancha />
      <PosteGol position={[-13.5, 0.27, 0]} rotation={[0, Math.PI / 2, 0]} />
      <PosteGol position={[13.5, 0.27, 0]} rotation={[0, -Math.PI / 2, 0]} />
      <Balon position={[0, 1.5, 0]} />
      <Jumbotron position={[0, 9, 0]} />

      {/* ─── 6 MEESEEKS: 3 azules + 3 rojos ─── */}
      <Meeseeks
        bounds={{ minX: -9, maxX: -3, minZ: -4.5, maxZ: 4.5 }}
        mensaje="Existence is pain"
        color={C.meeseeksAzul}
        sombra={C.meeseeksAzulSombra}
        speed={0.75}
        startPos={[-6, 0.5, -2]}
      />
      <Meeseeks
        bounds={{ minX: -4, maxX: 0, minZ: -4.5, maxZ: 4.5 }}
        mensaje="Hola soy el señor Meeseeks"
        color={C.meeseeksAzul}
        sombra={C.meeseeksAzulSombra}
        speed={0.7}
        startPos={[-2, 0.5, 3]}
      />
      <Meeseeks
        bounds={{ minX: -2, maxX: 2, minZ: -4.5, maxZ: 4.5 }}
        mensaje="Mirámeee"
        color={C.meeseeksAzul}
        sombra={C.meeseeksAzulSombra}
        speed={0.8}
        startPos={[0, 0.5, -3]}
      />
      <Meeseeks
        bounds={{ minX: 0, maxX: 4, minZ: -4.5, maxZ: 4.5 }}
        mensaje="¡Arriba los Miskuissss!"
        color={C.meeseeksRojo}
        sombra={C.meeseeksRojoSombra}
        speed={0.75}
        startPos={[2, 0.5, 2]}
      />
      <Meeseeks
        bounds={{ minX: 3, maxX: 7, minZ: -4.5, maxZ: 4.5 }}
        mensaje="¡Ooh sí, señor Meeseeks!"
        color={C.meeseeksRojo}
        sombra={C.meeseeksRojoSombra}
        speed={0.7}
        startPos={[5, 0.5, -2]}
      />
      <Meeseeks
        bounds={{ minX: 6, maxX: 9, minZ: -4.5, maxZ: 4.5 }}
        mensaje="¡Cállate, Morty!"
        color={C.meeseeksRojo}
        sombra={C.meeseeksRojoSombra}
        speed={0.8}
        startPos={[8, 0.5, 2]}
      />
    </group>
  )
}