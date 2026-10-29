'use client'

import React from 'react'
import Link from 'next/link'
import {
  BookOpen,
  ShieldCheck,
  Clock,
  MessageCircle,
  Video,
  FileText,
  AlertTriangle,
  Award,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Lock,
  Compass,
  Monitor,
  Users,
  HeartHandshake,
  Calendar,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { LEGAL_ENTITY } from '@/lib/constants'

export default function MentorSOPPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Hero Header */}
      <div className="p-7 sm:p-8 rounded-3xl bg-white shadow-md space-y-3 border-0">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
          Standard Operating Procedure Resmi · {LEGAL_ENTITY.name}
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-gray-950 tracking-tight">
          Buku Panduan & SOP Lengkap Mentor Alumni
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium max-w-3xl leading-relaxed">
          Pedoman operasional lengkap yang mengikat seluruh mentor alumni resmi di bawah naungan{' '}
          <strong className="text-gray-900">{LEGAL_ENTITY.name}</strong>. Menjabarkan tata cara penguasaan teknis web, alur penerimaan mentee baru, etika komunikasi, tata tertib sesi tatap muka, hingga prosedur kurasi esai dan analisis kelulusan PTN.
        </p>
        <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Dokumen Berlaku Penuh Periode 2026/2027
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-bold">
            Versi SOP: 2.4 (Revisi Lengkap)
          </span>
        </div>
      </div>

      {/* BAB 1: TEKNIK PENGGUNAAN WEB UNTUK MENTOR */}
      <div className="p-7 sm:p-8 rounded-3xl bg-white shadow-md space-y-6 border-0">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
            <Monitor size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-950">BAB 1: Penguasaan Teknis Platform Web OtwPTN</h2>
            <p className="text-xs text-gray-500 font-medium">Cara menggunakan fitur-fitur portal mentor untuk memaksimalkan bimbingan.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-gray-50 space-y-2">
            <h3 className="font-black text-gray-900 flex items-center gap-2">
              <Users size={16} className="text-amber-600" /> 1.1 Navigasi Mentee Workspace
            </h3>
            <p className="text-gray-600 leading-relaxed font-medium">
              Di halaman <strong className="text-gray-900">Mentee Saya</strong>, mentor dapat melihat seluruh daftar siswa bimbingan yang ter-assign. Klik nama mentee untuk membuka laci dokumen lengkap: data sekolah, target PTN pil 1 & pil 2, transkrip nilai rapor 5 semester, dan file portofolio sertifikat.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 space-y-2">
            <h3 className="font-black text-gray-900 flex items-center gap-2">
              <FileText size={16} className="text-amber-600" /> 1.2 Collaborative Editor ala Google Docs
            </h3>
            <p className="text-gray-600 leading-relaxed font-medium">
              Gunakan editor interaktif untuk membedah draf esai mentee kalimat demi kalimat. Mentor dapat menyorot kata yang klise, memberikan saran perbaikan langsung, menyisipkan komentar feedback, dan memeriksa batas maksimal kata secara live.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 space-y-2">
            <h3 className="font-black text-gray-900 flex items-center gap-2">
              <Calendar size={16} className="text-amber-600" /> 1.3 Pengaturan Blackout Dates (Jadwal)
            </h3>
            <p className="text-gray-600 leading-relaxed font-medium">
              Di menu <strong className="text-gray-900">Jadwal</strong>, mentor wajib menandai tanggal berhalangan (*Blackout Dates*) minimal H-2 sebelum hari H agar jadwal tersebut terkunci dan tidak bisa dibooking oleh mentee.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 space-y-2">
            <h3 className="font-black text-gray-900 flex items-center gap-2">
              <MessageCircle size={16} className="text-amber-600" /> 1.4 Input Link Zoom & Grup WA
            </h3>
            <p className="text-gray-600 leading-relaxed font-medium">
              Pada setiap kartu mentee, terdapat kolom untuk menyimpan tautan Google Meet / Zoom resmi dan tautan undangan grup WhatsApp agar tersinkronisasi otomatis ke dashboard siswa.
            </p>
          </div>
        </div>
      </div>

      {/* BAB 2: PROSEDUR KETIKA ADA MENTEE BARU MASUK */}
      <div className="p-7 sm:p-8 rounded-3xl bg-white shadow-md space-y-6 border-0">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black">
            <Clock size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-950">BAB 2: Protokol 24 Jam Pertama Mentee Baru</h2>
            <p className="text-xs text-gray-500 font-medium">Tahapan wajib yang harus dilakukan sesaat setelah menerima penugasan mentee.</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-5 rounded-2xl bg-blue-50/50 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-[11px]">1</span>
              <h3 className="font-black text-blue-950 text-sm">Review Profil & Berkas Sebelum Menghubungi</h3>
            </div>
            <p className="text-gray-700 leading-relaxed font-medium pl-8">
              Buka profil mentee di dashboard. Pelajari target universitas dan program studi yang dipilih, periksa tren nilai rapor semester 1 sampai 5, serta baca draf esai awal jika sudah diunggah. Jangan pernah menghubungi mentee dalam keadaan buta informasi mengenai latar belakangnya.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-amber-50/60 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-amber-950 font-black flex items-center justify-center text-[11px]">2</span>
              <h3 className="font-black text-amber-950 text-sm">Wajib Inisiasi Grup WhatsApp Bertiga (Maksimal 6 Jam)</h3>
            </div>
            <p className="text-gray-700 leading-relaxed font-medium pl-8">
              Mentor <strong className="text-gray-950">WAJIB</strong> membuat grup WhatsApp yang beranggotakan: <strong className="text-gray-950">Mentor + Mentee + Admin Resmi OtwPTN</strong>. Dilarang keras berkomunikasi di grup tanpa adanya pengawasan admin. Salin tautan undangan grup tersebut ke kolom link WhatsApp di dashboard.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-gray-800 text-white font-black flex items-center justify-center text-[11px]">3</span>
              <h3 className="font-black text-gray-950 text-sm">Template Sapaan Resmi Perkenalan</h3>
            </div>
            <div className="p-4 rounded-xl bg-white text-gray-700 font-mono text-[11px] leading-relaxed border border-gray-100 pl-4">
              Halo [Nama Mentee]! Salam kenal, aku [Nama Mentor], alumni [Almamater PTN & Jurusan]. Mulai hari ini aku akan mendampingi kamu sebagai mentor resmi otwptn untuk persiapan lolos jalur [Jalur Masuk] menuju [Target PTN]. Selamat datang di grup bimbingan resmi kita ya! Sebagai langkah awal, yuk kita agendakan sesi kick-off perkenalan melalui link jadwal di dashboard.
            </div>
          </div>
        </div>
      </div>

      {/* BAB 3: ETIKA KOMUNIKASI & CARA MENGHADAPI MENTEE */}
      <div className="p-7 sm:p-8 rounded-3xl bg-white shadow-md space-y-6 border-0">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
            <HeartHandshake size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-950">BAB 3: Protokol Komunikasi & Interaksi dengan Mentee</h2>
            <p className="text-xs text-gray-500 font-medium">Panduan sikap, jam operasional, dan penanganan mentee yang cemas/bingung.</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-4 rounded-2xl bg-gray-50 space-y-1.5">
            <h4 className="font-black text-gray-900">3.1 Jam Operasional & SLA Respon</h4>
            <p className="text-gray-600 leading-relaxed font-medium">
              Jam aktif chat bimbingan adalah pukul <strong className="text-gray-900">08.00 - 21.00 WIB</strong>. Mentor wajib merespon pertanyaan mentee dan membalas draf esai dalam waktu maksimal <strong className="text-gray-900">1x24 jam kerja</strong>. Jika berhalangan karena urusan mendesak, wajib memberi tahu mentee dan admin di grup.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 space-y-1.5">
            <h4 className="font-black text-gray-900">3.2 Cara Menjelaskan Jika Mentee Bingung atau Panik</h4>
            <p className="text-gray-600 leading-relaxed font-medium">
              Banyak siswa kelas 12 mengalami tekanan berat (*impostor syndrome*). Gunakan pendekatan empati: validasi kekhawatiran mereka, hindari meremehkan pilihan atau nilai rapor mereka, dan jelaskan strategi dengan data rasionalisasi (analisis kuota, daya tampung, dan pembobotan mata pelajaran pendukung).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 space-y-1.5">
            <h4 className="font-black text-gray-900">3.3 Batasan Profesionalisme</h4>
            <p className="text-gray-600 leading-relaxed font-medium">
              Jaga jarak profesional yang santun. Dilarang meminjamkan uang, meminta imbalan tambahan di luar platform otwptn, atau melakukan kontak personal yang melanggar norma kesopanan dan etika akademik.
            </p>
          </div>
        </div>
      </div>

      {/* BAB 4: SOP KHUSUS REVISI ESAI & ANTI-JOKI */}
      <div className="p-7 sm:p-8 rounded-3xl bg-white shadow-md space-y-6 border-0">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-black">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-950">BAB 4: Standar Kurasi Esai & Aturan Anti-Joki</h2>
            <p className="text-xs text-gray-500 font-medium">Integritas akademik adalah nilai utama PT. Lembaga Sains Nasional.</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-rose-50 text-rose-950 text-xs space-y-2">
          <div className="flex items-center gap-2 font-black text-rose-900 text-sm">
            <AlertTriangle size={17} /> LARANGAN KERAS PRAKTIK JOKI (ZERO-TOLERANCE)
          </div>
          <p className="leading-relaxed font-medium">
            Mentor <strong className="text-rose-900 underline">DILARANG KERAS</strong> menuliskan esai dari nol untuk mentee atau membuatkan draf pengganti. Peran mentor adalah <strong className="text-gray-950">pengarah ide, pengoreksi alur logika, penyempurna tata bahasa, dan kurator keaslian narasi siswa</strong>. Pelanggaran aturan joki berakibat pemutusan kemitraan sepihak dan pencabutan hak honorarium.
          </p>
        </div>

        <div className="space-y-3 text-xs">
          <h4 className="font-black text-gray-900 text-sm">4.1 Parameter Kualitas Esai PTN Unggulan</h4>
          <ul className="space-y-2 list-disc pl-5 text-gray-600 font-medium">
            <li><strong className="text-gray-900">Hook Pembuka Autentik:</strong> Menghindari kalimat klise pembuka seperti "Sejak kecil saya bercita-cita...". Ganti dengan insiden spesifik pemantik rasa ingin tahu.</li>
            <li><strong className="text-gray-900">Linieritas Akademis:</strong> Menghubungkan capaian prestasi/kejuaraan dengan silabus mata kuliah program studi yang dituju.</li>
            <li><strong className="text-gray-900">Bukti Konkret & Problem Solving:</strong> Menunjukkan kepemimpinan nyata di sekolah/organisasi menggunakan metode STAR (Situation, Task, Action, Result).</li>
            <li><strong className="text-gray-900">Visi Pasca-Lulus:</strong> Menyusun rencana kontribusi nyata bagi masyarakat setelah lulus dari PTN terkait.</li>
          </ul>
        </div>
      </div>

      {/* BAB 5: SOP SESI TATAP MUKA PRIVAT ZOOM */}
      <div className="p-7 sm:p-8 rounded-3xl bg-white shadow-md space-y-6 border-0">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-black">
            <Video size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-950">BAB 5: Tata Tertib Sesi Mentoring 1-on-1 (Zoom / Meet)</h2>
            <p className="text-xs text-gray-500 font-medium">Standar pelaksanaan sesi tatap muka untuk paket Honeycomb dan Queen Bee.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-gray-50 space-y-2">
            <h4 className="font-black text-gray-900">5.1 Persiapan Sebelum Sesi</h4>
            <p className="text-gray-600 leading-relaxed font-medium">
              Mentor wajib hadir di room Zoom minimal 5 menit sebelum jadwal. Pastikan kamera on dengan pencahayaan cukup, latar belakang rapi/virtual background resmi, dan mikrofon jernih tanpa gangguan bising.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 space-y-2">
            <h4 className="font-black text-gray-900">5.2 Alokasi Waktu 45 Menit</h4>
            <p className="text-gray-600 leading-relaxed font-medium">
              Sesi berjalan minimal 45 menit dengan pembagian: 5 menit salam & ice-breaking, 25 menit bedah esai/rapor mendalam dengan *screen sharing*, 10 menit sesi tanya-jawab siswa, dan 5 menit kesimpulan *action plan*.
            </p>
          </div>
        </div>
      </div>

      {/* BAB 6: KEWAJIBAN KHUSUS PAKET VIP QUEEN BEE */}
      <div className="p-7 sm:p-8 rounded-3xl bg-white shadow-md space-y-6 border-0">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center font-black">
            <Sparkles size={20} />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-950">BAB 6: Kewajiban Khusus Paket VIP (Queen Bee / Royal Jelly)</h2>
            <p className="text-xs text-gray-500 font-medium">Deliverables wajib yang harus dibuat oleh mentor bagi siswa paket VIP.</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-amber-50/70 text-xs space-y-2.5">
          <h4 className="font-black text-amber-950 text-sm flex items-center gap-2">
            <Award size={16} className="text-amber-600" />
            Wajib Menyusun Dokumen Rekomendasi Pilihan 1 & 2
          </h4>
          <p className="text-gray-700 leading-relaxed font-medium">
            Untuk mentee paket Queen Bee, mentor <strong className="text-gray-900">wajib membuat Dokumen Analisis Rasionalisasi Pilihan 1 & 2</strong> yang membedah:
          </p>
          <ul className="space-y-1.5 list-disc pl-5 text-gray-700 font-medium">
            <li>Kesesuaian nilai rapor mata pelajaran pendukung dengan syarat prodi di PTN tujuan.</li>
            <li>Relevansi bobot sertifikat prestasi kejuaraan terhadap kuota seleksi.</li>
            <li>Pemetaan persaingan eligible sekolah dan strategi mitigasi risiko di Pilihan 2.</li>
          </ul>
        </div>
      </div>

      {/* BAB 7: KEUANGAN, KODE ETIK & SANKSI */}
      <div className="p-7 sm:p-8 rounded-3xl bg-white shadow-md space-y-4 border-0 text-xs">
        <h3 className="font-black text-gray-950 text-base flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-600" />
          BAB 7: Kebijakan Keuangan, Kode Etik & Sanksi
        </h3>
        <p className="text-gray-600 leading-relaxed font-medium">
          Honorarium mentor dihitung transparan per mentee yang selesai dibimbing dan dicairkan setiap tanggal 1 sampai 5 bulan berjalan. Keterlambatan respon tanpa keterangan, pembatalan sesi sepihak, atau pelanggaran kerahasiaan berkas siswa akan dikenai sanksi pemotongan poin kinerja dan penonaktifan akun mentor.
        </p>
      </div>

      {/* Action Footer */}
      <div className="p-6 rounded-3xl bg-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-black text-gray-900 text-sm">Butuh Bantuan atau Ada Kasus Khusus Mentee?</h4>
          <p className="text-xs text-gray-500 font-medium">Tim supervisi akademik siap mendampingi mentor 24/7.</p>
        </div>
        <Link
          href="/mentor/dashboard"
          className="btn-brand-primary px-7 py-3 rounded-full text-xs font-black shadow-md inline-flex items-center gap-2"
        >
          Kembali ke Workspace Mentee <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}
