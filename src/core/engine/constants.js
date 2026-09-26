export const TILE = 1
export const ISO_ANGLE = Math.atan(Math.SQRT1_2) // 35.264°
export const PIXEL_SCALE = 4

// Distancia base de cámara
export const CAM_DISTANCE = 30
export const CAM_ZOOM_DEFAULT = 42
export const CAM_ZOOM_MIN = 14
export const CAM_ZOOM_MAX = 90

// Límites de rotación (radianes)
export const CAM_ROT_MIN = -Math.PI
export const CAM_ROT_MAX = Math.PI
export const CAM_PITCH_MIN = 0.15      // ~8° (casi horizontal)
export const CAM_PITCH_MAX = 1.45      // ~83° (casi cenital)

// Velocidad de movimiento del avatar
export const AVATAR_SPEED = 4.5

// ─────────────────────────────────────────────────────────
// Paleta unificada pixel art (tema nocturno, saturada)
// ─────────────────────────────────────────────────────────
export const PIXEL_PALETTE = {
  // Neutros
  negro: '#0d0d12',
  carbon: '#1a1a22',
  grisOscuro: '#2a2a35',
  gris: '#4a4a55',
  grisClaro: '#7a7a85',
  blanco: '#f0f0f4',

  // Verdes
  verdePCB: '#1a3a2a',
  verdeTrace: '#22c55e',
  verdeOscuro: '#2d5f34',
  verde: '#3a8a52',
  verdeClaro: '#4ade80',

  // Azules
  azulOscuro: '#0c2340',
  azulProfundo: '#1a3a5c',
  azul: '#4285f4',
  azulClaro: '#7ba8ff',
  cyan: '#22d3ee',

  // Amarillos / naranjas
  amarillo: '#ffd43b',
  naranja: '#ff6b35',
  naranjaClaro: '#ff9b7a',
  rojo: '#c8102e',
  rojoOscuro: '#8b1a1a',

  // Magenta / violeta
  magenta: '#e83e8c',
  violeta: '#8b5cf6',

  // Especiales
  nieve: '#f0f4f8',
  piel: '#d4a574',
  cafe: '#8b4513',

  // LEDs
  ledVerde: '#00ff88',
  ledAzul: '#00aaff',
  ledAmarillo: '#ffdd00',
  ledRojo: '#ff2200',
  ledCyan: '#22d3ee',

  // Isla Código — Engineer Core
  core: '#22d3ee',
  coreBase: '#0f172a',
  coreRing1: '#22d3ee',
  coreRing2: '#4285f4',
  coreRing3: '#22c55e',

  // Ciudad Software
  apiGateway: '#0ea5e9',
  postgres: '#336791',
  postgresAccent: '#ffd43b',
  docker: '#2496ed',
  java: '#22c55e',
  javaLeaf: '#4ade80',
  react: '#111827',
  reactAccent: '#61dafb',

  // Planta datos
  sensor: '#22c55e',
  pipeBody: '#0f172a',
  packet: '#22d3ee',
  node: '#1f2937',
  dashboardFrame: '#111827',
  dashboardScreen: '#0b1220',
  dashboardText: '#22c55e',

  // Mecatrónica
  armBody: '#374151',
  armAccent: '#f59e0b',
  gearBody: '#4b5563',
  gearRing: '#9ca3af',
  motorBody: '#1f2937',
  motorPiston: '#d1d5db',
  benchBody: '#111827',

  // IoT
  house: '#8b5cf6',
  houseRoof: '#6d28d9',
  houseWindow: '#facc15',
  iotAccent: '#22d3ee',
  cloudSmall: '#a78bfa',

  // Cloud
  rack: '#1f2937',
  rackLed: '#00ff88',
  gcp: '#4285f4',
  containerA: '#2496ed',
  containerB: '#0ea5e9',
  containerC: '#38bdf8',

  // ToroTech
  toro: '#1f2937',
  toroAccent: '#f43f5e',
  toroScreen: '#0b1220',

  // Observabilidad
  obs1: '#ff6b35',
  obs2: '#e83e8c',
}

// Colores legacy (para islas que aún no migraron a PIXEL_PALETTE)
export const COLORS = {
  pasto: PIXEL_PALETTE.verdeOscuro,
  pastoOscuro: '#2d5f34',
  tierra: '#8b6f47',
  agua: '#2a5d8a',
  aguaClara: PIXEL_PALETTE.azulClaro,
  piedra: '#6b6b6b',
  nieve: PIXEL_PALETTE.nieve,
  rojo: PIXEL_PALETTE.rojo,
  negro: PIXEL_PALETTE.negro,
}