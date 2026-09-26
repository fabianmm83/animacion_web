import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { useGameStore } from '../../core/engine/store'
import { CAM_DISTANCE } from '../../core/engine/constants'

export default function IsoCamera() {
  const { camera, size } = useThree()
  const camZoom = useGameStore((s) => s.camZoom)
  const camRotation = useGameStore((s) => s.camRotation)
  const camPitch = useGameStore((s) => s.camPitch)
  const camPan = useGameStore((s) => s.camPan)
  const camFollow = useGameStore((s) => s.camFollow)

  const targetRef = useRef([0, 0, 0])
  // Pan suavizado (para el smooth transition)
  const panRef = useRef([camPan[0], camPan[1]])

  // Zoom responsivo
  useEffect(() => {
    const base = Math.min(size.width, size.height)
    const factor = base < 700 ? 0.6 : base < 1000 ? 0.8 : 1
    camera.zoom = camZoom * factor
    camera.updateProjectionMatrix()
  }, [size, camZoom, camera])

  // Al reactivar follow, el pan vuelve suavemente a [0, 0]
  useEffect(() => {
    if (camFollow) {
      // Reactiva: pan objetivo es [0, 0]
      const start = [panRef.current[0], panRef.current[1]]
      const startTime = performance.now()
      const duration = 700
      let raf
      const anim = () => {
        const t = Math.min(1, (performance.now() - startTime) / duration)
        const e = 1 - Math.pow(1 - t, 3) // easeOutCubic
        panRef.current[0] = start[0] * (1 - e)
        panRef.current[1] = start[1] * (1 - e)
        if (t < 1) raf = requestAnimationFrame(anim)
      }
      raf = requestAnimationFrame(anim)
      return () => cancelAnimationFrame(raf)
    } else {
      // Está libre: pan sigue directo
      panRef.current[0] = camPan[0]
      panRef.current[1] = camPan[1]
    }
  }, [camFollow, camPan])

  // Loop principal
  useEffect(() => {
    let raf
    const lerp = (a, b, t) => a + (b - a) * t

    const tick = () => {
      const { avatarPos } = useGameStore.getState()

      // Target base = posición del avatar
      const baseX = avatarPos[0]
      const baseZ = avatarPos[2]

      // Offset del pan (ya suavizado en el useEffect de arriba)
      const tx = baseX + panRef.current[0]
      const tz = baseZ + panRef.current[1]

      // Suavizado adicional del target
      const smooth = camFollow ? 0.08 : 0.15
      targetRef.current[0] = lerp(targetRef.current[0], tx, smooth)
      targetRef.current[2] = lerp(targetRef.current[2], tz, smooth)

      const cx = targetRef.current[0]
      const cz = targetRef.current[2]

      // Posición orbital esférica
      const d = CAM_DISTANCE
      const pitch = camPitch
      const yaw = camRotation

      const y = d * Math.sin(pitch)
      const r = d * Math.cos(pitch)
      const x = cx + Math.cos(yaw) * r
      const z = cz + Math.sin(yaw) * r

      camera.position.set(x, y, z)
      camera.lookAt(cx, 0, cz)
      camera.updateProjectionMatrix()

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [camRotation, camPitch, camFollow, camera])

  return null
}