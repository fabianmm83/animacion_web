// Círculos: { x, z, r }
// Cajas: { x, z, w, d } (ancho en X, profundidad en Z, centrado en x,z)

const obstaclesByIsland = {
 tocho: [
  { type: 'circle', x: -13.5, z: 0, r: 0.5 },
  { type: 'circle', x: 13.5, z: 0, r: 0.5 },
],
codigo: [
  // Engineer Core (centro)
  { type: 'circle', x: 0, z: 0, r: 2.1 },
 
  // Ciudad Software (oeste)
  { type: 'box', x: -10, z: 0, w: 1.4, d: 1.1 },     // API Gateway
  { type: 'circle', x: -8, z: -3.6, r: 0.7 },        // PostgreSQL
  { type: 'box', x: -8, z: 3.6, w: 0.8, d: 0.8 },    // Docker (software)
  { type: 'box', x: -6, z: -2.2, w: 0.9, d: 0.9 },   // Java/Spring
  { type: 'box', x: -6, z: 2.2, w: 1.0, d: 0.8 },    // React
 
  // Planta de Datos (este)
  { type: 'circle', x: 6.2, z: -3, r: 0.35 },
  { type: 'circle', x: 6.2, z: -1, r: 0.35 },
  { type: 'circle', x: 6.2, z: 1, r: 0.35 },
  { type: 'circle', x: 6.2, z: 3, r: 0.35 },
  { type: 'box', x: 8.4, z: 0, w: 1.1, d: 1.1 },     // Processing Node
  { type: 'box', x: 10.4, z: 0, w: 1.4, d: 0.3 },    // Dashboard
 
  // Laboratorio de Mecatrónica (trasera)
  { type: 'circle', x: -2, z: -9, r: 0.7 },          // Brazo robótico
  { type: 'circle', x: 1, z: -9, r: 0.5 },           // Engranaje 1
  { type: 'circle', x: 1.85, z: -9.3, r: 0.4 },      // Engranaje 2
  { type: 'circle', x: -0.5, z: -10.6, r: 0.45 },    // Motor
  { type: 'box', x: 2.2, z: -10.6, w: 1.3, d: 0.7 }, // Banco de circuitos
 
  // Zona IoT (delantera)
  { type: 'box', x: 0, z: 9.5, w: 1.5, d: 1.3 },     // Casita inteligente
  { type: 'circle', x: -1.8, z: 8.6, r: 0.3 },
  { type: 'circle', x: 1.8, z: 8.6, r: 0.3 },
  { type: 'circle', x: -1.4, z: 10.6, r: 0.3 },
  { type: 'circle', x: 1.4, z: 10.6, r: 0.3 },
 
  // Zona Cloud (esquina noreste)
  { type: 'box', x: 8, z: -8, w: 1.2, d: 0.9 },      // Rack 1
  { type: 'box', x: 9.4, z: -8, w: 1.2, d: 0.9 },    // Rack 2
  { type: 'box', x: 10.6, z: -8, w: 0.8, d: 0.6 },   // Docker (cloud)
 
  // ToroTech (esquina)
  { type: 'box', x: -9, z: 9, w: 1.7, d: 1.3 },
 
  // Obeliscos de observabilidad
  { type: 'box', x: -1.6, z: -6, w: 1.3, d: 1.3 },
  { type: 'box', x: 1.6, z: -6, w: 1.3, d: 1.3 },
],  


  montana: [
  // Monte Tláloc — ahora en [-6.5, -2] con radio 2.4
  { type: 'circle', x: -6.5, z: -2, r: 2.4 },
  // Popocatépetl — en [-1.5, -6] con radio 3.6
  { type: 'circle', x: -1.5, z: -6, r: 3.6 },
  // Iztaccíhuatl — en [4, -4] con radio 3.4
  { type: 'circle', x: 4, z: -4, r: 3.4 },
  // Árboles (nuevas posiciones)
  { type: 'circle', x: -9, z: 6, r: 0.5 },
  { type: 'circle', x: -8, z: 7, r: 0.5 },
  { type: 'circle', x: -7, z: 6, r: 0.5 },
  { type: 'circle', x: 7, z: 5, r: 0.5 },
  { type: 'circle', x: 8, z: 6, r: 0.5 },
  { type: 'circle', x: 9, z: 7, r: 0.5 },
  { type: 'circle', x: -5, z: 7, r: 0.5 },
  { type: 'circle', x: 5, z: 7, r: 0.5 },
  { type: 'circle', x: -9, z: 2, r: 0.5 },
  { type: 'circle', x: 9, z: 2, r: 0.5 },
],
}

const AVATAR_RADIUS = 0.65
const ISLAND_LIMIT = 16

/**
 * Intenta mover al avatar de (x, z) a (nx, nz).
 * Devuelve la posición final, aplicando límites y colisiones.
 */
export function resolveMovement(isla, x, z, nx, nz) {
  // 1. Límite de la isla
  nx = Math.max(-ISLAND_LIMIT, Math.min(ISLAND_LIMIT, nx))
  nz = Math.max(-ISLAND_LIMIT, Math.min(ISLAND_LIMIT, nz))

  const obs = obstaclesByIsland[isla] || []

  // 2. Colisión con cada obstáculo
  for (const o of obs) {
    if (o.type === 'circle') {
      const dx = nx - o.x
      const dz = nz - o.z
      const dist = Math.hypot(dx, dz)
      const minDist = o.r + AVATAR_RADIUS
      if (dist < minDist && dist > 0.0001) {
        // Empujar fuera del círculo
        nx = o.x + (dx / dist) * minDist
        nz = o.z + (dz / dist) * minDist
      } else if (dist <= 0.0001) {
        // Caso degenerado: empujar en dirección del movimiento
        nx = o.x + minDist
      }
    } else if (o.type === 'box') {
      const halfW = o.w / 2 + AVATAR_RADIUS
      const halfD = o.d / 2 + AVATAR_RADIUS
      const dx = nx - o.x
      const dz = nz - o.z
      if (Math.abs(dx) < halfW && Math.abs(dz) < halfD) {
        // Está dentro: empujar por el eje con menor penetración
        const penX = halfW - Math.abs(dx)
        const penZ = halfD - Math.abs(dz)
        if (penX < penZ) {
          nx = o.x + Math.sign(dx || 1) * halfW
        } else {
          nz = o.z + Math.sign(dz || 1) * halfD
        }
      }
    }
  }

  // 3. Clamp final por si la colisión empujó fuera
  nx = Math.max(-ISLAND_LIMIT, Math.min(ISLAND_LIMIT, nx))
  nz = Math.max(-ISLAND_LIMIT, Math.min(ISLAND_LIMIT, nz))

  return [nx, nz]
}