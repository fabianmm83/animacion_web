import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Billboard, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useGameStore } from '../../core/engine/store'
import { useKeyboard } from '../../core/input/useKeyboard'
import { inputToWorldDirection } from '../../core/utils/iso'
import { AVATAR_SPEED } from '../../core/engine/constants'
import { resolveMovement } from '../../core/engine/collisions'

// ─── Configuración del sprite ──────────────────────────────
const SPRITE_HEIGHT = 3.3          // alto del sprite en unidades del mundo
const SPRITE_ASPECT = 0.5          // asumimos PNG vertical tipo 1:2 (ancho:alto)
// ↑ Si tus PNGs tienen otra proporción, ajusta este número.
// Ej: si son 512×1024 → 0.5 (correcto). Si son 800×1000 → 0.8.

// Umbral de ángulo para cambio de vista (grados)
const ANGLE_FRONT = 60             // ±60° desde el frente → frontal
const ANGLE_SIDE = 140             // ±140° desde el frente → lateral; resto → trasero

export default function Avatar() {
  const rootRef = useRef()
  const planeRef = useRef()
  const matRef = useRef()

  // Animación
  const walkRef = useRef(0)
  const idleBreath = useRef(0)
  const bobRef = useRef(0)
  const swayRef = useRef(0)

  // Estado del cambio de vista
  const currentViewRef = useRef('front') // 'front' | 'side' | 'side-mirror' | 'back'

  const keyboard = useKeyboard()
  const { camera } = useThree()

  // ─── Cargar las 3 texturas ───
  const textures = useTexture({
    frontal: '/assets/avatar/frontal_voxel.png',
    lateral: '/assets/avatar/lateral_voxel.png',
    trasero: '/assets/avatar/trasero_voxel.png',
  })

  // Configurar filtros pixel art en cada textura
  useMemo(() => {
    Object.values(textures).forEach((tex) => {
      if (!tex) return
      tex.magFilter = THREE.NearestFilter
      tex.minFilter = THREE.NearestFilter
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = 1
      tex.needsUpdate = true
    })
  }, [textures])

  // Textura inicial
  const initialTexture = textures.frontal

  useFrame((_, delta) => {
    if (!rootRef.current) return
    if (!planeRef.current || !matRef.current) return

    const { avatarPos, setAvatarPos, setAvatarDir, touchInput, islaActual, avatarDir } = useGameStore.getState()

    const kx = keyboard.current.x
    const ky = keyboard.current.y
    const tx = touchInput?.x || 0
    const ty = touchInput?.y || 0

    const ix = Math.max(-1, Math.min(1, kx + tx))
    const iy = Math.max(-1, Math.min(1, ky + ty))

    const dir = inputToWorldDirection(ix, iy)
    const dx = dir[0]
    const dz = dir[2]

    const speed = AVATAR_SPEED * delta
    const tryX = avatarPos[0] + dx * speed
    const tryZ = avatarPos[2] + dz * speed

    const [nx, nz] = resolveMovement(islaActual, avatarPos[0], avatarPos[2], tryX, tryZ)
    setAvatarPos([nx, 0, nz])

    const moving = Math.hypot(dx, dz) > 0.01

    // ─── Guardar dirección del avatar en el store (para el cálculo de vista) ───
    if (moving) {
      setAvatarDir([dx, 0, dz])
    }

    // ─── Animación (bob + balanceo) ───
    if (moving) {
      walkRef.current += delta * 9
    } else {
      walkRef.current += delta * 4
    }
    idleBreath.current += delta * 1.6

    const bob = moving
      ? Math.abs(Math.sin(walkRef.current)) * 0.12
      : Math.sin(idleBreath.current) * 0.02
    bobRef.current = bob

    const sway = moving ? Math.sin(walkRef.current * 0.5) * 0.06 : 0
    swayRef.current = sway

    // ─── Posición del root ───
    rootRef.current.position.set(nx, 0, nz)

    // ─── Aplicar bob + sway al plano ───
    // El plano tiene su pivote en el centro, así que subimos media altura
    const baseY = SPRITE_HEIGHT / 2 + 0.27 // 0.27 = altura superficie isla
    planeRef.current.position.set(sway, baseY + bob, 0)

    // ─── Cálculo de vista (ángulo entre avatar y cámara) ───
    // Dirección del avatar (desde su posición) hacia donde camina
    const avDirX = avatarDir?.[0] ?? 0
    const avDirZ = avatarDir?.[2] ?? 1

    // Ángulo del avatar en el mundo (0 = +Z)
    const avatarAngle = Math.atan2(avDirX, avDirZ)

    // Dirección de la cámara respecto al avatar (en XZ)
    const camToAvX = camera.position.x - nx
    const camToAvZ = camera.position.z - nz
    const camAngle = Math.atan2(camToAvX, camToAvZ)

    // Diferencia angular entre "donde mira el avatar" y "donde está la cámara"
    let diff = camAngle - avatarAngle
    while (diff > Math.PI) diff -= Math.PI * 2
    while (diff < -Math.PI) diff += Math.PI * 2

    const diffDeg = Math.abs((diff * 180) / Math.PI)

    // ─── Elegir vista según el ángulo ───
    let view
    let mirror = false

    if (diffDeg < ANGLE_FRONT) {
      view = 'front'
    } else if (diffDeg > ANGLE_SIDE) {
      view = 'back'
    } else {
      view = 'side'
      // Si el diff es positivo, la cámara está a la izquierda del avatar
      // → usamos lateral espejado para que mire "hacia" la cámara
      mirror = diff < 0
    }

    // ─── Cambiar textura si la vista cambió ───
    if (view !== currentViewRef.current) {
      currentViewRef.current = view
      if (view === 'front') {
        matRef.current.map = textures.frontal
      } else if (view === 'back') {
        matRef.current.map = textures.trasero
      } else {
        matRef.current.map = textures.lateral
      }
      matRef.current.needsUpdate = true
    }

    // ─── Aplicar espejo en X solo cuando es lateral y la cámara mira desde el otro lado ───
    const targetScaleX = mirror ? -1 : 1
    planeRef.current.scale.x += (targetScaleX - planeRef.current.scale.x) * Math.min(1, delta * 12)

    // ─── Sombra falsa: sigue al avatar en el piso ───
    if (rootRef.current.userData.shadow) {
      const sh = rootRef.current.userData.shadow
      sh.position.set(nx, 0.29, nz)
      const s = 1 - bob * 0.6
      sh.scale.setScalar(s)
    }
  })

  return (
    <>
      {/* Sombra falsa */}
      <mesh
        ref={(el) => {
          if (rootRef.current) rootRef.current.userData.shadow = el
        }}
        position={[0, 0.29, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.75, 20]} />
        <meshBasicMaterial
          color="#000000"
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Avatar — root con posición y billboard con el plano */}
      <group ref={rootRef}>
        <Billboard>
          <mesh ref={planeRef} position={[0, SPRITE_HEIGHT / 2 + 0.27, 0]}>
            <planeGeometry args={[SPRITE_HEIGHT * SPRITE_ASPECT, SPRITE_HEIGHT]} />
            <meshBasicMaterial
              ref={matRef}
              map={initialTexture}
              transparent
              alphaTest={0.1}
              side={THREE.DoubleSide}
              depthWrite={true}
              toneMapped={false}
            />
          </mesh>
        </Billboard>
      </group>
    </>
  )
}