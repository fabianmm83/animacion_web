import { useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, Vignette, SMAA } from '@react-three/postprocessing'
import { Environment } from '@react-three/drei'
import * as THREE from 'three'

import IsoCamera from './components/engine/IsoCamera'
import IslandCenter from './components/engine/IslandCenter'
import Avatar from './components/avatar/Avatar'
import HUD from './components/ui/HUD'
import DPad from './components/ui/DPad'
import IslaTocho from './components/islands/IslaTocho'
import IslaCodigo from './components/islands/IslaCodigo'
import IslaMontana from './components/islands/IslaMontana'
import { useCameraControls } from './core/input/useCameraControls'
import { useTouchJoystick } from './core/input/useTouchJoystick'

const ISLANDS = {
  tocho: IslaTocho,
  codigo: IslaCodigo,
  montana: IslaMontana,
}

export default function App() {
  const [islaActual, setIslaActual] = useState('tocho')
  const wrapperRef = useRef(null)
  const touchRef = useRef(null)

  useCameraControls(wrapperRef)
  useTouchJoystick(touchRef)

  const IslaActiva = ISLANDS[islaActual]

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(ellipse at center, #111827 0%, #050810 100%)',
        overflow: 'hidden',
      }}
    >
      <div
        ref={touchRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 5,
          touchAction: 'none',
        }}
      >
        <Canvas
          orthographic
          shadows
          dpr={[1, 2]}
          gl={{
            antialias: false,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0,
          }}
          style={{ imageRendering: 'pixelated' }}
        >
          <IsoCamera />
          <IslandCenter islandSize={16} />

          {/* Iluminación estilizada */}
          <ambientLight intensity={0.5} color="#c9d6ff" />
          <directionalLight
            position={[10, 16, 8]}
            intensity={1.6}
            color="#fff5e0"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-14}
            shadow-camera-right={14}
            shadow-camera-top={14}
            shadow-camera-bottom={-14}
            shadow-camera-near={0.1}
            shadow-camera-far={50}
            shadow-bias={-0.0005}
          />
          <directionalLight
            position={[-8, 10, -6]}
            intensity={0.35}
            color="#7ba8ff"
          />

          {/* Entorno con reflejos suaves */}
          <Environment preset="night" />

          <IslaActiva key={islaActual} />
          <Avatar />

          {/* Post-procesado */}
          <EffectComposer>
            <SMAA />
            <Bloom
              intensity={0.6}
              luminanceThreshold={0.65}
              luminanceSmoothing={0.25}
              mipmapBlur
            />
            <Vignette eskil={false} offset={0.2} darkness={0.75} />
          </EffectComposer>
        </Canvas>
      </div>

      <div style={{ position: 'relative', zIndex: 20 }}>
        <HUD islaActual={islaActual} onChangeIsla={setIslaActual} />
      </div>
      <DPad />
    </div>
  )
}