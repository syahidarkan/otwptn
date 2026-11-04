import Link from 'next/link'
import Image from 'next/image'
import { Home, Calculator, Sparkles, BookOpen, ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full space-y-6">
        {/* Mascot / Visual */}
        <div className="relative w-36 h-36 mx-auto">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot/otbee-flying.png"
            alt="Otbee Bingung"
            className="w-full h-full object-contain filter drop-shadow-md animate-bounce"
            style={{ animationDuration: '3s' }}
          />
        </div>

        <div>
          <span className="text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
            Error 404 - Halaman Tidak Ditemukan
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-gray-950 mt-3">
            Wah, Halamannya Tersasar!
          </h1>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            Halaman yang kamu cari mungkin telah dipindahkan, berganti nama, atau link yang kamu klik salah ketik.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <Link
            href="/"
            className="btn-brand-primary w-full py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-sm"
          >
            <Home size={15} /> Kembali ke Halaman Utama
          </Link>

          <Link
            href="/dashboard/kalkulator"
            className="w-full py-3.5 rounded-2xl text-xs font-bold bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <Calculator size={15} className="text-amber-600" /> Cek Peluang Rapor di Kalkulator
          </Link>

          <Link
            href="/dashboard/otbee"
            className="w-full py-3.5 rounded-2xl text-xs font-bold bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles size={15} className="text-amber-500" /> Tanya Otbee AI Consultant
          </Link>
        </div>

        <p className="text-[11px] text-gray-400 font-medium">
          otwptn.com - Platform Bimbingan Jalur Non-Tes PTN No. 1 di Indonesia
        </p>
      </div>
    </div>
  )
}

