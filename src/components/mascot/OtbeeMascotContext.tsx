'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { OtbeeAnimation } from './OtbeeMascot'

export type MascotPosition = 'bottom-right' | 'bottom-left' | 'inline'

export interface MascotConfig {
  pose?: string
  animation?: OtbeeAnimation
  visible?: boolean
  position?: MascotPosition
}

interface OtbeeMascotContextValue {
  config: MascotConfig
  triggerMascot: (config: Partial<MascotConfig>) => void
  hideMascot: () => void
  showMascot: () => void
}

const DEFAULT_CONFIG: MascotConfig = {
  pose: 'maskot-pov-depan-front',
  animation: 'idle',
  visible: true,
  position: 'bottom-left',
}

const OtbeeMascotContext = createContext<OtbeeMascotContextValue>({
  config: DEFAULT_CONFIG,
  triggerMascot: () => {},
  hideMascot: () => {},
  showMascot: () => {},
})

export function OtbeeMascotProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<MascotConfig>(DEFAULT_CONFIG)

  const triggerMascot = useCallback((newConfig: Partial<MascotConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }))
  }, [])

  const hideMascot = useCallback(() => {
    setConfig(prev => ({ ...prev, visible: false }))
  }, [])

  const showMascot = useCallback(() => {
    setConfig(prev => ({ ...prev, visible: true }))
  }, [])

  return (
    <OtbeeMascotContext.Provider value={{ config, triggerMascot, hideMascot, showMascot }}>
      {children}
    </OtbeeMascotContext.Provider>
  )
}

export function useOtbeeMascot() {
  return useContext(OtbeeMascotContext)
}
