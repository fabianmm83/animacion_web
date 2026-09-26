import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import { PIXEL_PALETTE as PALETTE } from '../../core/engine/constants'
import PixelMesh from '../../core/engine/PixelMesh'

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const clamp01 = (v) => Math.max(0, Math.min(1, v))

function DataPipe({ from, to, color = PALETTE.packet, speed = 0.35, packets = 2, thickness = 0.1 }) {
  const dx = to[0] - from[0]
  const dz = to[2] - from[2]
  const dy = (to[1] ?? from[1] ?? 0.3) - (from[1] ?? 0.3)
  const length = Math.hypot(dx, dz, dy)
  const midX = (from[0] + to[0]) / 2
  const midY = ((from[1] ?? 0.3) + (to[1] ?? from[1] ?? 0.3)) / 2
  const midZ = (from[2] + to[2]) / 2
  const angleY = Math.atan2(dx, dz)

  const packetRefs = useRef([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < packetRefs.current.length; i++) {
      const p = packetRefs.current[i]
      if (!p) continue
      const prog = (t * speed + i / packets) % 1
      p.position.set(
        from[0] + dx * prog,
        (from[1] ?? 0.3) + dy * prog + 0.03,
        from[2] + dz * prog
      )
      const pulse = 0.55 + 0.45 * Math.sin(prog * Math.PI)
      p.scale.setScalar(pulse)
    }
  })

  return (
    <group>
      <mesh position={[midX, midY, midZ]} rotation={[0, angleY, 0]}>
        <boxGeometry args={[thickness, thickness, length]} />
        <meshStandardMaterial color={PALETTE.pipeBody} roughness={0.75} metalness={0.15} />
      </mesh>
      {Array.from({ length: packets }).map((_, i) => (
        <mesh key={i} ref={(el) => { packetRefs.current[i] = el }}>
          <boxGeometry args={[0.16, 0.16, 0.16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  )
}

function VerticalPipe({ position = [0, 0, 0], height = 2, color = PALETTE.iotAccent, speed = 0.6 }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const prog = (t * speed) % 1
    ref.current.position.y = position[1] + prog * height
    ref.current.scale.setScalar(0.5 + 0.5 * Math.sin(prog * Math.PI))
  })
  return (
    <group>
      <mesh position={[position[0], position[1] + height / 2, position[2]]}>
        <cylinderGeometry args={[0.035, 0.035, height, 6]} />
        <meshStandardMaterial color={PALETTE.pipeBody} roughness={0.7} metalness={0.2} />
      </mesh>
      <mesh ref={ref} position={position}>
        <sphereGeometry args={[0.08, 6, 6]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  )
}

function Led({ position, color, onColor, offColor = '#0a1f16', speed = 3, offset = 0, size = 0.08 }) {
  const ref = useRef()
  const on = onColor ?? color
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    const lit = Math.sin(t * speed + offset) > 0
    ref.current.material.color.set(lit ? on : offColor)
  })
  return (
    <mesh ref={ref} position={position}>
      <boxGeometry args={[size, size, size * 0.3]} />
      <meshBasicMaterial color={onColor ?? color} />
    </mesh>
  )
}

// ─────────────────────────────────────────────────────────────
// PCB BASE
// ─────────────────────────────────────────────────────────────
function PCB() {
  const pads = useMemo(() => ([[-11, -11], [11, -11], [-11, 11], [11, 11]]), [])

  return (
    <group>
      <PixelMesh position={[0, 0, 0]} receiveShadow outlineWidth={0.02}>
        <boxGeometry args={[24, 0.5, 24]} />
        <meshStandardMaterial color={PALETTE.verdePCB} roughness={0.88} metalness={0.05} flatShading />
      </PixelMesh>

      <gridHelper args={[24, 48, PALETTE.verdeTrace, PALETTE.verdeTrace]} position={[0, 0.27, 0]} />

      {pads.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.28, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.6, 0.6]} />
          <meshBasicMaterial color="#f4d03f" />
        </mesh>
      ))}
    </group>
  )
}

// ─────────────────────────────────────────────────────────────
// ENGINEER CORE
// ─────────────────────────────────────────────────────────────
function EngineerCore({ position = [0, 0, 0] }) {
  const ring1 = useRef()
  const ring2 = useRef()
  const ring3 = useRef()
  const coreMesh = useRef()
  const nodesRef = useRef([])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (ring1.current) ring1.current.rotation.y = t * 0.6
    if (ring2.current) ring2.current.rotation.x = t * 0.45
    if (ring3.current) ring3.current.rotation.z = t * 0.35
    if (coreMesh.current) {
      const pulse = 1 + Math.sin(t * 2.4) * 0.12
      coreMesh.current.scale.setScalar(pulse)
    }
    for (let i = 0; i < nodesRef.current.length; i++) {
      const n = nodesRef.current[i]
      if (!n) continue
      const lit = Math.sin(t * 2 + i * 1.05) > 0.1
      n.material.color.set(lit ? PALETTE.core : '#0a3a3a')
    }
  })

  return (
    <group position={position}>
      <PixelMesh position={[0, 0.35, 0]} receiveShadow castShadow outlineWidth={0.025}>
        <cylinderGeometry args={[1.9, 2.1, 0.5, 6]} />
        <meshStandardMaterial color={PALETTE.coreBase} roughness={0.6} metalness={0.3} flatShading />
      </PixelMesh>

      <PixelMesh position={[0, 0.85, 0]} castShadow outlineWidth={0.025}>
        <cylinderGeometry args={[1.4, 1.6, 0.4, 6]} />
        <meshStandardMaterial color="#111827" roughness={0.5} metalness={0.4} flatShading />
      </PixelMesh>

      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2
        const r = 1.9
        return (
          <mesh
            key={i}
            ref={(el) => { nodesRef.current[i] = el }}
            position={[Math.cos(a) * r, 0.55, Math.sin(a) * r]}
          >
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshBasicMaterial color={PALETTE.core} />
          </mesh>
        )
      })}

      <mesh ref={ring1} position={[0, 1.5, 0]}>
        <torusGeometry args={[1.1, 0.06, 8, 24]} />
        <meshStandardMaterial color={PALETTE.coreRing1} roughness={0.3} metalness={0.6} flatShading />
      </mesh>
      <mesh ref={ring2} position={[0, 1.5, 0]}>
        <torusGeometry args={[0.85, 0.05, 8, 24]} />
        <meshStandardMaterial color={PALETTE.coreRing2} roughness={0.3} metalness={0.6} flatShading />
      </mesh>
      <mesh ref={ring3} position={[0, 1.5, 0]}>
        <torusGeometry args={[0.6, 0.045, 8, 24]} />
        <meshStandardMaterial color={PALETTE.coreRing3} roughness={0.3} metalness={0.6} flatShading />
      </mesh>

      <mesh ref={coreMesh} position={[0, 1.5, 0]}>
        <icosahedronGeometry args={[0.32, 0]} />
        <meshBasicMaterial color={PALETTE.core} />
      </mesh>

      <Billboard position={[0, 3.1, 0]}>
        <Text fontSize={0.42} color="#e5f9ff" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#03222b">
          ENGINEER CORE
        </Text>
        <Text position={[0, -0.4, 0]} fontSize={0.2} color="#67e8f9" anchorX="center" anchorY="middle">
          FABIAN · CORE
        </Text>
      </Billboard>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────
// CIUDAD SOFTWARE
// ─────────────────────────────────────────────────────────────
function ApiGateway({ position }) {
  const ledsRef = useRef([])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    ledsRef.current.forEach((l, i) => {
      if (!l) return
      l.material.opacity = 0.5 + 0.5 * Math.abs(Math.sin(t * 2.4 + i))
    })
  })
  return (
    <group position={position}>
      <PixelMesh position={[-0.55, 0.9, 0]} castShadow outlineWidth={0.025}>
        <boxGeometry args={[0.35, 1.8, 0.9]} />
        <meshStandardMaterial color={PALETTE.apiGateway} roughness={0.6} metalness={0.2} flatShading />
      </PixelMesh>
      <PixelMesh position={[0.55, 0.9, 0]} castShadow outlineWidth={0.025}>
        <boxGeometry args={[0.35, 1.8, 0.9]} />
        <meshStandardMaterial color={PALETTE.apiGateway} roughness={0.6} metalness={0.2} flatShading />
      </PixelMesh>
      <PixelMesh position={[0, 1.95, 0]} castShadow outlineWidth={0.025}>
        <boxGeometry args={[1.6, 0.35, 1]} />
        <meshStandardMaterial color="#0369a1" roughness={0.5} metalness={0.3} flatShading />
      </PixelMesh>
      {[-0.3, 0.3].map((x, i) => (
        <mesh key={i} ref={(el) => { ledsRef.current[i] = el }} position={[x, 1.95, 0.51]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshBasicMaterial color="#bae6fd" transparent opacity={0.8} />
        </mesh>
      ))}
      <Billboard position={[0, 2.55, 0]}>
        <Text fontSize={0.16} color="#bae6fd" anchorX="center" anchorY="middle">API GATEWAY</Text>
      </Billboard>
    </group>
  )
}

function PostgresDB({ position }) {
  return (
    <group position={position}>
      <PixelMesh castShadow receiveShadow position={[0, 0.7, 0]} outlineWidth={0.03}>
        <cylinderGeometry args={[0.6, 0.6, 1.4, 16]} />
        <meshStandardMaterial color={PALETTE.postgres} roughness={0.5} metalness={0.3} flatShading />
      </PixelMesh>
      {[1.1, 0.7, 0.3].map((y, i) => (
        <PixelMesh key={i} position={[0, y, 0]} castShadow outlineWidth={0.04}>
          <torusGeometry args={[0.62, 0.06, 6, 16]} />
          <meshStandardMaterial color={PALETTE.postgresAccent} roughness={0.3} metalness={0.5} flatShading />
        </PixelMesh>
      ))}
      <mesh position={[0, 1.42, 0]}>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshBasicMaterial color={PALETTE.postgresAccent} />
      </mesh>
      <Billboard position={[0, 1.9, 0]}>
        <Text fontSize={0.16} color="#fde68a" anchorX="center" anchorY="middle">PostgreSQL</Text>
      </Billboard>
    </group>
  )
}

function DockerStack({ position }) {
  const boxesRef = useRef([])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    boxesRef.current.forEach((b, i) => {
      if (!b) return
      const s = 0.65 + 0.35 * Math.max(0, Math.sin(t * 1.4 + i * 2.1))
      b.scale.setScalar(s)
    })
  })
  return (
    <group position={position}>
      {[0, 0.42, 0.84].map((y, i) => (
        <mesh key={i} ref={(el) => { boxesRef.current[i] = el }} position={[i % 2 === 0 ? -0.18 : 0.18, y + 0.2, 0]} castShadow>
          <boxGeometry args={[0.55, 0.36, 0.55]} />
          <meshStandardMaterial color={PALETTE.docker} roughness={0.5} metalness={0.25} flatShading />
        </mesh>
      ))}
      <Billboard position={[0, 1.5, 0]}>
        <Text fontSize={0.16} color="#7dd3fc" anchorX="center" anchorY="middle">DOCKER</Text>
      </Billboard>
    </group>
  )
}

function JavaSpringTower({ position }) {
  const ledsRef = useRef([])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    ledsRef.current.forEach((l, i) => {
      if (!l) return
      const on = Math.sin(t * 3 + i * 1.4) > 0
      l.material.color.set(on ? PALETTE.javaLeaf : '#0a3a22')
    })
  })
  return (
    <group position={position}>
      <PixelMesh position={[0, 0.9, 0]} castShadow receiveShadow outlineWidth={0.028}>
        <boxGeometry args={[0.75, 1.8, 0.75]} />
        <meshStandardMaterial color={PALETTE.java} roughness={0.6} metalness={0.15} flatShading />
      </PixelMesh>
      {[[0.35, 1.5, 0.1], [-0.4, 1.65, -0.15], [0.1, 1.85, 0.3]].map(([x, y, z], i) => (
        <PixelMesh key={i} position={[x, y, z]} rotation={[0, i, 0]} castShadow outlineWidth={0.05}>
          <coneGeometry args={[0.16, 0.32, 5]} />
          <meshStandardMaterial color={PALETTE.javaLeaf} roughness={0.5} metalness={0.1} flatShading />
        </PixelMesh>
      ))}
      {[0.5, 0.15, -0.2].map((y, i) => (
        <mesh key={i} ref={(el) => { ledsRef.current[i] = el }} position={[0, y, 0.39]}>
          <boxGeometry args={[0.3, 0.06, 0.02]} />
          <meshBasicMaterial color={PALETTE.javaLeaf} />
        </mesh>
      ))}
      <Billboard position={[0, 2.1, 0]}>
        <Text fontSize={0.16} color="#86efac" anchorX="center" anchorY="middle">JAVA · SPRING</Text>
      </Billboard>
    </group>
  )
}

function ReactBuilding({ position }) {
  const screenRef = useRef()
  useFrame((state) => {
    if (!screenRef.current) return
    const t = state.clock.elapsedTime
    screenRef.current.material.color.setHSL((0.5 + Math.sin(t * 0.5) * 0.08), 0.75, 0.55)
  })
  return (
    <group position={position}>
      <PixelMesh position={[0, 0.8, 0]} castShadow receiveShadow outlineWidth={0.028}>
        <boxGeometry args={[0.9, 1.6, 0.7]} />
        <meshStandardMaterial color={PALETTE.react} roughness={0.55} metalness={0.25} flatShading />
      </PixelMesh>
      <mesh ref={screenRef} position={[0, 0.9, 0.36]}>
        <planeGeometry args={[0.6, 0.9]} />
        <meshBasicMaterial color={PALETTE.reactAccent} />
      </mesh>
      <Billboard position={[0, 1.95, 0]}>
        <Text fontSize={0.16} color="#67e8f9" anchorX="center" anchorY="middle">REACT</Text>
      </Billboard>
    </group>
  )
}

function CiudadSoftware() {
  const nodes = useMemo(() => ({
    gateway: [-10, 0, 0],
    db: [-8, 0, -3.6],
    docker: [-8, 0, 3.6],
    java: [-6, 0, -2.2],
    react: [-6, 0, 2.2],
  }), [])

  return (
    <group>
      <ApiGateway position={nodes.gateway} />
      <PostgresDB position={nodes.db} />
      <DockerStack position={nodes.docker} />
      <JavaSpringTower position={nodes.java} />
      <ReactBuilding position={nodes.react} />

      <DataPipe from={nodes.gateway} to={nodes.db} color={PALETTE.postgresAccent} speed={0.3} packets={2} />
      <DataPipe from={nodes.gateway} to={nodes.docker} color={PALETTE.docker} speed={0.4} packets={2} />
      <DataPipe from={nodes.gateway} to={nodes.java} color={PALETTE.javaLeaf} speed={0.32} packets={1} />
      <DataPipe from={nodes.gateway} to={nodes.react} color={PALETTE.reactAccent} speed={0.36} packets={1} />

      <Billboard position={[-8, 3.4, 0]}>
        <Text fontSize={0.34} color="#7dd3fc" anchorX="center" anchorY="middle" outlineWidth={0.015} outlineColor="#031420">
          SOFTWARE
        </Text>
      </Billboard>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────
// PLANTA DE DATOS
// ─────────────────────────────────────────────────────────────
function Sensor({ position }) {
  const pulseRef = useRef()
  const dotRef = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (pulseRef.current) {
      const prog = (t * 0.8) % 1
      pulseRef.current.scale.setScalar(0.2 + prog * 1.4)
      pulseRef.current.material.opacity = clamp01(0.6 * (1 - prog))
    }
    if (dotRef.current) {
      dotRef.current.material.opacity = 0.5 + 0.5 * Math.abs(Math.sin(t * 2.5))
    }
  })
  return (
    <group position={position}>
      <PixelMesh castShadow outlineWidth={0.05}>
        <boxGeometry args={[0.32, 0.18, 0.32]} />
        <meshStandardMaterial color={PALETTE.sensor} roughness={0.5} metalness={0.2} flatShading />
      </PixelMesh>
      <mesh ref={dotRef} position={[0, 0.14, 0]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshBasicMaterial color="#4ade80" transparent opacity={0.9} />
      </mesh>
      <mesh ref={pulseRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.18, 0.22, 16]} />
        <meshBasicMaterial color="#4ade80" transparent opacity={0.4} side={2} />
      </mesh>
    </group>
  )
}

function ProcessingNode({ position }) {
  const barsRef = useRef([])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    barsRef.current.forEach((b, i) => {
      if (!b) return
      const h = 0.25 + Math.abs(Math.sin(t * 2.2 + i * 0.7)) * 0.55
      b.scale.y = h
      b.position.y = 0.5 + h * 0.4
    })
  })
  return (
    <group position={position}>
      <PixelMesh position={[0, 0.4, 0]} castShadow receiveShadow outlineWidth={0.028}>
        <boxGeometry args={[1, 0.8, 1]} />
        <meshStandardMaterial color={PALETTE.node} roughness={0.6} metalness={0.2} flatShading />
      </PixelMesh>
      {[-0.28, 0, 0.28].map((x, i) => (
        <mesh key={i} ref={(el) => { barsRef.current[i] = el }} position={[x, 0.5, 0.52]}>
          <boxGeometry args={[0.14, 0.5, 0.06]} />
          <meshBasicMaterial color={PALETTE.sensor} />
        </mesh>
      ))}
      <Billboard position={[0, 1.15, 0]}>
        <Text fontSize={0.16} color="#86efac" anchorX="center" anchorY="middle">PROCESSING</Text>
      </Billboard>
    </group>
  )
}

function DashboardScreen({ position }) {
  const textRef = useRef()
  const glowRef = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    const value = Math.floor(100 + (Math.sin(t * 0.5) * 0.5 + 0.5) * 799)
    if (textRef.current) textRef.current.text = String(value)
    if (glowRef.current) {
      glowRef.current.material.opacity = 0.7 + 0.3 * Math.sin(t * 3)
    }
  })
  return (
    <group position={position}>
      <PixelMesh position={[0, 1, 0]} castShadow receiveShadow outlineWidth={0.03}>
        <boxGeometry args={[1.3, 2, 0.2]} />
        <meshStandardMaterial color={PALETTE.dashboardFrame} roughness={0.6} metalness={0.3} flatShading />
      </PixelMesh>
      <mesh ref={glowRef} position={[0, 1, 0.11]}>
        <planeGeometry args={[1, 1.5]} />
        <meshBasicMaterial color={PALETTE.dashboardScreen} transparent opacity={0.9} />
      </mesh>
      <Text
        ref={textRef}
        position={[0, 1, 0.13]}
        fontSize={0.32}
        color={PALETTE.dashboardText}
        anchorX="center"
        anchorY="middle"
      >
        100
      </Text>
      <Billboard position={[0, 2.3, 0]}>
        <Text fontSize={0.16} color="#86efac" anchorX="center" anchorY="middle">DASHBOARD</Text>
      </Billboard>
    </group>
  )
}

function PlantaDatos() {
  const sensors = useMemo(() => ([
    [6.2, 0, -3], [6.2, 0, -1], [6.2, 0, 1], [6.2, 0, 3],
  ]), [])
  const node = useMemo(() => [8.4, 0, 0], [])
  const dash = useMemo(() => [10.4, 0, 0], [])

  return (
    <group>
      {sensors.map((p, i) => <Sensor key={i} position={p} />)}
      <ProcessingNode position={node} />
      <DashboardScreen position={dash} />

      {sensors.map((p, i) => (
        <DataPipe key={i} from={p} to={node} color={PALETTE.sensor} speed={0.5 + i * 0.05} packets={1} thickness={0.06} />
      ))}
      <DataPipe from={node} to={dash} color={PALETTE.dashboardText} speed={0.45} packets={2} />

      <Billboard position={[8.4, 3, 0]}>
        <Text fontSize={0.34} color="#86efac" anchorX="center" anchorY="middle" outlineWidth={0.015} outlineColor="#031f0d">
          DATA
        </Text>
      </Billboard>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────
// LABORATORIO MECATRÓNICA
// ─────────────────────────────────────────────────────────────
function RoboticArm({ position }) {
  const base = useRef()
  const forearm = useRef()
  const wrist = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (base.current) base.current.rotation.y = Math.sin(t * 0.5) * 0.7
    if (forearm.current) forearm.current.rotation.x = -0.4 + Math.sin(t * 0.8) * 0.35
    if (wrist.current) wrist.current.rotation.z = Math.sin(t * 1.3) * 0.5
  })

  return (
    <group position={position}>
      <PixelMesh position={[0, 0.15, 0]} castShadow receiveShadow outlineWidth={0.03}>
        <cylinderGeometry args={[0.4, 0.45, 0.3, 8]} />
        <meshStandardMaterial color={PALETTE.armBody} roughness={0.5} metalness={0.4} flatShading />
      </PixelMesh>

      <group ref={base} position={[0, 0.3, 0]}>
        <PixelMesh position={[0, 0.45, 0]} castShadow outlineWidth={0.03}>
          <boxGeometry args={[0.28, 0.9, 0.28]} />
          <meshStandardMaterial color={PALETTE.armBody} roughness={0.5} metalness={0.4} flatShading />
        </PixelMesh>

        <group ref={forearm} position={[0, 0.9, 0]}>
          <PixelMesh position={[0, 0.4, 0]} castShadow outlineWidth={0.03}>
            <boxGeometry args={[0.22, 0.8, 0.22]} />
            <meshStandardMaterial color={PALETTE.armAccent} roughness={0.5} metalness={0.3} flatShading />
          </PixelMesh>

          <group ref={wrist} position={[0, 0.8, 0]}>
            <PixelMesh castShadow outlineWidth={0.035}>
              <boxGeometry args={[0.3, 0.16, 0.16]} />
              <meshStandardMaterial color={PALETTE.armBody} roughness={0.4} metalness={0.5} flatShading />
            </PixelMesh>
            <mesh position={[0, -0.08, 0]}>
              <boxGeometry args={[0.05, 0.05, 0.05]} />
              <meshBasicMaterial color={PALETTE.core} />
            </mesh>
          </group>
        </group>
      </group>

      <Billboard position={[0, 2.6, 0]}>
        <Text fontSize={0.15} color="#fbbf24" anchorX="center" anchorY="middle">ROBOTIC ARM</Text>
      </Billboard>
    </group>
  )
}

function Gear({ position, radius = 0.4, speed = 1, color = PALETTE.gearBody }) {
  const ref = useRef()
  useFrame((_, delta) => {
    if (!ref.current) return
    ref.current.rotation.z += speed * delta
  })
  return (
    <group ref={ref} position={position} rotation={[Math.PI / 2, 0, 0]}>
      <PixelMesh castShadow outlineWidth={0.03}>
        <cylinderGeometry args={[radius, radius, 0.18, 8]} />
        <meshStandardMaterial color={color} roughness={0.55} metalness={0.4} flatShading />
      </PixelMesh>
      <PixelMesh outlineWidth={0.04}>
        <torusGeometry args={[radius + 0.05, 0.06, 6, 8]} />
        <meshStandardMaterial color={PALETTE.gearRing} roughness={0.4} metalness={0.5} flatShading />
      </PixelMesh>
    </group>
  )
}

function Motor({ position }) {
  const pistonRef = useRef()
  useFrame((state) => {
    if (!pistonRef.current) return
    const t = state.clock.elapsedTime
    pistonRef.current.position.y = 0.55 + Math.abs(Math.sin(t * 3)) * 0.22
  })
  return (
    <group position={position}>
      <PixelMesh position={[0, 0.35, 0]} castShadow receiveShadow outlineWidth={0.03}>
        <cylinderGeometry args={[0.3, 0.34, 0.7, 10]} />
        <meshStandardMaterial color={PALETTE.motorBody} roughness={0.5} metalness={0.4} flatShading />
      </PixelMesh>
      <PixelMesh ref={pistonRef} position={[0, 0.55, 0]} castShadow outlineWidth={0.04}>
        <cylinderGeometry args={[0.09, 0.09, 0.4, 8]} />
        <meshStandardMaterial color={PALETTE.motorPiston} roughness={0.35} metalness={0.6} flatShading />
      </PixelMesh>
      <Billboard position={[0, 1.1, 0]}>
        <Text fontSize={0.14} color="#e5e7eb" anchorX="center" anchorY="middle">MOTOR</Text>
      </Billboard>
    </group>
  )
}

function CircuitBench({ position }) {
  return (
    <group position={position}>
      <PixelMesh position={[0, 0.15, 0]} castShadow receiveShadow outlineWidth={0.03}>
        <boxGeometry args={[1.2, 0.3, 0.6]} />
        <meshStandardMaterial color={PALETTE.benchBody} roughness={0.6} metalness={0.25} flatShading />
      </PixelMesh>
      {[-0.4, -0.13, 0.13, 0.4].map((x, i) => (
        <Led
          key={i}
          position={[x, 0.32, 0]}
          onColor={i % 2 === 0 ? PALETTE.core : PALETTE.armAccent}
          speed={2.6}
          offset={i * 1.1}
          size={0.09}
        />
      ))}
    </group>
  )
}

function LabMecatronica() {
  return (
    <group>
      <RoboticArm position={[-2, 0, -9]} />
      <Gear position={[1, 0.5, -9]} radius={0.45} speed={1.2} color={PALETTE.gearBody} />
      <Gear position={[1.85, 0.5, -9.3]} radius={0.32} speed={-1.7} color="#6b7280" />
      <Motor position={[-0.5, 0, -10.6]} />
      <CircuitBench position={[2.2, 0, -10.6]} />

      <Billboard position={[0, 2.6, -9.8]}>
        <Text fontSize={0.34} color="#fbbf24" anchorX="center" anchorY="middle" outlineWidth={0.015} outlineColor="#241a02">
          MECHATRONICS
        </Text>
      </Billboard>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────
// ZONA IoT
// ─────────────────────────────────────────────────────────────
function SmartHouse({ position }) {
  const windowsRef = useRef([])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    windowsRef.current.forEach((w, i) => {
      if (!w) return
      w.material.opacity = 0.6 + 0.4 * Math.abs(Math.sin(t * 1.5 + i))
    })
  })
  return (
    <group position={position}>
      <PixelMesh position={[0, 0.5, 0]} castShadow receiveShadow outlineWidth={0.028}>
        <boxGeometry args={[1.4, 1, 1.2]} />
        <meshStandardMaterial color={PALETTE.house} roughness={0.6} metalness={0.1} flatShading />
      </PixelMesh>
      <PixelMesh position={[0, 1.25, 0]} rotation={[0, Math.PI / 4, 0]} castShadow outlineWidth={0.03}>
        <coneGeometry args={[1.05, 0.7, 4]} />
        <meshStandardMaterial color={PALETTE.houseRoof} roughness={0.6} metalness={0.1} flatShading />
      </PixelMesh>
      <mesh position={[0, 0.32, 0.61]}>
        <planeGeometry args={[0.3, 0.5]} />
        <meshStandardMaterial color="#3b1e6d" roughness={0.7} />
      </mesh>
      {[[-0.45, 0.65, 0.61], [0.45, 0.65, 0.61]].map(([x, y, z], i) => (
        <mesh key={i} ref={(el) => { windowsRef.current[i] = el }} position={[x, y, z]}>
          <planeGeometry args={[0.28, 0.28]} />
          <meshBasicMaterial color={PALETTE.houseWindow} transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function SmallCloud({ position }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.position.y = position[1] + Math.sin(t * 1.2) * 0.12
    ref.current.rotation.y += 0.003
  })
  return (
    <group ref={ref} position={position}>
      {[[0, 0, 0, 0.4], [0.32, -0.05, 0.1, 0.3], [-0.32, -0.05, -0.1, 0.3]].map(([x, y, z, r], i) => (
        <PixelMesh key={i} position={[x, y, z]} castShadow outlineWidth={0.04}>
          <sphereGeometry args={[r, 10, 8]} />
          <meshStandardMaterial color={PALETTE.cloudSmall} roughness={0.35} metalness={0.4} transparent opacity={0.9} flatShading />
        </PixelMesh>
      ))}
    </group>
  )
}

function ZonaIoT() {
  const housePos = useMemo(() => [0, 0, 9.5], [])
  const cloudPos = useMemo(() => [0, 3.4, 9.5], [])
  const sensors = useMemo(() => ([
    [-1.8, 0, 8.6],
    [1.8, 0, 8.6],
    [-1.4, 0, 10.6],
    [1.4, 0, 10.6],
  ]), [])

  return (
    <group>
      <SmartHouse position={housePos} />
      <SmallCloud position={cloudPos} />
      {sensors.map((p, i) => <Sensor key={i} position={p} />)}
      {sensors.map((p, i) => (
        <VerticalPipe
          key={i}
          position={[p[0], 0.2, p[2]]}
          height={3.1}
          color={PALETTE.iotAccent}
          speed={0.5 + i * 0.08}
        />
      ))}

      <Billboard position={[0, 4.4, 9.5]}>
        <Text fontSize={0.32} color="#c4b5fd" anchorX="center" anchorY="middle" outlineWidth={0.015} outlineColor="#1a0f33">
          IoT
        </Text>
      </Billboard>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────
// ZONA CLOUD
// ─────────────────────────────────────────────────────────────
function ServerRack({ position }) {
  const ledsRef = useRef([])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    ledsRef.current.forEach((led, i) => {
      if (!led) return
      const on = Math.sin(t * 3 + i * 1.7) > 0
      led.material.color.set(on ? PALETTE.rackLed : '#0a3a22')
    })
  })
  return (
    <group position={position}>
      <PixelMesh castShadow receiveShadow position={[0, 1.1, 0]} outlineWidth={0.026}>
        <boxGeometry args={[1.1, 2.2, 0.8]} />
        <meshStandardMaterial color={PALETTE.rack} roughness={0.6} metalness={0.2} flatShading />
      </PixelMesh>
      {[1.9, 1.55, 1.2, 0.85, 0.5, 0.15].map((y, i) => (
        <mesh key={i} ref={(el) => { ledsRef.current[i] = el }} position={[0, y, 0.42]}>
          <boxGeometry args={[0.65, 0.08, 0.02]} />
          <meshBasicMaterial color={PALETTE.rackLed} />
        </mesh>
      ))}
    </group>
  )
}

function GcpCloud({ position }) {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.rotation.y += 0.005
    ref.current.position.y = position[1] + Math.sin(t) * 0.15
  })
  return (
    <group ref={ref} position={position}>
      {[
        [0, 0, 0, 0.7],
        [0.6, -0.1, 0.2, 0.5],
        [-0.6, -0.1, -0.2, 0.5],
        [0.2, 0.3, -0.4, 0.45],
        [-0.3, 0.2, 0.4, 0.45],
      ].map(([x, y, z, r], i) => (
        <PixelMesh key={i} position={[x, y, z]} castShadow outlineWidth={0.04}>
          <sphereGeometry args={[r, 12, 10]} />
          <meshStandardMaterial color={PALETTE.gcp} roughness={0.3} metalness={0.5} transparent opacity={0.88} flatShading />
        </PixelMesh>
      ))}
    </group>
  )
}

function DockerContainers({ position }) {
  const colors = [PALETTE.containerA, PALETTE.containerB, PALETTE.containerC]
  return (
    <group position={position}>
      {colors.map((c, i) => (
        <PixelMesh key={i} position={[0, 0.2 + i * 0.4, 0]} castShadow outlineWidth={0.03}>
          <boxGeometry args={[0.7, 0.34, 0.5]} />
          <meshStandardMaterial color={c} roughness={0.5} metalness={0.25} flatShading />
        </PixelMesh>
      ))}
    </group>
  )
}

function ZonaCloud() {
  return (
    <group>
      <ServerRack position={[8, 0, -8]} />
      <ServerRack position={[9.4, 0, -8]} />
      <GcpCloud position={[9.3, 3.6, -9.6]} />
      <DockerContainers position={[10.6, 0, -8]} />

      <Billboard position={[9.3, 5.1, -9.6]}>
        <Text fontSize={0.3} color="#93c5fd" anchorX="center" anchorY="middle" outlineWidth={0.015} outlineColor="#03142e">
          CLOUD
        </Text>
      </Billboard>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────
// TOROTECH
// ─────────────────────────────────────────────────────────────
function ToroTechBuilding({ position }) {
  const screenRef = useRef()
  useFrame((state) => {
    if (!screenRef.current) return
    const t = state.clock.elapsedTime
    const hue = (t * 0.06) % 1
    screenRef.current.material.color.setHSL(hue, 0.7, 0.55)
  })
  return (
    <group position={position}>
      <PixelMesh position={[0, 0.9, 0]} castShadow receiveShadow outlineWidth={0.026}>
        <boxGeometry args={[1.6, 1.8, 1.2]} />
        <meshStandardMaterial color={PALETTE.toro} roughness={0.55} metalness={0.25} flatShading />
      </PixelMesh>
      <PixelMesh position={[0, 1.9, 0]} castShadow outlineWidth={0.03}>
        <boxGeometry args={[1.8, 0.2, 1.4]} />
        <meshStandardMaterial color={PALETTE.toroAccent} roughness={0.5} metalness={0.3} flatShading />
      </PixelMesh>
      <mesh ref={screenRef} position={[0, 1, 0.61]}>
        <planeGeometry args={[1, 0.7]} />
        <meshBasicMaterial color={PALETTE.toroScreen} />
      </mesh>

      <Billboard position={[0, 2.7, 0]}>
        <Text fontSize={0.28} color="#fb7185" anchorX="center" anchorY="middle" outlineWidth={0.015} outlineColor="#2a0510">
          ToroTech
        </Text>
      </Billboard>
    </group>
  )
}

function ToroTech() {
  return (
    <group>
      <ToroTechBuilding position={[-9, 0, 9]} />
    </group>
  )
}

// ─────────────────────────────────────────────────────────────
// OBELISCOS
// ─────────────────────────────────────────────────────────────
function ObservabilityPillar({ position, color }) {
  const barsRef = useRef([])
  const antennaRef = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    barsRef.current.forEach((bar, i) => {
      if (!bar) return
      const h = 0.3 + Math.abs(Math.sin(t * 2 + i * 0.8)) * 0.7
      bar.scale.y = h
      bar.position.y = 1.6 + h * 0.3
    })
    if (antennaRef.current) {
      const pulse = 1 + Math.sin(t * 4) * 0.3
      antennaRef.current.scale.setScalar(pulse)
    }
  })

  return (
    <group position={position}>
      <PixelMesh castShadow receiveShadow position={[0, 0.6, 0]} outlineWidth={0.03}>
        <boxGeometry args={[1.2, 1.2, 1.2]} />
        <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} flatShading />
      </PixelMesh>
      {[-0.35, 0, 0.35].map((x, i) => (
        <mesh key={i} ref={(el) => { barsRef.current[i] = el }} position={[x, 1.6, 0]}>
          <boxGeometry args={[0.15, 0.6, 0.15]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
      <mesh position={[0, 2.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh ref={antennaRef} position={[0, 3.02, 0]}>
        <sphereGeometry args={[0.06, 6, 6]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  )
}

function ObeliscosObservabilidad() {
  return (
    <group>
      <ObservabilityPillar position={[-1.6, 0, -6]} color={PALETTE.obs1} />
      <ObservabilityPillar position={[1.6, 0, -6]} color={PALETTE.obs2} />
      <Billboard position={[0, 3.6, -6]}>
        <Text fontSize={0.26} color="#fca5a5" anchorX="center" anchorY="middle" outlineWidth={0.015} outlineColor="#2a0d00">
          OBSERVABILITY
        </Text>
      </Billboard>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────
// CARTEL PRINCIPAL
// ─────────────────────────────────────────────────────────────
function CartelPrincipal() {
  const ref = useRef()
  useFrame((state) => {
    if (!ref.current) return
    ref.current.position.y = 6.4 + Math.sin(state.clock.elapsedTime * 0.6) * 0.15
  })
  return (
    <group>
      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 6.2, 6]} />
        <meshStandardMaterial color="#111827" roughness={0.6} metalness={0.4} flatShading />
      </mesh>
      <Billboard ref={ref} position={[0, 6.4, 0]}>
        <Text fontSize={0.55} color="#f8fafc" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="#020617">
          FABIAN · FULL STACK ENGINEER
        </Text>
        <Text position={[0, -0.55, 0]} fontSize={0.26} color="#67e8f9" anchorX="center" anchorY="middle">
          Software · Data · Hardware · Systems
        </Text>
      </Billboard>
    </group>
  )
}

// ─────────────────────────────────────────────────────────────
// ISLA PRINCIPAL
// ─────────────────────────────────────────────────────────────
export default function IslaCodigo() {
  return (
    <group>
      <PCB />
      <EngineerCore position={[0, 0, 0]} />
      <CiudadSoftware />
      <PlantaDatos />
      <LabMecatronica />
      <ZonaIoT />
      <ZonaCloud />
      <ToroTech />
      <ObeliscosObservabilidad />
      <CartelPrincipal />
    </group>
  )
}