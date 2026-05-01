import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

/* ============================================
   水波顶点/片元 Shader
   - 顶点：3 层正弦波叠加
   - 片元：波峰浅蓝 → 波谷深紫 + 噪声波光 + 菲涅尔
   ============================================ */

const vertexShader = /* glsl */ `
  uniform float uTime;
  varying float vElevation;
  varying vec3 vViewPosition;
  varying vec3 vNormal;

  void main() {
    vec3 pos = position;

    float elevation =
      sin(pos.x * 0.3 + uTime) * 0.3 +
      sin(pos.z * 0.5 + uTime * 0.8) * 0.2 +
      sin((pos.x + pos.z) * 0.8 + uTime * 1.2) * 0.1;

    pos.y += elevation;

    vElevation = elevation;
    vNormal = normalize(normal);
    vViewPosition = - (modelViewMatrix * vec4(pos, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  varying float vElevation;
  varying vec3 vViewPosition;
  varying vec3 vNormal;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    // 波峰浅蓝 → 波谷深紫
    vec3 peakColor  = vec3(0.45, 0.75, 0.95);
    vec3 valleyColor = vec3(0.12, 0.06, 0.32);

    float mixFactor = smoothstep(-0.5, 0.55, vElevation);
    vec3 baseColor = mix(valleyColor, peakColor, mixFactor);

    // 简化噪声波光（仅在高处闪烁）
    float sparkle = random(vViewPosition.xz * 8.0 + uTime * 0.3);
    sparkle = pow(sparkle, 25.0) * smoothstep(0.15, 0.5, vElevation);
    baseColor += vec3(sparkle * 0.6);

    // 菲涅尔边缘提亮
    vec3 viewDir = normalize(vViewPosition);
    vec3 normal = normalize(vNormal);
    float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 3.5);
    baseColor += vec3(fresnel * 0.25);

    // 整体亮度随波动微调
    float brightness = 0.85 + smoothstep(-0.3, 0.4, vElevation) * 0.15;
    baseColor *= brightness;

    gl_FragColor = vec4(baseColor, 0.92);
  }
`

function WaterPlane() {
  const meshRef = useRef(null)
  const materialRef = useRef(null)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  )

  useFrame((state) => {
    // 30fps 量化
    const t = Math.floor(state.clock.elapsedTime * 30) / 30
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t
    }
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[160, 160, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/* ============================================
   天空背景（CSS 渐变）+ Canvas 透明
   相机 [0,8,12] 俯视约 50°
   ============================================ */

export default function OceanScene({ children }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        // 天空 CSS 渐变：深夜蓝 → 紫 → 海平面浅紫
        background:
          'linear-gradient(180deg, #050518 0%, #1a103c 35%, #2d1b5e 70%, #3d2a7a 100%)',
        zIndex: 1,
      }}
    >
      <Canvas
        camera={{ position: [0, 8, 12], fov: 50, near: 0.1, far: 100 }}
        dpr={[1, 2]} /* 移动端限制 DPR，防止 3x 渲染过耗 */
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        style={{ position: 'absolute', inset: 0, touchAction: 'none' }}
        onCreated={({ gl }) => {
          gl.domElement.style.touchAction = 'none'
        }}
      >
        {/* 环境光：偏蓝的冷色调 */}
        <ambientLight intensity={0.4} color="#8899ff" />
        {/* 方向光：模拟月光 */}
        <directionalLight
          position={[5, 10, 5]}
          intensity={0.6}
          color="#aabbff"
        />

        <WaterPlane />

        {children}

        <OrbitControls
          enablePan={false}
          minDistance={8}
          maxDistance={15}
          maxPolarAngle={Math.PI / 2.3}
          minPolarAngle={Math.PI / 8}
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.8}
          zoomSpeed={0.8}
          touches={{
            ONE: THREE.TOUCH.ROTATE,
            TWO: THREE.TOUCH.DOLLY_PAN,
          }}
        />
      </Canvas>
    </div>
  )
}
