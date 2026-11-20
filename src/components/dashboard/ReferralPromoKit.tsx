'use client'

import { useState } from 'react'
import { Copy, Check, Download, Share2, Play, Tag, Video } from 'lucide-react'
import InteractiveFeatureDemoPlayer from '@/components/dashboard/InteractiveFeatureDemoPlayer'
import { TIERS, TIER_LABELS, TIER_TAGLINES, TIER_BADGE, PRICE_MATRIX, formatIDR, type Tier, type Track } from '@/lib/pricing'

// Shared "price poster + feature demo video" promo kit, used by the Student
// Ambassador, Mentor, and Content Creator dashboards. Any profile with a
// referral_code earns a commission when it's used at checkout (see
// src/lib/commission.ts), regardless of role - this is just the shared UI for
// promoting that code, so it doesn't need to be built 3 separate times.
export default function ReferralPromoKit({ referralCode }: { referralCode: string }) {
  const referralUrl = referralCode ? `https://otwptn.com/upgrade?ref=${referralCode}` : ''

  const [copiedCaptionId, setCopiedCaptionId] = useState<string | null>(null)
  const [promoFilter, setPromoFilter] = useState<'Semua' | 'Story' | 'Feed' | 'Landscape'>('Semua')
  const [katalogCategory, setKatalogCategory] = useState<'Semua' | 'Nectar' | 'Honeycomb' | 'Queen Bee' | 'Akun Premium'>('Semua')
  const [posterAspect, setPosterAspect] = useState<'Story 9:16' | 'Feed 4:5'>('Story 9:16')
  const [activeDemoVideo, setActiveDemoVideo] = useState<{ title: string; desc: string; duration: string; videoUrl: string; feature: string } | null>(null)

  function handleCopyLink() {
    navigator.clipboard.writeText(referralUrl)
  }

  function handleCopyCaption(id: string, text: string) {
    navigator.clipboard.writeText(text)
    setCopiedCaptionId(id)
    setTimeout(() => setCopiedCaptionId(null), 2000)
  }

  function handleDownloadPoster() {
    const link = document.createElement('a')
    link.href = '/mascot/check-paper-happy.png'
    link.download = `katalog-harga-${katalogCategory.toLowerCase()}-${referralCode}.png`
    link.click()
  }

  const screenRecordDemos = [
    { id: 'demo-kalkulator', slug: 'kalkulator-peluang', title: 'Demo: Kalkulator Peluang SNBP (Rasionalisasi AI)', feature: 'Kalkulator Peluang', category: 'Story', duration: '00:15', videoUrl: '/promo-demos/kalkulator-peluang.webp', previewImg: '/promo-demos/kalkulator-peluang.png', desc: 'Screen recording simulasi rasionalisasi nilai rapor 5 semester, perhitungan peluang lolos prodi impian secara real-time.', caption: `Mau tahu peluang lolos SNBP kamu di UI, ITB, atau UGM? Tonton demo live kalkulator AI otwptn ini! Cek sekarang pakai kode "${referralCode}" di ${referralUrl}` },
    { id: 'demo-essay', slug: 'essay-ai-review', title: 'Demo: AI Essay Reviewer (Anotasi Real-Time & Export)', feature: 'Essay AI Review', category: 'Landscape', duration: '00:18', videoUrl: '/promo-demos/essay-ai-review.webp', previewImg: '/promo-demos/essay-ai-review.png', desc: 'Screen recording editor esai mirip Google Docs dengan review AI 4 dimensi, deteksi kalimat klise, dan export PDF/Word.', caption: `Tulis esai motivasi & prestasi anti-klise bareng AI Reviewer otwptn! Dapatkan feedback instan dengan kode "${referralCode}" di ${referralUrl}` },
    { id: 'demo-otbee', slug: 'otbee-ai', title: 'Demo: Otbee AI Chatbot (Konsultasi Jalur & Portofolio)', feature: 'Otbee AI', category: 'Story', duration: '00:14', videoUrl: '/promo-demos/otbee-ai.webp', previewImg: '/promo-demos/otbee-ai.png', desc: 'Screen recording tanya-jawab interaktif dengan Otbee AI seputar strategi prodi, audit rapor, dan tips lolos seleksi PTN.', caption: `Asisten AI pintar 24/7 khusus pejuang PTN non-tes! Tanya apa saja ke Otbee AI di otwptn dengan kode "${referralCode}": ${referralUrl}` },
    { id: 'demo-strategi', slug: 'atur-strategi', title: 'Demo: Atur Strategi Pemilihan Prodi & Prioritas', feature: 'Atur Strategi', category: 'Landscape', duration: '00:16', videoUrl: '/promo-demos/atur-strategi.webp', previewImg: '/promo-demos/atur-strategi.png', desc: 'Screen recording penyusunan strategi prioritas jurusan SNBP, analisis passing grade dan pemetaan saingan sekolah.', caption: `Jangan asal pilih jurusan! Susun strategi SNBP & seleksi mandiri berbasis data di otwptn. Kode referral: "${referralCode}" -> ${referralUrl}` },
    { id: 'demo-ecourse', slug: 'modul-video', title: 'Demo: Modul & Video E-Course (Skill Path Belajar)', feature: 'Modul & Video', category: 'Feed', duration: '00:15', videoUrl: '/promo-demos/modul-video.webp', previewImg: '/promo-demos/modul-video.png', desc: 'Screen recording materi kurikulum lengkap persiapan PTN, video penjelasan langkah demi langkah, dan rangkuman PDF.', caption: `Belajar terstruktur dari dasar sampai mahir dengan E-Course interaktif otwptn. Akses modulnya pakai kode "${referralCode}": ${referralUrl}` },
    { id: 'demo-tracking', slug: 'tracking-jalur', title: 'Demo: Tracking Jalur & Timeline Seleksi 15+ PTN', feature: 'Tracking Jalur', category: 'Feed', duration: '00:16', videoUrl: '/promo-demos/tracking-jalur.webp', previewImg: '/promo-demos/tracking-jalur.png', desc: 'Screen recording pemantauan jadwal buka-tutup pendaftaran jalur non-tes, tahapan berkas, dan notifikasi deadline.', caption: `Gak bakal ketinggalan deadline jalur masuk PTN lagi! Pantau timeline seleksi di otwptn pakai kode "${referralCode}": ${referralUrl}` },
    { id: 'demo-dokumen', slug: 'penyimpanan-dokumen', title: 'Demo: Penyimpanan Dokumen & Cloud Checklist', feature: 'Penyimpanan Dokumen', category: 'Feed', duration: '00:12', videoUrl: '/promo-demos/penyimpanan-dokumen.webp', previewImg: '/promo-demos/penyimpanan-dokumen.png', desc: 'Screen recording checklist berkas persyaratan (rapor, piagam prestasi, sertifikat) tersimpan rapi dan aman di cloud.', caption: `Simpan dan rapikan semua dokumen pendaftaran PTN kamu di satu tempat aman! Cek otwptn dengan kode "${referralCode}": ${referralUrl}` },
    { id: 'demo-teman', slug: 'cari-teman-belajar', title: 'Demo: Cari Teman Belajar (Otbee TV Study Buddy)', feature: 'Cari Teman Belajar', category: 'Landscape', duration: '00:15', videoUrl: '/promo-demos/cari-teman-belajar.webp', previewImg: '/promo-demos/cari-teman-belajar.png', desc: 'Screen recording matching sesama pejuang PTN berdasarkan target kampus & jurusan, dilengkapi Pomodoro timer.', caption: `Belajar bareng teman se-Indonesia yang punya target kampus sama! Coba fitur Cari Teman Belajar di otwptn: ${referralUrl}` },
    { id: 'demo-thread', slug: 'komunitas-thread', title: 'Demo: Komunitas Pejuang PTN (Feed Thread & Diskusi)', feature: 'Komunitas Thread', category: 'Feed', duration: '00:15', videoUrl: '/promo-demos/komunitas-thread.webp', previewImg: '/promo-demos/komunitas-thread.png', desc: 'Screen recording feed diskusi pejuang PTN, update info kuota, tanya jawab seputar seleksi, dan tips senior.', caption: `Gabung komunitas pejuang PTN paling aktif di Indonesia! Diskusi dan tanya tips di otwptn: ${referralUrl}` },
    { id: 'demo-group', slug: 'komunitas-group', title: 'Demo: Komunitas Circle (Group Chat Dark Mode)', feature: 'Komunitas Group', category: 'Story', duration: '00:16', videoUrl: '/promo-demos/komunitas-group.webp', previewImg: '/promo-demos/komunitas-group.png', desc: 'Screen recording room group chat eksklusif per kampus (UI, ITB, UGM) dengan tampilan WhatsApp Web dark mode.', caption: `Masuk Circle kampus impianmu dan ngobrol langsung bareng calon maba lain di otwptn! Daftar di ${referralUrl}` },
    { id: 'demo-mentor', slug: 'mentor-alumni', title: 'Demo: Mentor Alumni (1-on-1 Meet & VIP Docs Workspace)', feature: 'Mentor Alumni', category: 'Landscape', duration: '00:18', videoUrl: '/promo-demos/mentor-alumni.webp', previewImg: '/promo-demos/mentor-alumni.png', desc: 'Screen recording direktori mentor alumni resmi UI, ITB, UGM dan simulasi sesi bimbingan personal 1-on-1.', caption: `Dibimbing langsung sampai lolos oleh alumni UI, ITB, UGM! Booking mentor pilihanmu dengan kode "${referralCode}" di ${referralUrl}` },
    { id: 'demo-ambassador', slug: 'student-ambassador', title: 'Demo: Student Ambassador (Komisi & Leaderboard)', feature: 'Student Ambassador', category: 'Story', duration: '00:14', videoUrl: '/promo-demos/student-ambassador.webp', previewImg: '/promo-demos/student-ambassador.png', desc: 'Screen recording dashboard ambassador, pelacakan komisi tunai instan, pencairan saldo, dan materi promosi.', caption: `Dapat penghasilan jutaan sambil bantu teman lolos PTN impian! Gabung Student Ambassador otwptn sekarang: ${referralUrl}` },
  ]

  const filteredDemos = promoFilter === 'Semua' ? screenRecordDemos : screenRecordDemos.filter(d => d.category === promoFilter)

  const getCatalogData = () => {
    const tierItem = (tier: Tier, track: Track, label: string) => {
      const price = PRICE_MATRIX.individu[track][tier]
      return { name: label, orig: formatIDR(price.amount), codePrice: formatIDR(price.referralAmount ?? price.amount), sub: TIER_TAGLINES[tier], badge: TIER_BADGE[tier] }
    }
    const tierGroup = (tier: Tier) => [
      tierItem(tier, 'essay', `${TIER_LABELS[tier]} (Essay atau Prestasi)`),
      tierItem(tier, 'hybrid', `${TIER_LABELS[tier]} (Essay + Prestasi)`),
    ]
    switch (katalogCategory) {
      case 'Nectar': return { title: 'Harga Paket Nectar (Review)', items: tierGroup('review') }
      case 'Honeycomb': return { title: 'Harga Paket Honeycomb (Reguler)', items: tierGroup('dokumen') }
      case 'Queen Bee': return { title: 'Harga Paket Queen Bee (Intensif)', items: tierGroup('menyeluruh') }
      case 'Akun Premium': return { title: 'Harga Akun Premium (Fitur Only)', items: tierGroup('web_premium') }
      default: return { title: 'Daftar Harga Seluruh Paket Resmi', items: TIERS.map(tier => tierItem(tier, 'essay', `${TIER_LABELS[tier]} (mulai dari)`)) }
    }
  }
  const catalog = getCatalogData()

  return (
    <div className="space-y-10">
      {/* MATERI PROMOSI: DEMO FITUR */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Video size={18} className="text-amber-600" />
          <h2 className="text-lg font-black text-gray-900">Materi Promosi: Demo Fitur otwptn</h2>
        </div>
        <p className="text-xs text-gray-500 font-medium">
          Screen record demo fitur asli otwptn siap posting ke TikTok, Reels, dan WhatsApp Story. Kodemu sudah tercantum di caption.
        </p>

        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {(['Semua', 'Story', 'Feed', 'Landscape'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setPromoFilter(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-black transition-colors ${promoFilter === tab ? 'btn-brand-primary' : 'bg-white text-gray-700 hover:bg-gray-100 shadow-2xs'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredDemos.map(d => (
            <div key={d.id} className="rounded-3xl bg-white p-4 shadow-md flex flex-col justify-between space-y-3 hover-lift">
              <div className="space-y-3">
                <div
                  onClick={() => setActiveDemoVideo({ title: d.title, desc: d.desc, duration: d.duration, videoUrl: d.videoUrl, feature: d.feature })}
                  className="relative aspect-video rounded-2xl overflow-hidden bg-amber-50/70 border border-amber-100 cursor-pointer group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.previewImg} alt={d.title} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-white/90 text-gray-900 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Play size={16} fill="currentColor" className="ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 text-[10px] font-mono text-white bg-black/60 px-1.5 py-0.5 rounded-md">{d.duration}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">{d.feature}</span>
                  <h4 className="text-xs font-black text-gray-900 leading-snug mt-1.5">{d.title}</h4>
                  <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{d.desc}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-gray-100 text-center">
                <button
                  onClick={() => { const link = document.createElement('a'); link.href = d.videoUrl; link.download = `${d.slug}.webp`; link.click() }}
                  className="py-1.5 rounded-xl hover:bg-gray-100 text-[11px] font-bold text-gray-700 flex flex-col items-center gap-1 transition-colors"
                >
                  <Download size={14} /> Unduh
                </button>
                <button onClick={handleCopyLink} className="py-1.5 rounded-xl hover:bg-gray-100 text-[11px] font-bold text-gray-700 flex flex-col items-center gap-1 transition-colors">
                  <Share2 size={14} /> Bagikan
                </button>
                <button onClick={() => handleCopyCaption(d.id, d.caption)} className="py-1.5 rounded-xl hover:bg-gray-100 text-[11px] font-bold text-gray-700 flex flex-col items-center gap-1 transition-colors">
                  {copiedCaptionId === d.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />} Caption
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KATALOG HARGA / POSTER */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Tag size={18} className="text-amber-600" />
          <h2 className="text-lg font-black text-gray-900">Katalog Harga (Semua Mode & Rasio)</h2>
        </div>
        <p className="text-xs text-gray-500 font-medium">
          Gambar daftar harga per mode lengkap dengan harga pakai kodemu. Pilih kategori dan rasio untuk mengunduh poster siap posting.
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {[
              { id: 'Semua', label: 'Semua Paket' },
              { id: 'Nectar', label: 'Nectar (Review)' },
              { id: 'Honeycomb', label: 'Honeycomb (Reguler)' },
              { id: 'Queen Bee', label: 'Queen Bee (VIP)' },
              { id: 'Akun Premium', label: 'Akun Premium' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setKatalogCategory(cat.id as typeof katalogCategory)}
                className={`px-4 py-1.5 rounded-full text-xs font-black transition-colors ${katalogCategory === cat.id ? 'btn-brand-primary' : 'bg-white text-gray-700 hover:bg-gray-100 shadow-2xs'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {(['Story 9:16', 'Feed 4:5'] as const).map(asp => (
              <button
                key={asp}
                onClick={() => setPosterAspect(asp)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${posterAspect === asp ? 'bg-amber-100 text-amber-900' : 'bg-white text-gray-600 hover:bg-gray-100 shadow-2xs'}`}
              >
                {asp}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center pt-2">
          <div
            className={`w-full max-w-sm rounded-3xl p-6 shadow-xl relative overflow-hidden transition-all ${posterAspect === 'Story 9:16' ? 'min-h-[640px]' : 'min-h-[520px]'}`}
            style={{ background: 'linear-gradient(180deg, #dcfce7 0%, #f0fdf4 25%, #ffffff 50%, #fefce8 100%)', border: '4px solid #ffffff' }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900">OTWPTN</span>
                <h3 className="text-2xl font-black text-gray-950 mt-0.5 tracking-tight">{catalog.title}</h3>
                <div className="mt-1 flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-500 font-semibold">Pakai kode</span>
                  <span className="px-2.5 py-0.5 rounded-md text-[11px] font-black bg-amber-400 text-amber-950 shadow-2xs font-mono">{referralCode}</span>
                </div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mascot/check-paper-happy.png" alt="Otbee" className="w-18 h-18 object-contain drop-shadow-sm" />
            </div>

            <div className="space-y-3 my-4">
              {catalog.items.map((item, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-white shadow-xs border border-gray-100/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-gray-900 truncate max-w-[170px]">{item.name}</span>
                    <div className="text-right">
                      <span className="text-[9px] text-gray-400 uppercase font-bold block">pakai kode</span>
                      <span className="px-2 py-0.5 rounded-md text-xs font-black bg-amber-400 text-amber-950 inline-block font-mono">{item.codePrice}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <span className="line-through text-gray-400">{item.orig}</span>
                  </div>
                  {item.sub && <p className="text-[9px] text-gray-400 font-medium truncate">{item.sub}</p>}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-gray-200/50 text-center space-y-1">
              <p className="text-[9px] text-gray-500">Harga pakai kode berlaku untuk paket bermentor mode Individu</p>
              <p className="text-[11px] font-black text-gray-900 font-mono">Daftar di otwptn.com/upgrade?ref={referralCode}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <button onClick={handleDownloadPoster} className="px-5 py-2.5 rounded-full text-xs font-bold bg-white hover:bg-gray-50 text-gray-900 shadow-xs flex items-center gap-1.5">
              <Download size={14} /> Unduh Poster
            </button>
            <button onClick={handleCopyLink} className="px-5 py-2.5 rounded-full text-xs font-bold bg-white hover:bg-gray-50 text-gray-900 shadow-xs flex items-center gap-1.5">
              <Share2 size={14} /> Bagikan
            </button>
            <button
              onClick={() => handleCopyCaption('katalog', `Dapatkan diskon potongan langsung untuk ${catalog.title} di otwptn dengan kode promo "${referralCode}". Akses di ${referralUrl}`)}
              className="px-5 py-2.5 rounded-full text-xs font-bold bg-white hover:bg-gray-50 text-gray-900 shadow-xs flex items-center gap-1.5"
            >
              <Copy size={14} /> {copiedCaptionId === 'katalog' ? 'Tersalin!' : 'Salin caption'}
            </button>
          </div>
        </div>
      </div>

      {activeDemoVideo && (
        <InteractiveFeatureDemoPlayer
          title={activeDemoVideo.title}
          desc={activeDemoVideo.desc}
          feature={activeDemoVideo.feature}
          duration={activeDemoVideo.duration}
          videoUrl={activeDemoVideo.videoUrl}
          onClose={() => setActiveDemoVideo(null)}
        />
      )}
    </div>
  )
}
