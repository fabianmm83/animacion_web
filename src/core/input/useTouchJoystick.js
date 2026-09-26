import { useEffect, useRef } from 'react'
import { useGameStore } from '../engine/store'
import {
  CAM_ZOOM_MIN, CAM_ZOOM_MAX,
  CAM_PITCH_MIN, CAM_PITCH_MAX,
} from '../engine/constants'

const ZOOM_SENSITIVITY = 0.05
const PITCH_SENSITIVITY = 0.006
const YAW_SENSITIVITY = 0.01
const PAN_SENSITIVITY = 0.012
const DOUBLE_TAP_MS = 280

export function useTouchJoystick(containerRef) {
  const pellizco = useRef(0)
  const arrastreDerecha = useRef(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const punteros = new Map()
    let pinchStartDist = 0
    let pinchCurrentDist = 0
    let pinchStartAngle = 0
    let pinchMidX = 0
    let pinchMidY = 0
    let dragLastX = 0
    let dragLastY = 0
    let lastTapTime = 0

    const isUI = (target) => {
      let n = target
      while (n) {
        if (n.tagName === 'BUTTON') return true
        n = n.parentElement
      }
      return false
    }

    const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y)
    const angle = (a, b) => Math.atan2(b.y - a.y, b.x - a.x)

    const onDown = (e) => {
      if (isUI(e.target)) return
      punteros.set(e.pointerId, {
        x: e.clientX,
        y: e.clientY,
        startX: e.clientX,
        startY: e.clientY,
      })

      // Detección de doble tap
      const now = performance.now()
      if (punteros.size === 1 && now - lastTapTime < DOUBLE_TAP_MS) {
        const s = useGameStore.getState()
        s.setCamFollow(true)
        s.setCamPan([0, 0])
      }
      lastTapTime = now

      if (punteros.size === 1) {
        dragLastX = e.clientX
        dragLastY = e.clientY
      } else if (punteros.size === 2) {
        const [a, b] = [...punteros.values()]
        pinchStartDist = dist(a, b)
        pinchCurrentDist = pinchStartDist
        pinchStartAngle = angle(a, b)
        pinchMidX = (a.x + b.x) / 2
        pinchMidY = (a.y + b.y) / 2
        useGameStore.setState({ touchInput: { x: 0, y: 0 } })
      }
    }

    const onMove = (e) => {
      const p = punteros.get(e.pointerId)
      if (!p) return
      p.x = e.clientX
      p.y = e.clientY

      const s = useGameStore.getState()

      // ─── 2 dedos: zoom + rotación + pan ───
      if (punteros.size === 2) {
        const [a, b] = [...punteros.values()]
        const d = dist(a, b)
        const ang = angle(a, b)
        const midX = (a.x + b.x) / 2
        const midY = (a.y + b.y) / 2

        // Zoom (separación)
        const distDelta = d - pinchCurrentDist
        pinchCurrentDist = d
        if (Math.abs(distDelta) > 0.5) {
          const next = Math.min(
            CAM_ZOOM_MAX,
            Math.max(CAM_ZOOM_MIN, s.camZoom + distDelta * ZOOM_SENSITIVITY)
          )
          s.setCamZoom(next)
        }

        // Rotación (giro)
        let dAngle = ang - pinchStartAngle
        const TWO_PI = Math.PI * 2
        dAngle = ((dAngle + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI
        if (Math.abs(dAngle) > 0.005) {
          let nextRot = s.camRotation + dAngle * 1.5
          nextRot = ((nextRot + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI
          s.setCamRotation(nextRot)
          if (s.camFollow) s.setCamFollow(false)
        }
        pinchStartAngle = ang

        // Pan (movimiento del punto medio)
        const dxMid = midX - pinchMidX
        const dyMid = midY - pinchMidY
        pinchMidX = midX
        pinchMidY = midY

        if (Math.abs(dxMid) > 0.5 || Math.abs(dyMid) > 0.5) {
          const rot = s.camRotation
          const scale = 1 / s.camZoom * 20
          const rightX = Math.cos(rot) * (-dxMid * scale * PAN_SENSITIVITY)
          const rightZ = Math.sin(rot) * (-dxMid * scale * PAN_SENSITIVITY)
          const fwdX = Math.sin(rot) * (dyMid * scale * PAN_SENSITIVITY)
          const fwdZ = -Math.cos(rot) * (dyMid * scale * PAN_SENSITIVITY)

          const [px, pz] = s.camPan
          s.setCamPan([px + rightX + fwdX, pz + rightZ + fwdZ])
          if (s.camFollow) s.setCamFollow(false)
        }

        // Pitch (altura del punto medio)
        // Movemos el pitch según dy del midpoint para dar control vertical
        const dyPitch = dyMid
        if (Math.abs(dyPitch) > 0.5) {
          let nextPitch = s.camPitch + dyPitch * PITCH_SENSITIVITY
          nextPitch = Math.max(CAM_PITCH_MIN, Math.min(CAM_PITCH_MAX, nextPitch))
          s.setCamPitch(nextPitch)
        }

        return
      }

      // ─── 1 dedo ───
      if (punteros.size === 1) {
        const leftSide = p.startX < window.innerWidth * 0.5
        if (leftSide) {
          // Joystick de movimiento
          const dx = (e.clientX - p.startX) / 60
          const dy = (e.clientY - p.startY) / 60
          useGameStore.setState({
            touchInput: {
              x: Math.max(-1, Math.min(1, dx)),
              y: Math.max(-1, Math.min(1, dy)),
            },
          })
        } else {
          // Arrastre derecha: yaw + pitch
          const dx = e.clientX - dragLastX
          const dy = e.clientY - dragLastY
          dragLastX = e.clientX
          dragLastY = e.clientY

          const TWO_PI = Math.PI * 2
          // Yaw (horizontal)
          let nextRot = s.camRotation + dx * YAW_SENSITIVITY
          nextRot = ((nextRot + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI
          s.setCamRotation(nextRot)

          // Pitch (vertical)
          let nextPitch = s.camPitch + dy * PITCH_SENSITIVITY * 1.6
          nextPitch = Math.max(CAM_PITCH_MIN, Math.min(CAM_PITCH_MAX, nextPitch))
          s.setCamPitch(nextPitch)

          if (s.camFollow) s.setCamFollow(false)
        }
      }
    }

    const onUp = (e) => {
      punteros.delete(e.pointerId)
      if (punteros.size < 2) {
        pinchStartDist = 0
        pinchCurrentDist = 0
        pinchStartAngle = 0
        pellizco.current = 0
      }
      if (punteros.size === 0) {
        useGameStore.setState({ touchInput: { x: 0, y: 0 } })
        arrastreDerecha.current = 0
      }
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)

    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
    }
  }, [containerRef])

  return { pellizco, arrastreDerecha }
}