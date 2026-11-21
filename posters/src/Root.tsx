import React from 'react'
import { Still, useVideoConfig } from 'remotion'
import { BrandIntro } from './posters/BrandIntro'
import { FITUR } from './posters/fitur'
import { Harga } from './posters/Harga'
import { MORE } from './posters/more'
import { V2 } from './posters/v2'

const Brand: React.FC = () => <BrandIntro layout={useVideoConfig().height > 1500 ? 'story' : 'feed'} />
const FITUR_FILE: Record<string, string> = { tracking: '02-fitur-tracking-jalur', essay: '03-fitur-essay-ai-review', kalkulator: '04-fitur-kalkulator-peluang', otbee: '05-fitur-otbee-ai', mentor: '06-fitur-mentor-alumni' }

/** every poster, by its output file name; each one exists as -feed (1080x1350) and -story (1080x1920) */
export const POSTERS: { file: string; C: React.FC }[] = [
  { file: '01-brand-intro', C: Brand },
  ...FITUR.map(f => ({ file: FITUR_FILE[f.id], C: f.C })),
  { file: '07-harga', C: Harga },
  ...MORE.map(m => ({ file: m.file, C: m.C })),
  ...V2.map(m => ({ file: m.file, C: m.C })),
].sort((a, b) => a.file.localeCompare(b.file))

export const RemotionRoot: React.FC = () => (
  <>
    {POSTERS.map(p => (
      <React.Fragment key={p.file}>
        <Still id={`${p.file}-feed`} component={p.C} width={1080} height={1350} />
        <Still id={`${p.file}-story`} component={p.C} width={1080} height={1920} />
      </React.Fragment>
    ))}
  </>
)
