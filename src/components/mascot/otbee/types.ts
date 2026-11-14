export type ViewName = 'front' | 'threeQuarter' | 'right' | 'left' | 'back' | 'top' | 'bottom'

import type { Skin } from './skin'
export interface Layer { f: string; d?: string; s?: number[][] }
export interface EyeData {
  shape: Layer[]
  lash: Layer[]
  hl: [number, number, number][]
  /** [cx, cy, rx, ry, angleDeg] of the pupil ellipse */
  pupilE: [number, number, number, number, number]
}
export interface PartData {
  parent: string | null
  pivot: [number, number]
  center?: [number, number]
  bbox?: [number, number, number, number]
  cap?: { c: [number, number]; r: number; f: string; rim: string }
  /** present on limbs: they are deformed at runtime instead of rotated as rigid pieces */
  skin?: Skin
  pupilC?: [number, number]
  pupilR?: number
  layers?: Layer[]
  eye?: EyeData
}
export interface ViewData {
  view: string
  w: number
  h: number
  order: string[]
  /** bounding box of the whole figure (sheet px) */
  box: [number, number, number, number]
  parts: Record<string, PartData>
}
