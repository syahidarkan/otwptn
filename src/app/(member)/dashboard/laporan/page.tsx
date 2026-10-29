'use client'

import { useState } from 'react'
import FeatureHeader from '@/components/dashboard/FeatureHeader'
import {
  MessageSquare,
  Send,
  CheckCircle2,
  HelpCircle,
  Bug,
  Lightbulb,
  Heart,
  Upload,
} from 'lucide-react'

export default function LaporanSaranPage() {
  const [category, setCategory] = useState<'saran' | 'bug' | 'pertanyaan' | 'apresiasi'>('saran')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="w-full px-6 md:px-8 py-8 md:py-10">
      <FeatureHeader
        title="Saran, Masukan & Laporan"
        subtitle="Suaramu sangat berarti untuk terus menyempurnakan platform otwptn menjadi teman belajar terbaik pejuang PTN."
        mascot="/fitur/otbee-ai.png"
        badgeText="Feedback Center"
      />

      <div className="p-6 md:p-8 rounded-3xl bg-white shadow-md">
        {submitted ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-lg font-black text-gray-900">Terima Kasih Atas Masukanmu!</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              Laporanmu telah berhasil kami terima dan akan segera ditinjau oleh tim pengembang otwptn untuk rilis update platform berikutnya.
            </p>
            <button
              onClick={() => {
                setSubmitted(false)
                setSubject('')
                setDescription('')
              }}
              className="btn-brand-primary px-6 py-2.5 rounded-full text-xs font-black inline-block mt-4"
            >
              Kirim Masukan Lainnya
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-gray-700 mb-2 block">
                Kategori Masukan
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'saran', label: 'Ide Fitur Baru', icon: Lightbulb },
                  { id: 'bug', label: 'Laporan Bug', icon: Bug },
                  { id: 'pertanyaan', label: 'Pertanyaan', icon: HelpCircle },
                  { id: 'apresiasi', label: 'Apresiasi', icon: Heart },
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCategory(item.id as typeof category)}
                    className={`p-3 rounded-2xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      category === item.id
                        ? 'btn-brand-primary shadow-xs'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon size={16} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                Judul Ringkas Masukan
              </label>
              <input
                value={subject}
                onChange={e => setSubject(e.target.value)}
                required
                placeholder="cth: Mohon tambahkan kalkulator rata-rata untuk Kurikulum Merdeka"
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 text-xs font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 mb-1.5 block">
                Penjelasan Detail
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                required
                rows={5}
                placeholder="Ceritakan kendala yang kamu alami atau ide fitur yang kamu harapkan secara jelas..."
                className="w-full px-4 py-3 rounded-2xl bg-gray-50 text-xs font-medium text-gray-900 outline-none focus:ring-2 focus:ring-amber-400 resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              className="w-full btn-brand-primary py-3.5 rounded-full text-xs font-black shadow-md flex items-center justify-center gap-2 mt-2"
            >
              <Send size={15} /> Kirimkan Masukan Sekarang
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
