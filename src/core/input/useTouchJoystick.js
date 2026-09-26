import { useEffect, useRef } from 'react'
import { useGameStore } from '../engine/store'
import { CAM_PITCH_MIN, CAM_PITCH_MAX } from '../engine/constants'

export function useTouchJoystick(containerRef) {
  const pellizco = useRef(0)
  const arrastreDerecha = useRef(0)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const punteros = new Map()
    let pinchStartDist = 0
    let pinchStartAngle = 0
    let pinchCurrentDist = 0
    let dragLastX = 0

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

      if (punteros.size === 1) {
        dragLastX = e.clientX
      } else if (punteros.size === 2) {
        const [a, b] = [...punteros.values()]
        pinchStartDist = dist(a, b)
        pinchCurrentDist = pinchStartDist
        pinchStartAngle = angle(a, b)
        // Cancelar joystick si entra un segundo dedo
        useGameStore.setState({ touchInput: { x: 0, y: 0 } })
      }
    }

    const onMove = (e) => {
      const p = punteros.get(e.pointerId)
      if (!p) return
      p.x = e.clientX
      p.y = e.clientY

      // ── 2 dedos: zoom + rotación + pitch ──
      if (punteros.size === 2) {
        const [a, b] = [...punteros.values()]
        const d = dist(a, b)
        const ang = angle(a, b)

        // Zoom por distancia
        pellizco.current = pinchCurrentDist - d
        pinchCurrentDist = d

        // Rotación por cambio de ángulo entre los dos dedos
        let dAngle = ang - pinchStartAngle
        // Envolver a [-π, π]
        const TWO_PI = Math.PI * 2
        dAngle = ((dAngle + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI

        const s = useGameStore.getState()
        if (Math.abs(dAngle) > 0.005) {
          let nextRot = s.camRotation + dAngle * 1.5
          nextRot = ((nextRot + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI
          s.setCamRotation(nextRot)
          if (s.camFollow) s.setCamFollow(false)
        }

        // Actualizar referencia de ángulo (incremental)
        pinchStartAngle = ang

        return
      }

      // ── 1 dedo ──
      if (punteros.size === 1) {
        const leftSide = p.startX < window.innerWidth * 0.5
        if (leftSide) {
          const dx = (e.clientX - p.startX) / 60
          const dy = (e.clientY - p.startY) / 60
          useGameStore.setState({
            touchInput: {
              x: Math.max(-1, Math.min(1, dx)),
              y: Math.max(-1, Math.min(1, dy)),
            },
          })
        } else {
          // Arrastre derecha → rotación de cámara
          const dx = e.clientX - dragLastX
          arrastreDerecha.current += dx
          dragLastX = e.clientX

          const s = useGameStore.getState()
          const TWO_PI = Math.PI * 2
          let nextRot = s.camRotation + dx * 0.01
          nextRot = ((nextRot + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI
          s.setCamRotation(nextRot)
          if (s.camFollow) s.setCamFollow(false)
        }
      }
    }

    const onUp = (e) => {
      punteros.delete(e.pointerId)
      if (punteros.size < 2) {
        pinchStartDist = 0
        pinchCurrentDist = 0
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