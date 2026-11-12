import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/security'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!(await rateLimit('onboarding_save', user.id, 20, 300))) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan. Tunggu sebentar.' }, { status: 429 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const db = createServiceClient()

  const fullName = typeof body.full_name === 'string' ? body.full_name.trim().slice(0, 120) : ''
  const schoolName = typeof body.school_name === 'string' ? body.school_name.trim().slice(0, 150) : ''
  const schoolRankTier = typeof body.school_rank_tier === 'string' ? body.school_rank_tier.trim().slice(0, 50) : null
  const targetPtns = Array.isArray(body.target_ptns) ? body.target_ptns.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : []
  const targetMajors = Array.isArray(body.target_majors) ? body.target_majors.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : []
  const targetJalurs = Array.isArray(body.target_jalurs) ? body.target_jalurs.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : []
  const targetChoices = Array.isArray(body.target_choices) ? body.target_choices : []
  const jalurTujuan = typeof body.jalur_tujuan === 'string' ? body.jalur_tujuan.trim() : null
  const avgRapor = typeof body.avg_rapor === 'number' && !isNaN(body.avg_rapor) ? body.avg_rapor : null
  const raporPerSemester = Array.isArray(body.rapor_per_semester) ? body.rapor_per_semester : null
  const certCount = typeof body.cert_count === 'number' && !isNaN(body.cert_count) ? body.cert_count : 0
  const certHighestLevel = typeof body.cert_highest_level === 'string' ? body.cert_highest_level : null
  const prestasiItems = Array.isArray(body.prestasi_items) ? body.prestasi_items : []
  const essayDraft = typeof body.essay_draft === 'string' ? body.essay_draft : null
  const learningStyles = Array.isArray(body.learning_styles) ? body.learning_styles.filter((x): x is string => typeof x === 'string') : []
  const biggestChallenge = typeof body.biggest_challenge === 'string' ? body.biggest_challenge : null
  const dailyStudyHours = typeof body.daily_question_target === 'number' ? body.daily_question_target : 0
  const studyDaysCount = typeof body.study_days_per_week === 'number' ? body.study_days_per_week : 0
  const commitmentText = typeof body.commitment_text === 'string' ? body.commitment_text : null
  const motivationText = typeof body.motivation_text === 'string' ? body.motivation_text : null
  const ambassadorCode = typeof body.ambassador_code === 'string' ? body.ambassador_code : null
  const targetScore = typeof body.target_score === 'number' ? body.target_score : 50

  // 1. Update core guaranteed schema columns first so a missing optional column never blocks saving
  const corePayload: Record<string, unknown> = {
    id: user.id,
    email: user.email ?? '',
    full_name: fullName || user.user_metadata?.full_name || '',
    school: schoolName || null,
    school_name: schoolName || null,
    school_rank_tier: schoolRankTier,
    target_ptns: targetPtns,
    target_majors: targetMajors,
    target_jalurs: targetJalurs,
    avg_rapor: avgRapor,
    cert_count: certCount,
    cert_highest_level: certHighestLevel,
    prestasi_items: prestasiItems,
    learning_styles: learningStyles,
    biggest_challenge: biggestChallenge,
    daily_question_target: dailyStudyHours,
    study_days_per_week: studyDaysCount,
    commitment_text: commitmentText,
    motivation_text: motivationText,
    target_score: targetScore,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  }

  const { error: upsertErr } = await db
    .from('profiles')
    .upsert(corePayload, { onConflict: 'id' })

  if (upsertErr) {
    console.error('[Onboarding Save Core Error]', upsertErr)
    return NextResponse.json({ error: 'Gagal menyimpan profil onboarding: ' + upsertErr.message }, { status: 500 })
  }

  // 2. Attempt extended columns update separately (gracefully ignored if migration 016 not yet applied)
  try {
    await db
      .from('profiles')
      .update({
        target_choices: targetChoices,
        jalur_tujuan: jalurTujuan,
        rapor_per_semester: raporPerSemester,
        essay_draft: essayDraft,
        ambassador_code: ambassadorCode,
      })
      .eq('id', user.id)
  } catch {}

  // 3. Mirror key onboarding fields to auth user_metadata as redundant backup
  try {
    await db.auth.admin.updateUserById(user.id, {
      user_metadata: {
        ...user.user_metadata,
        full_name: fullName || user.user_metadata?.full_name || '',
        school_name: schoolName,
        school_rank_tier: schoolRankTier,
        target_ptns: targetPtns,
        target_majors: targetMajors,
        target_choices: targetChoices,
        target_jalurs: targetJalurs,
        jalur_tujuan: jalurTujuan,
        avg_rapor: avgRapor,
      },
    })
  } catch (metaErr) {
    console.warn('[Onboarding Meta Backup Warning]', metaErr)
  }

  return NextResponse.json({ ok: true })
}
