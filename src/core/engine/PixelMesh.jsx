import { Children, cloneElement, isValidElement, useMemo } from 'react'
import * as THREE from 'three'

/**
 * Oscurece un color hex a un % del valor original (mantiene el tono).
 */
function darken(hex, amount = 0.55) {
  try {
    const c = new THREE.Color(hex)
    c.multiplyScalar(amount)
    return `#${c.getHexString()}`
  } catch {
    return '#000000'
  }
}

/**
 * Extrae el color de un material hijo (meshStandardMaterial, meshBasicMaterial, etc.)
 */
function getChildColor(children) {
  let color = null
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return
    if (child.props?.color) {
      color = child.props.color
    }
  })
  return color
}

/**
 * PixelMesh — envuelve cualquier mesh y le añade un contorno del color oscurecido.
 *
 * Uso:
 *   <PixelMesh position={[0,0,0]} castShadow outlineWidth={0.025}>
 *     <boxGeometry args={[1,1,1]} />
 *     <meshStandardMaterial color="#c0392b" flatShading />
 *   </PixelMesh>
 */
export default function PixelMesh({
  children,
  outlineColor,
  outlineWidth = 0.025,
  outlineOpacity = 1,
  ...meshProps
}) {
  const finalOutline = useMemo(() => {
    if (outlineColor) return outlineColor
    const c = getChildColor(children)
    return c ? darken(c, 0.5) : '#000000'
  }, [outlineColor, children])

  return (
    <group>
      {/* Mesh principal */}
      <mesh {...meshProps}>
        {children}
      </mesh>

      {/* Contorno: mismo mesh escalado, material oscurecido BackSide */}
      <mesh
        {...meshProps}
        scale={
          meshProps.scale
            ? Array.isArray(meshProps.scale)
              ? meshProps.scale.map((s) => s * (1 + outlineWidth))
              : meshProps.scale * (1 + outlineWidth)
            : 1 + outlineWidth
        }
      >
        {children}
        <meshBasicMaterial
          color={finalOutline}
          side={THREE.BackSide}
          transparent={outlineOpacity < 1}
          opacity={outlineOpacity}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}