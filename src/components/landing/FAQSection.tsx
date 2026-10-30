'use client'

// Adapted from pintarly / eja - FAQ accordion (white card, subtle shadow, no gradient)

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const FAQS = [
  {
    q: 'Apa itu jalur non-tes PTN dan apa saja contohnya?',
    a: 'Jalur non-tes adalah mekanisme seleksi masuk Perguruan Tinggi Negeri tanpa ujian tulis/CBT. Seleksi murni dinilai berdasarkan rekam jejak akademik (nilai rapor semester 1-5), kurasi prestasi/sertifikat, essay motivasi, dan portofolio. Contohnya: SNBP Nasional, PPKB & Talent Scouting UI, PBUB UGM, SJP IPB (Ketua OSIS), SMUP Prestasi Unpad, dan Mandiri Prestasi ITS/UNAIR.',
  },
  {
    q: 'Bagaimana AI otwptn menghitung peluang lolos SNBP & Jalur Prestasi?',
    a: 'AI kami menganalisis nilai rapor mata pelajaran pendukung prodi, konsistensi tren nilai semester 1-5, akreditasi sekolah, rekam jejak alumni di PTN tujuan, hingga validitas sertifikat juara (Puspresnas/BPTI). Hasilnya memberikan kalkulasi objektif agar kamu tidak bertabrakan dengan teman satu sekolah.',
  },
  {
    q: 'Apakah review essay motivasi hanya dari AI atau ada mentor manusia?',
    a: 'Di otwptn kamu mendapatkan keduanya! AI kami menganalisis struktur esai, grammar, kejelasan argumen, dan logika dalam hitungan detik. Di Paket Nectar, Honeycomb, dan Queen Bee (Royal Jelly), esaimu juga dibedah langsung oleh mentor alumni kampus impian (UI, ITB, UGM) secara tatap muka via Zoom & Google Docs.',
  },
  {
    q: 'Sertifikat apa saja yang diakui dan bisa dikurasi di platform?',
    a: 'Semua sertifikat juara lomba akademik (OSN/KSN, OPSI, LKTI), non-akademik (O2SN, FLS2N), kepemimpinan (Ketua OSIS/MPK), hingga kejuaraan internasional yang terkurasi Puspresnas/Kemendikbudristek. Platform kami membantu memilih 3 sertifikat terbaik dengan bobot poin tertinggi.',
  },
  {
    q: 'Apa saja paket belajar yang tersedia di otwptn?',
    a: 'Kami menyediakan Akun Premium (Rp49.000 sekali bayar untuk unlock semua fitur AI & modul), Paket Nectar (Rp99.000 dengan 2x review esai mentor), Paket Honeycomb (Rp199.000 dengan 5x revisi + 2x sesi Zoom privat), dan Paket Queen Bee / Royal Jelly VIP (Rp399.000 bimbingan intensif unlimited sampai hari pengumuman + Campus Tour UI).',
  },
  {
    q: 'Bagaimana cara kerja fitur Cari Teman Belajar (Tatap Muka Virtual)?',
    a: 'Konsepnya mirip OmeTV edukasi khusus pejuang PTN. Kamu bisa langsung terhubung tatap muka virtual dengan pejuang PTN lain dari seluruh Indonesia tanpa perlu login atau instal aplikasi tambahan. Kamu bisa sharing strategi, bertukar draf essay, atau sekadar belajar bareng biar gak jenuh.',
  },
  {
    q: 'Apakah data nilai rapor, essay motivasi, dan dokumen saya aman?',
    a: 'Sangat aman. Seluruh data rapor, draft essay, dan file sertifikatmu disimpan dengan enkripsi tingkat bank di Supabase Storage & Database pribadi kamu. Data tidak pernah disebarluaskan, diperjualbelikan, atau dijadikan materi publik tanpa izin tertulismu.',
  },
]

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="pt-16 pb-20 md:pb-28 px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-2xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="text-section-heading text-fg text-center mb-10"
        >
          Pertanyaan yang sering ditanyakan
        </motion.h2>

        <div className="space-y-2">
          {FAQS.map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.05 * i, ease: 'easeOut' }}
              className="card overflow-hidden"
            >
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left">
                <span className="text-sm font-semibold text-fg">{f.q}</span>
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--bg-alt)' }}>
                  {open === i ? <Minus size={11} /> : <Plus size={11} />}
                </div>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>{f.a}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
