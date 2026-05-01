/**
 * 海洋波浪高度计算（与 Shader 保持一致）
 * 用于 Bottle.jsx 实时计算 Y 轴位置
 */
export function getWaveHeight(x, z, time) {
  return (
    Math.sin(x * 0.3 + time) * 0.3 +
    Math.sin(z * 0.5 + time * 0.8) * 0.2 +
    Math.sin((x + z) * 0.8 + time * 1.2) * 0.1
  )
}
