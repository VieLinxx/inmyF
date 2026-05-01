import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getWaveHeight } from '../lib/wave'

/* ============================================
   Bottle 漂流瓶 3D 组件
   - 圆柱瓶身 + 球形瓶底 + 瓶颈 + 软木塞
   - 半透明玻璃 + 内部白色纸条
   - Y 轴随波浪实时浮动
   - 悬停发光 / 点击回调
   ============================================ */

function BottleMesh({ onClick, isHovered, isNew }) {
  const glassMaterial = (
    <meshPhysicalMaterial
      color={isHovered ? '#aaddff' : '#88bbee'}
      transparent
      opacity={isNew ? 0.55 : 0.4}
      roughness={0.15}
      metalness={0.15}
      clearcoat={0.8}
      clearcoatRoughness={0.1}
      emissive={isHovered ? '#4488ff' : '#000000'}
      emissiveIntensity={isHovered ? 0.6 : 0}
    />
  )

  return (
    <group onClick={onClick}>
      {/* 瓶身主体 */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.32, 0.55, 16]} />
        {glassMaterial}
      </mesh>

      {/* 瓶底（半球） */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <sphereGeometry args={[0.32, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        {glassMaterial}
      </mesh>

      {/* 瓶颈 */}
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 0.28, 12]} />
        {glassMaterial}
      </mesh>

      {/* 瓶口外沿 */}
      <mesh position={[0, 0.88, 0]}>
        <torusGeometry args={[0.1, 0.02, 8, 16]} />
        {glassMaterial}
      </mesh>

      {/* 软木塞 */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.09, 0.08, 0.08, 10]} />
        <meshStandardMaterial color="#b8860b" roughness={0.9} />
      </mesh>

      {/* 内部白色纸条 */}
      <mesh position={[0, 0.3, 0]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.2, 0.35, 0.015]} />
        <meshStandardMaterial
          color="#f8f6f0"
          emissive="#fff8e7"
          emissiveIntensity={isHovered ? 0.5 : 0.25}
        />
      </mesh>

      {/* 瓶内微光 */}
      <pointLight
        color="#fff8e7"
        intensity={isHovered ? 0.8 : 0.4}
        distance={1.5}
        position={[0, 0.35, 0]}
      />
    </group>
  )
}

export default function Bottle({ data, onSelect }) {
  const groupRef = useRef(null)
  const [hovered, setHovered] = useState(false)

  const x = data.x ?? data.pos_x ?? 0
  const z = data.z ?? data.pos_z ?? 0
  const { isNew } = data

  useFrame((state) => {
    if (!groupRef.current) return
    const t = Math.floor(state.clock.elapsedTime * 30) / 30
    const y = getWaveHeight(x, z, t)
    // 瓶子浮在浪尖稍上方，加上轻微摆动
    groupRef.current.position.set(x, y + 0.15, z)
    groupRef.current.rotation.z = Math.sin(t * 0.7 + x) * 0.08
    groupRef.current.rotation.x = Math.cos(t * 0.5 + z) * 0.05
  })

  return (
    <group
      ref={groupRef}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
    >
      <BottleMesh
        onClick={(e) => {
          e.stopPropagation()
          onSelect?.(data)
        }}
        isHovered={hovered}
        isNew={isNew}
      />
    </group>
  )
}
