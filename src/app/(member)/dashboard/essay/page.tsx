import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewEssayButton from './NewEssayButton'
import EssayRow from './EssayRow'
import FeatureHeader from '@/components/dashboard/FeatureHeader'

export default async function EssayListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: essays } = await supabase
    .from('essays')
    .select('id, title, target_ptn, target_jalur, status, updated_at, essay_feedback(score)')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  return (
    <div className="w-full px-6 md:px-8 py-10">
      <FeatureHeader title="Essay AI Review" subtitle="Tulis essay-mu dan dapatkan review instan dari AI." mascot="/fitur/essay-ai-review.png" color="yellow">
        <NewEssayButton />
      </FeatureHeader>

      <div className="flex flex-col gap-3">
        {!essays || essays.length === 0 ? (
          <div className="rounded-3xl bg-white shadow-md p-10 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fitur/essay-ai-review.png" alt="" className="mx-auto mb-4 filter drop-shadow-xs" style={{ height: 140, width: 'auto' }} />
            <p className="text-base font-extrabold text-gray-900 mb-1">Belum ada essay</p>
            <p className="text-xs text-gray-500">Klik &ldquo;Essay Baru&rdquo; untuk mulai menulis dan dapatkan review AI</p>
          </div>
        ) : essays.map(e => {
          const latestScore = Array.isArray(e.essay_feedback) && e.essay_feedback.length > 0
            ? e.essay_feedback[e.essay_feedback.length - 1]?.score
            : null
          return (
            <EssayRow
              key={e.id}
              id={e.id}
              title={e.title}
              targetPtn={e.target_ptn}
              targetJalur={e.target_jalur}
              latestScore={latestScore}
            />
          )
        })}
      </div>
    </div>
  )
}
