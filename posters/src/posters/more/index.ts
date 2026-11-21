import type React from 'react'
import { Ambassador } from './Ambassador'
import { Eligible } from './Eligible'
import { RekrutMentor } from './RekrutMentor'
import { Mandiri } from './Mandiri'
import { PetaJalur } from './PetaJalur'
import { SnbpDaftar } from './SnbpDaftar'

/** id -> component, rendered as `${id}Feed` (1080x1350) and `${id}Story` (1080x1920) */
export const MORE: { id: string; file: string; C: React.FC }[] = [
  { id: 'Eligible', file: '08-momen-eligible-snbp', C: Eligible },
  { id: 'SnbpDaftar', file: '09-momen-pendaftaran-snbp', C: SnbpDaftar },
  { id: 'Mandiri', file: '10-momen-jalur-mandiri', C: Mandiri },
  { id: 'RekrutMentor', file: '11-rekrut-mentor', C: RekrutMentor },
  { id: 'Ambassador', file: '12-rekrut-ambassador', C: Ambassador },
  { id: 'PetaJalur', file: '13-edukasi-peta-jalur', C: PetaJalur },
]
