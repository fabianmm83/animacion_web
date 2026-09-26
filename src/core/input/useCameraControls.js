import { useEffect } from 'react'
import { useGameStore } from '../engine/store'
import {
  CAM_ZOOM_MIN, CAM_ZOOM_MAX,
  CAM_PITCH_MIN, CAM_PITCH_MAX,
} from '../engine/constants'

const ORBIT_SPEED = 0.008
const PAN_SPEED = 0.02
const ZOOM_SPEED = 0.03

export function useCameraControls(containerRef) {
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let mode = null
    let lastX = 0
    let lastY = 0

    const onContextMenu = (e) => e.preventDefault()

    const onPointerDown = (e) => {
      if (e.button === 2) {
        mode = 'orbit'
        lastX = e.clientX
        lastY = e.clientY
        e.preventDefault()
      } else if (e.button === 1) {
        mode = 'pan'
        lastX = e.clientX
        lastY = e.clientY
        e.preventDefault()
      }
    }

    const onPointerMove = (e) => {
      if (!mode) return
      const dx = e.clientX - lastX
      const dy = e.clientY - lastY
      lastX = e.clientX
      lastY = e.clientY

      const s = useGameStore.getState()

      if (mode === 'orbit') {
        // Yaw
        let nextRot = s.camRotation + dx * ORBIT_SPEED
        const TWO_PI = Math.PI * 2
        nextRot = ((nextRot + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI
        s.setCamRotation(nextRot)

        // Pitch — INVERTIDO: arrastrar arriba sube la cámara
        let nextPitch = s.camPitch + dy * ORBIT_SPEED
        nextPitch = Math.max(CAM_PITCH_MIN, Math.min(CAM_PITCH_MAX, nextPitch))
        s.setCamPitch(nextPitch)

        if (s.camFollow) s.setCamFollow(false)
      } else if (mode === 'pan') {
        const rot = s.camRotation
        const scale = 1 / s.camZoom * 20
        const rightX = Math.cos(rot) * (-dx * scale * PAN_SPEED)
        const rightZ = Math.sin(rot) * (-dx * scale * PAN_SPEED)
        const fwdX = Math.sin(rot) * (dy * scale * PAN_SPEED)
        const fwdZ = -Math.cos(rot) * (dy * scale * PAN_SPEED)

        const [px, pz] = s.camPan
        s.setCamPan([px + rightX + fwdX, pz + rightZ + fwdZ])
        if (s.camFollow) s.setCamFollow(false)
      }
    }

    const onPointerUp = () => { mode = null }

    const onWheel = (e) => {
      e.preventDefault()
      const s = useGameStore.getState()
      const delta = -e.deltaY * ZOOM_SPEED
      const next = Math.min(CAM_ZOOM_MAX, Math.max(CAM_ZOOM_MIN, s.camZoom + delta))
      s.setCamZoom(next)
    }

    const onDoubleClick = (e) => {
      if (e.button === 2) {
        const s = useGameStore.getState()
        s.setCamFollow(true)
        s.setCamPan([0, 0])
      }
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    el.addEventListener('contextmenu', onContextMenu)
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('dblclick', onDoubleClick)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('blur', onPointerUp)

    return () => {
      el.removeEventListener('wheel', onWheel)
      el.removeEventListener('contextmenu', onContextMenu)
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('dblclick', onDoubleClick)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('blur', onPointerUp)
    }
  }, [containerRef])
}