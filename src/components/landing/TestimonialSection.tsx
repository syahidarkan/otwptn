'use client'

// Adapted from aimasukptn — two-row opposite-direction testimonial marquee

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const ROW1 = [
  { n: 'Caca Evelyn', t: 'FK UI • PPKB 2026', q: 'Awalnya skeptis sama essay AI review, tapi pas dicoba feedback-nya detail bgt sampe ke tone kalimat & struktur motivasi. Skor esaiku naik dr 72 ke 94 dan alhamdulillah tembus FK UI!' },
  { n: 'Ibrahim Wongso', t: 'STEI ITB • Jalur Prestasi', q: 'Kalkulator peluangnya beneran ngasih insight realistis soal indeks sekolah & rerata mapel pendukung. Jadi gak asal nekat milih prodi, fix kebantu bgt!' },
  { n: 'Nayla Andhara', t: 'HI UGM • SNBP 2026', q: 'Sesi 1-on-1 bareng mentor alumni UGM ngebuka mataku bgt. Esai personal statement-ku dibedah langsung kalimat per kalimat di GDocs sampe bener-bener solid.' },
  { n: 'Kevin Reynard', t: 'Aktuaria ITS • SNBP 2026', q: 'Fitur kurasi sertifikatnya ngebantu milih 3 piagam terbaik yg bener-bener diakui Puspresnas. Gak sia-sia langganan Paket Honeycomb!' },
  { n: 'Audrey Michelle', t: 'Ilkom Unpad • SMUP 2026', q: 'Fitur cari teman belajarnya seru parah! Bisa ketemu sesama pejuang PTN tanpa ribet login, saling semangatin dan koreksi esai pas malem.' },
]

const ROW2 = [
  { n: 'Rafif Al-Ghifari', t: 'Teknik Mesin UI • PPKB', q: 'Modul videonya daging semua, gak bertele-tele. Terutama materi cara nulis esai tanpa klise "sejak kecil saya bercita-cita". Berkat ini lolos pilihan 1!' },
  { n: 'Tasya Kamila Putri', t: 'Psikologi UNAIR • SNBP', q: 'Suka bgt sama Otbee AI, fast response dan selalu ngasih saran taktis tiap kali overthinking mikirin persaingan kuota satu sekolah.' },
  { n: 'Darryl Pratama', t: 'DKV FSRD ITB • Portofolio', q: 'Review portofolio dan esai dari mentor senior alumni ITB beneran detail. Dikasih tau apa yg dicari dosen penilai dan cara menonjolkan keunikan karya.' },
  { n: 'Celine Jessica', t: 'Manajemen UB • SNBP 2026', q: 'Tracking jalurnya ngebantu bgt biar gak kelewat deadline berkas PPKB sama SNBP. Semua dokumen rapi tersimpan di satu dashboard.' },
  { n: 'Zidan Ramadhan', t: 'Sistem Informasi Undip', q: 'Worth it bgt buat anak kelas 12 yg bingung mau mulai dr mana. Dari rasionalisasi rapor semester 1-5 sampe simulasi wawancara beneran didampingi!' },
]

function Card({ n, t, q }: { n: string; t: string; q: string }) {
  return (
    <div className="flex-shrink-0 w-80 rounded-2xl p-5" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill="#ffd400" stroke="none" />)}
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--muted-2)' }}>{t}</span>
      </div>
      <p className="text-sm leading-relaxed text-fg mb-4">{q}</p>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'var(--accent)', color: 'var(--accent-ink)' }}>{n[0]}</div>
        <span className="text-xs font-semibold text-fg">{n}</span>
      </div>
    </div>
  )
}

export default function TestimonialSection() {
  const row1 = [...ROW1, ...ROW1]
  const row2 = [...ROW2, ...ROW2]

  return (
    <section className="py-16 overflow-hidden" style={{ background: 'var(--bg-alt)' }}>
      <div className="max-w-4xl mx-auto px-4 text-center mb-10">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="text-section-heading text-fg"
        >
          500+ camaba <span className="pill-highlight">udah buktiin</span>
        </motion.h2>
      </div>

      <div className="relative mb-4">
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, var(--bg-alt), transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, var(--bg-alt), transparent)' }} />
        <div className="animate-marquee flex gap-4" style={{ width: 'max-content' }}>
          {row1.map((c, i) => <Card key={i} {...c} />)}
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, var(--bg-alt), transparent)' }} />
        <div className="absolute right-0 top-0 bottom-0 w-20 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, var(--bg-alt), transparent)' }} />
        <div className="animate-marquee-reverse flex gap-4" style={{ width: 'max-content' }}>
          {row2.map((c, i) => <Card key={i} {...c} />)}
        </div>
      </div>
    </section>
  )
}
