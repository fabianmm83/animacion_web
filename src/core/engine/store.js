import { create } from 'zustand'

export const useGameStore = create((set) => ({
  islaActual: 'tocho',
  avatarPos: [0, 0, 0],
  avatarDir: [0, 0, 1],

  // Cámara orbital
  camRotation: Math.PI / 4,   // yaw
  camPitch: Math.PI / 4,      // pitch (45° por defecto)
  camZoom: 42,
  camPan: [0, 0],             // offset del target en XZ (para pan manual)
  camFollow: true,            // si sigue al avatar o está libre

  touchInput: { x: 0, y: 0 },

  setIslaActual: (isla) => set({ islaActual: isla }),
  setAvatarPos: (pos) => set({ avatarPos: pos }),
  setAvatarDir: (dir) => set({ avatarDir: dir }),

  setCamRotation: (r) => set({ camRotation: r }),
  setCamPitch: (p) => set({ camPitch: p }),
  setCamZoom: (z) => set({ camZoom: z }),
  setCamPan: (p) => set({ camPan: p }),
  setCamFollow: (f) => set({ camFollow: f }),

  setTouchInput: (v) => set({ touchInput: v }),
}))