import type React from 'react'
import { Essay } from './Essay'
import { Kalkulator } from './Kalkulator'
import { Mentor } from './Mentor'
import { OtbeeAI } from './OtbeeAI'
import { Tracking } from './Tracking'

export const FITUR: { id: string; C: React.FC }[] = [
  { id: 'tracking', C: Tracking },
  { id: 'essay', C: Essay },
  { id: 'kalkulator', C: Kalkulator },
  { id: 'otbee', C: OtbeeAI },
  { id: 'mentor', C: Mentor },
]
