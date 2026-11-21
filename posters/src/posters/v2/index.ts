import type React from 'react'
import { Creator } from './Creator'
import { EssayGratis } from './EssayGratis'
import { Games } from './Games'
import { OtbeeTV } from './OtbeeTV'
import { MandiriList } from './MandiriList'
import { NilaiSnbp } from './NilaiSnbp'
import { Platform1 } from './Platform1'
import { Pricelist } from './Pricelist'

export const V2: { id: string; file: string; C: React.FC }[] = [
  { id: 'NilaiSnbp', file: '14-edukasi-nilai-snbp', C: NilaiSnbp },
  { id: 'Platform1', file: '15-platform-1', C: Platform1 },
  { id: 'EssayGratis', file: '16-essay-reviewer-gratis', C: EssayGratis },
  { id: 'MandiriList', file: '17-daftar-jalur-mandiri', C: MandiriList },
  { id: 'Pricelist', file: '18-pricelist-paket', C: Pricelist },
  { id: 'Creator', file: '19-rekrut-content-creator', C: Creator },
  { id: 'OtbeeTV', file: '20-otbee-tv', C: OtbeeTV },
  { id: 'Games', file: '21-games-ppu-pbm', C: Games },
]
