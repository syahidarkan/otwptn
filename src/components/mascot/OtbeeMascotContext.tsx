'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { otbeeBrain } from './otbee/brain'
import type { ClipName } from './otbee/engine'
import type { ViewName } from './otbee/types'

interface OtbeeMascotContextValue {
  /** make the floating mascot perform a clip (optionally in a given view with a speech bubble) */
  act: (clip: ClipName, opts?: { view?: ViewName; text?: string }) => void
  say: (text: string, ms?: number) => void
  attackTarget: (el: HTMLElement, text: string, ms?: number) => void
}

const OtbeeMascotContext = createContext<OtbeeMascotContextValue>({ act: () => {}, say: () => {}, attackTarget: () => {} })

export function OtbeeMascotProvider({ children }: { children: ReactNode }) {
  const value = useMemo<OtbeeMascotContextValue>(() => ({
    act: (clip, opts) => otbeeBrain.emit({ type: 'act', clip, view: opts?.view, text: opts?.text }),
    say: (text, ms) => otbeeBrain.emit({ type: 'say', text, ms }),
    attackTarget: (el, text, ms) => otbeeBrain.emit({ type: 'attack-target', el, text, ms }),
  }), [])
  return <OtbeeMascotContext.Provider value={value}>{children}</OtbeeMascotContext.Provider>
}

export function useOtbeeMascot() {
  return useContext(OtbeeMascotContext)
}
