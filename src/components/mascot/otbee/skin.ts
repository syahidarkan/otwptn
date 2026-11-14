/**
 * Bend deformer for limbs (arms / legs).
 *
 * Each limb is ONE traced vector piece - never cut in two. Every control point is moved by
 *   1. an elbow/knee "swirl": rotate about the joint by  beta  * smoothstep(zone around the joint)
 *   2. a shoulder/hip "swirl": rotate about the root by   alpha * smoothstep(zone next to the body)
 * so the shape curves smoothly, the outline stays continuous and the root stays glued to the body.
 */
export interface Skin {
  root: [number, number]; ec: [number, number]; u: [number, number]
  Ln: number; T: number; rb: number; ew: number
  /** 'swirl' = rotate points (arms); 'shear' = move whole cross-sections (short wide legs: never folds) */
  mode?: 'swirl' | 'shear'
  /** [y0, y1] in rest space: the top of a leg fades from transparent to opaque over this span */
  fade?: [number, number]
}
const D2R = Math.PI / 180
const ss = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)))
  return t * t * (3 - 2 * t)
}
const f1 = (n: number) => (Math.round(n * 10) / 10).toString()

export function skinD(subs: number[][], sk: Skin, aDeg: number, bDeg: number, dy: number): string {
  const [rx, ry] = sk.root, [ex, ey] = sk.ec, [ux, uy] = sk.u
  const A = aDeg * D2R, B = bDeg * D2R
  // the shoulder zone widens with bigger raises so a chubby limb never folds on itself
  const rb = sk.rb * (1 + 0.8 * Math.min(1, Math.abs(A) / 1.5))
  const tj = sk.T / sk.Ln
  const out: string[] = []
  for (const a of subs) {
    const pts: number[] = new Array(a.length)
    for (let i = 0; i < a.length; i += 2) {
      let x = a[i], y = a[i + 1]
      const tau = ((x - rx) * ux + (y - ry) * uy) / sk.Ln
      if (sk.mode === 'shear') {
        // displace the centre line only; every point of the same cross-section moves together
        let cx = rx + ux * tau * sk.Ln, cy = ry + uy * tau * sk.Ln
        const c0x = cx, c0y = cy
        if (B !== 0) {
          const s1 = ss(tj - sk.ew, tj + sk.ew, tau)
          if (s1 > 0) {
            const ang = B * s1, c = Math.cos(ang), s = Math.sin(ang), ox = cx - ex, oy = cy - ey
            cx = ex + ox * c - oy * s; cy = ey + ox * s + oy * c
          }
        }
        const s0 = ss(0, rb, tau)
        if (s0 > 0) {
          if (A !== 0) {
            const ang = A * s0, c = Math.cos(ang), s = Math.sin(ang), ox = cx - rx, oy = cy - ry
            cx = rx + ox * c - oy * s; cy = ry + ox * s + oy * c
          }
          cy += dy * s0
        }
        pts[i] = x + (cx - c0x); pts[i + 1] = y + (cy - c0y)
        continue
      }
      if (B !== 0) {
        const s1 = ss(tj - sk.ew, tj + sk.ew, tau)
        if (s1 > 0) {
          const ang = B * s1, c = Math.cos(ang), s = Math.sin(ang), ox = x - ex, oy = y - ey
          x = ex + ox * c - oy * s; y = ey + ox * s + oy * c
        }
      }
      const s0 = ss(0, rb, tau)
      if (s0 > 0) {
        if (A !== 0) {
          const ang = A * s0, c = Math.cos(ang), s = Math.sin(ang), ox = x - rx, oy = y - ry
          x = rx + ox * c - oy * s; y = ry + ox * s + oy * c
        }
        y += dy * s0
      }
      pts[i] = x; pts[i + 1] = y
    }
    let d = `M${f1(pts[0])} ${f1(pts[1])}`
    for (let k = 2; k < pts.length; k += 6) d += `C${f1(pts[k])} ${f1(pts[k + 1])} ${f1(pts[k + 2])} ${f1(pts[k + 3])} ${f1(pts[k + 4])} ${f1(pts[k + 5])}`
    out.push(d + 'Z')
  }
  return out.join('')
}
