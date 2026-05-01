import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { getWaveHeight } from '../lib/wave'
import Bottle from './Bottle'

/* ============================================
   FallingBottle 从天而降的漂流瓶
   - 从 y=10 抛物线下落到水面
   - 1.5s 后着陆，触发 onLand 回调
   ============================================ */

const FALL_DURATION = 1.5

export default function FallingBottle({ data, onLand }) {
  const groupRef = useRef(null)
  const startTime = useRef(Date.now())
  const landed = useRef(false)

  const { x, z } = data

  useFrame((state) => {
    if (landed.current || !groupRef.current) return

    const elapsed = (Date.now() - startTime.current) / 1000
    const progress = Math.min(elapsed / FALL_DURATION, 1)

    // 抛物线：快速下落 + 轻微弧线
    const startY = 10
    const t = Math.floor(state.clock.elapsedTime * 30) / 30
    const endY = getWaveHeight(x, z, t) + 0.15

    // easeInQuad 下落
    const ease = progress * progress
    const y = startY - (startY - endY) * ease

    // 水平微摆
    const sway = Math.sin(progress * Math.PI * 2) * 0.3 * (1 - progress)

    groupRef.current.position.set(x + sway, y, z)
    groupRef.current.rotation.z = Math.sin(progress * Math.PI * 3) * 0.3 * (1 - progress)

    if (progress >= 1 && !landed.current) {
      landed.current = true
      onLand?.(data)
    }
  })

  return (
    <group ref={groupRef}>
      {/* 复用 Bottle 的外观但不带点击/浮动逻辑 */}
      <group>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.28, 0.32, 0.55, 16]} />
          <meshPhysicalMaterial
            color="#aaddff"
            transparent
            opacity={0.55}
            roughness={0.15}
            metalness={0.15}
            clearcoat={0.8}
            emissive="#4488ff"
            emissiveIntensity={0.4}
          />
        </mesh>
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <sphereGeometry args={[0.32, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color="#aaddff"
            transparent
            opacity={0.55}
            roughness={0.15}
            metalness={0.15}
            clearcoat={0.8}
          />
        </mesh>
        <mesh position={[0, 0.72, 0]}>
          <cylinderGeometry args={[0.1, 0.14, 0.28, 12]} />
          <meshPhysicalMaterial
            color="#aaddff"
            transparent
            opacity={0.55}
            roughness={0.15}
            metalness={0.15}
          />
        </mesh>
        <mesh position={[0, 0.9, 0]}>
          <cylinderGeometry args={[0.09, 0.08, 0.08, 10]} />
          <meshStandardMaterial color="#b8860b" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.3, 0]} rotation={[0, 0.3, 0]}>
          <boxGeometry args={[0.2, 0.35, 0.015]} />
          <meshStandardMaterial
            color="#f8f6f0"
            emissive="#ffffff"
            emissiveIntensity={0.5}
          />
        </mesh>
        <pointLight color="#fff8e7" intensity={0.8} distance={1.5} position={[0, 0.35, 0]} />
      </group>
    </group>
  )
}
