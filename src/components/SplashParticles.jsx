import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/* ============================================
   SplashParticles 白色水花粒子
   - 30 个白色粒子从中心爆开
   - 受重力下落，1.2s 后消失
   ============================================ */

const PARTICLE_COUNT = 30
const LIFETIME = 1.2

export default function SplashParticles({ position, onComplete }) {
  const pointsRef = useRef(null)
  const startTime = useMemo(() => Date.now(), [])

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3)
    const vel = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      pos[i * 3] = position[0]
      pos[i * 3 + 1] = position[1]
      pos[i * 3 + 2] = position[2]

      const angle = Math.random() * Math.PI * 2
      const speed = 1.5 + Math.random() * 2.5
      const upSpeed = 1.5 + Math.random() * 2.0
      vel.push({
        x: Math.cos(angle) * speed,
        y: upSpeed,
        z: Math.sin(angle) * speed,
      })
    }
    return { positions: pos, velocities: vel }
  }, [position])

  useFrame(() => {
    if (!pointsRef.current) return
    const elapsed = (Date.now() - startTime) / 1000
    if (elapsed > LIFETIME) {
      onComplete?.()
      return
    }

    const posArray = pointsRef.current.geometry.attributes.position.array
    const progress = elapsed / LIFETIME

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const dt = 0.016 // 近似帧时间
      velocities[i].y -= 4.5 * dt // 重力

      posArray[i * 3] += velocities[i].x * dt
      posArray[i * 3 + 1] += velocities[i].y * dt
      posArray[i * 3 + 2] += velocities[i].z * dt
    }

    pointsRef.current.geometry.attributes.position.needsUpdate = true

    // 整体淡出
    const opacity = 1 - Math.pow(progress, 2)
    pointsRef.current.material.opacity = Math.max(0, opacity)
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.12}
        transparent
        opacity={1}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
