'use client'

import React from 'react'
import OtbeeVectorMascot, { MascotPOV, MascotPoseAction } from './OtbeeVectorMascot'

export type OtbeeAnimation =
  | 'idle'
  | 'bounce'
  | 'shake'
  | 'spin'
  | 'wave'
  | 'jump'
  | 'salto'
  | 'celebrate'
  | 'thinking'
  | 'none'

export interface OtbeeMascotProps {
  pose?: string
  pov?: MascotPOV
  action?: MascotPoseAction
  size?: number
  animation?: OtbeeAnimation
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  onHover?: () => void
}

/**
 * Maps legacy pose names / strings to vector POV
 */
function mapPoseToPOV(pose?: string, explicitPov?: MascotPOV): MascotPOV {
  if (explicitPov) return explicitPov
  if (!pose) return 'front'

  const p = pose.toLowerCase()
  if (p.includes('kanan') || p.includes('right')) return 'right'
  if (p.includes('kiri') || p.includes('left')) return 'left'
  if (p.includes('belakang') || p.includes('back')) return 'back'
  if (p.includes('atas') || p.includes('top')) return 'top'
  if (p.includes('bawah') || p.includes('bottom')) return 'bottom'
  if (p.includes('tiga-perempat') || p.includes('3-4') || p.includes('3/4')) return '3/4'
  return 'front'
}

/**
 * Maps animation types to vector actions
 */
function mapAnimationToAction(anim?: OtbeeAnimation, explicitAction?: MascotPoseAction): MascotPoseAction {
  if (explicitAction) return explicitAction
  if (!anim) return 'idle'

  switch (anim) {
    case 'bounce':
    case 'jump':
      return 'bounce'
    case 'salto':
      return 'salto'
    case 'wave':
      return 'wave'
    case 'celebrate':
      return 'cheer'
    case 'thinking':
      return 'thinking'
    default:
      return 'idle'
  }
}

/**
 * Pure Hardcoded 2D Otbee Mascot
 * Zero PNGs, 100% procedural SVG, responsive to all POVs & animations.
 */
export default function OtbeeMascot({
  pose = 'maskot-pov-depan-front',
  pov,
  action,
  size = 120,
  animation = 'idle',
  className = '',
  style,
  onClick,
  onHover,
}: OtbeeMascotProps) {
  const resolvedPOV = mapPoseToPOV(pose, pov)
  const resolvedAction = mapAnimationToAction(animation, action)

  return (
    <OtbeeVectorMascot
      pov={resolvedPOV}
      action={resolvedAction}
      size={size}
      className={className}
      style={style}
      onClick={onClick}
      onHover={onHover}
    />
  )
}
export { OtbeeVectorMascot }
