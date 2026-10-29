'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import { ArrowLeft, Check, Flame, Sparkles, Plus, Minus, Lock, Star, X, ChevronDown, Trash2, Upload } from 'lucide-react'
import ParticleField from './_components/ParticleField'
import HoldButton from './_components/HoldButton'
import GrowthCurve from './_components/GrowthCurve'
import { fireConfetti } from './_components/confetti'
import { playSfx, playFanfare } from './_components/sfx'

// ── PTN list ─────────────────────────────────────────────────────────────────

const PTN_LIST = [
  { code: 'ui',    name: 'Universitas Indonesia',              logo: '/ptn-logos/ui.png' },
  { code: 'itb',   name: 'Institut Teknologi Bandung',         logo: '/ptn-logos/itb.png' },
  { code: 'ugm',   name: 'Universitas Gadjah Mada',            logo: '/ptn-logos/ugm.png' },
  { code: 'its',   name: 'Institut Teknologi Sepuluh Nopember',logo: '/ptn-logos/its.png' },
  { code: 'unpad', name: 'Universitas Padjadjaran',             logo: '/ptn-logos/unpad.png' },
  { code: 'unair', name: 'Universitas Airlangga',               logo: '/ptn-logos/unair.png' },
  { code: 'undip', name: 'Universitas Diponegoro',              logo: '/ptn-logos/undip.png' },
  { code: 'ipb',   name: 'IPB University',                      logo: '/ptn-logos/ipb.png' },
  { code: 'ub',    name: 'Universitas Brawijaya',               logo: '/ptn-logos/ub.png' },
  { code: 'uns',   name: 'Universitas Sebelas Maret',           logo: '/ptn-logos/uns.png' },
  { code: 'unhas', name: 'Universitas Hasanuddin',              logo: '/ptn-logos/unhas.png' },
  { code: 'unand', name: 'Universitas Andalas',                 logo: '/ptn-logos/unand.png' },
  { code: 'uny',   name: 'Universitas Negeri Yogyakarta',       logo: '/ptn-logos/uny.png' },
  { code: 'unnes', name: 'Universitas Negeri Semarang',         logo: '/ptn-logos/unnes.png' },
  { code: 'unsoed',name: 'Universitas Jenderal Soedirman',      logo: '/ptn-logos/unsoed.png' },
  { code: 'usu',   name: 'Universitas Sumatera Utara',          logo: '/ptn-logos/usu.svg' },
]

// ── Jurusan comprehensive list ────────────────────────────────────────────────

const JURUSAN_LIST = [
  // Kesehatan
  'Kedokteran','Kedokteran Gigi','Farmasi','Keperawatan','Kebidanan',
  'Kesehatan Masyarakat','Gizi','Fisioterapi','Rekam Medis & Informasi Kesehatan',
  'Radiologi','Analis Kesehatan','Kedokteran Hewan / Veteriner','Ilmu Keolahragaan',
  // Teknik
  'Teknik Sipil','Teknik Mesin','Teknik Elektro','Teknik Kimia','Teknik Industri',
  'Teknik Informatika / Rekayasa Perangkat Lunak','Teknik Lingkungan','Arsitektur',
  'Teknik Perkapalan / Sistem Perkapalan','Teknik Pertambangan','Teknik Geologi',
  'Teknik Geodesi & Geomatika','Teknik Material / Metalurgi','Teknik Nuklir',
  'Teknik Biomedik','Teknik Penerbangan','Perencanaan Wilayah dan Kota',
  'Teknik Perminyakan','Teknik Kelautan',
  // MIPA & Komputasi
  'Matematika','Fisika','Kimia','Biologi','Statistika','Aktuaria',
  'Ilmu Komputer / Sains Komputasi','Sistem Informasi','Teknologi Informasi',
  'Informatika','Teknik Komputer','Bisnis Sistem Informasi',
  'Astronomi','Geofisika','Oseanografi','Ilmu Lingkungan','Geografi',
  // Sosial & Politik
  'Ilmu Hubungan Internasional','Ilmu Politik','Sosiologi','Antropologi',
  'Ilmu Komunikasi','Ilmu Administrasi Negara','Ilmu Administrasi Bisnis',
  'Kriminologi','Ilmu Kesejahteraan Sosial','Kajian Wilayah',
  // Hukum
  'Ilmu Hukum','Hukum Internasional','Hukum Bisnis',
  // Ekonomi & Bisnis
  'Ilmu Ekonomi','Manajemen','Akuntansi','Bisnis','Ekonomi Pembangunan',
  'Ekonomi Islam','Bisnis Digital','Keuangan & Perbankan','Manajemen Keuangan',
  // Pertanian, Perikanan & Kehutanan
  'Agronomi & Hortikultura','Teknologi Pangan','Ilmu Tanah',
  'Peternakan','Perikanan / Budidaya Perairan','Kehutanan',
  'Teknologi Hasil Pertanian','Proteksi Tanaman','Agribisnis',
  // Psikologi
  'Psikologi',
  // Sastra & Humaniora
  'Sastra Indonesia','Sastra Inggris','Sastra Jepang','Sastra Arab',
  'Sastra Perancis','Sastra Jerman','Sastra China/Mandarin',
  'Filsafat','Sejarah','Arkeologi','Ilmu Perpustakaan',
  // Pendidikan
  'Pendidikan Guru SD (PGSD)','Pendidikan Bahasa Inggris','Pendidikan Matematika',
  'Pendidikan Biologi','Pendidikan Kimia','Pendidikan Fisika','Pendidikan Sejarah',
  'Pendidikan Seni','Pendidikan Jasmani','Bimbingan & Konseling',
  'Pendidikan Luar Biasa','Teknologi Pendidikan','Pendidikan Bahasa Indonesia',
  'Pendidikan Ekonomi','Pendidikan IPS',
  // Desain & Seni
  'Desain Produk','Desain Komunikasi Visual (DKV)','Desain Interior',
  'Kriya Seni','Seni Rupa Murni','Film & Televisi','Animasi',
  'Seni Pertunjukan / Teater','Musik',
  // Ilmu Keagamaan
  'Pendidikan Agama Islam','Hukum Islam / Syariah','Perbankan Syariah',
  'Komunikasi & Penyiaran Islam','Ilmu Al-Quran & Tafsir',
  // Pariwisata
  'Pariwisata','Manajemen Perhotelan & Pariwisata',
].sort()

// ── School database ────────────────────────────────────────────────────────────

interface SMANInfo { name: string; tier: 'A+' | 'A' | 'B'; akreditasi?: string; kota: string; prov: string; rank?: number }

const SMAN_LIST: SMANInfo[] = [
  { name:'SMAN 3 Bandung',          tier:'A+', akreditasi:'Unggul',     kota:'Bandung',         prov:'Jawa Barat' },
  { name:'SMAN 1 Bandung',          tier:'A+', akreditasi:'Unggul',     kota:'Bandung',         prov:'Jawa Barat' },
  { name:'SMAN 2 Bandung',          tier:'A+', akreditasi:'Unggul',     kota:'Bandung',         prov:'Jawa Barat' },
  { name:'SMAN 5 Bandung',          tier:'A+', akreditasi:'Unggul',     kota:'Bandung',         prov:'Jawa Barat' },
  { name:'SMAN 4 Bandung',          tier:'A',  akreditasi:'Unggul',     kota:'Bandung',         prov:'Jawa Barat' },
  { name:'SMAN 8 Bandung',          tier:'A',  akreditasi:'Unggul',     kota:'Bandung',         prov:'Jawa Barat' },
  { name:'SMAN 11 Bandung',         tier:'A',  akreditasi:'Unggul',     kota:'Bandung',         prov:'Jawa Barat' },
  { name:'SMAN 1 Bogor',            tier:'A+', akreditasi:'Unggul',     kota:'Bogor',           prov:'Jawa Barat' },
  { name:'SMAN 2 Bogor',            tier:'A',  akreditasi:'Unggul',     kota:'Bogor',           prov:'Jawa Barat' },
  { name:'SMAN 3 Bogor',            tier:'A',  akreditasi:'Unggul',     kota:'Bogor',           prov:'Jawa Barat' },
  { name:'SMAN 1 Depok',            tier:'A',  akreditasi:'Unggul',     kota:'Depok',           prov:'Jawa Barat' },
  { name:'SMAN 2 Depok',            tier:'A',  akreditasi:'Unggul',     kota:'Depok',           prov:'Jawa Barat' },
  { name:'SMAN 1 Bekasi',           tier:'A',  akreditasi:'Unggul',     kota:'Bekasi',          prov:'Jawa Barat' },
  { name:'SMAN 2 Bekasi',           tier:'A',  akreditasi:'Unggul',     kota:'Bekasi',          prov:'Jawa Barat' },
  { name:'SMAN 1 Cirebon',          tier:'A',  akreditasi:'Unggul',     kota:'Cirebon',         prov:'Jawa Barat' },
  { name:'SMAN 8 Jakarta',          tier:'A+', akreditasi:'Unggul',     kota:'Jakarta Selatan', prov:'DKI Jakarta' },
  { name:'SMAN 68 Jakarta',         tier:'A+', akreditasi:'Unggul',     kota:'Jakarta Pusat',   prov:'DKI Jakarta' },
  { name:'SMAN 1 Jakarta',          tier:'A+', akreditasi:'Unggul',     kota:'Jakarta Pusat',   prov:'DKI Jakarta' },
  { name:'SMAN 6 Jakarta',          tier:'A+', akreditasi:'Unggul',     kota:'Jakarta Selatan', prov:'DKI Jakarta' },
  { name:'SMAN 70 Jakarta',         tier:'A+', akreditasi:'Unggul',     kota:'Jakarta Selatan', prov:'DKI Jakarta' },
  { name:'SMAN 21 Jakarta',         tier:'A+', akreditasi:'Unggul',     kota:'Jakarta Timur',   prov:'DKI Jakarta' },
  { name:'SMAN 4 Jakarta',          tier:'A',  akreditasi:'Unggul',     kota:'Jakarta Pusat',   prov:'DKI Jakarta' },
  { name:'SMAN 28 Jakarta',         tier:'A',  akreditasi:'Unggul',     kota:'Jakarta Selatan', prov:'DKI Jakarta' },
  { name:'SMAN 34 Jakarta',         tier:'A',  akreditasi:'Unggul',     kota:'Jakarta Selatan', prov:'DKI Jakarta' },
  { name:'SMAN 78 Jakarta',         tier:'A',  akreditasi:'Unggul',     kota:'Jakarta Barat',   prov:'DKI Jakarta' },
  { name:'SMAN 1 Tangerang',        tier:'A',  akreditasi:'Unggul',     kota:'Tangerang',       prov:'Banten' },
  { name:'SMAN 3 Yogyakarta',       tier:'A+', akreditasi:'Unggul',     kota:'Yogyakarta',      prov:'DI Yogyakarta' },
  { name:'SMAN 1 Yogyakarta',       tier:'A+', akreditasi:'Unggul',     kota:'Yogyakarta',      prov:'DI Yogyakarta' },
  { name:'SMAN 8 Yogyakarta',       tier:'A',  akreditasi:'Unggul',     kota:'Yogyakarta',      prov:'DI Yogyakarta' },
  { name:'SMAN 4 Yogyakarta',       tier:'A',  akreditasi:'Unggul',     kota:'Yogyakarta',      prov:'DI Yogyakarta' },
  { name:'SMAN 2 Yogyakarta',       tier:'A',  akreditasi:'Unggul',     kota:'Yogyakarta',      prov:'DI Yogyakarta' },
  { name:'SMAN 1 Surabaya',         tier:'A+', akreditasi:'Unggul',     kota:'Surabaya',        prov:'Jawa Timur' },
  { name:'SMAN 2 Surabaya',         tier:'A+', akreditasi:'Unggul',     kota:'Surabaya',        prov:'Jawa Timur' },
  { name:'SMAN 5 Surabaya',         tier:'A+', akreditasi:'Unggul',     kota:'Surabaya',        prov:'Jawa Timur' },
  { name:'SMAN 15 Surabaya',        tier:'A',  akreditasi:'Unggul',     kota:'Surabaya',        prov:'Jawa Timur' },
  { name:'SMAN 9 Surabaya',         tier:'A',  akreditasi:'Unggul',     kota:'Surabaya',        prov:'Jawa Timur' },
  { name:'SMAN 1 Malang',           tier:'A+', akreditasi:'Unggul',     kota:'Malang',          prov:'Jawa Timur' },
  { name:'SMAN 3 Malang',           tier:'A+', akreditasi:'Unggul',     kota:'Malang',          prov:'Jawa Timur' },
  { name:'SMAN 4 Malang',           tier:'A',  akreditasi:'Unggul',     kota:'Malang',          prov:'Jawa Timur' },
  { name:'SMAN 5 Malang',           tier:'A',  akreditasi:'Unggul',     kota:'Malang',          prov:'Jawa Timur' },
  { name:'SMAN 1 Semarang',         tier:'A+', akreditasi:'Unggul',     kota:'Semarang',        prov:'Jawa Tengah' },
  { name:'SMAN 3 Semarang',         tier:'A+', akreditasi:'Unggul',     kota:'Semarang',        prov:'Jawa Tengah' },
  { name:'SMAN 5 Semarang',         tier:'A',  akreditasi:'Unggul',     kota:'Semarang',        prov:'Jawa Tengah' },
  { name:'SMAN 2 Semarang',         tier:'A',  akreditasi:'Unggul',     kota:'Semarang',        prov:'Jawa Tengah' },
  { name:'SMAN 1 Solo',             tier:'A+', akreditasi:'Unggul',     kota:'Solo',            prov:'Jawa Tengah' },
  { name:'SMAN 3 Solo',             tier:'A',  akreditasi:'Unggul',     kota:'Solo',            prov:'Jawa Tengah' },
  { name:'SMAN 1 Magelang',         tier:'A',  akreditasi:'Unggul',     kota:'Magelang',        prov:'Jawa Tengah' },
  { name:'SMAN 1 Purwokerto',       tier:'A',  akreditasi:'Unggul',     kota:'Purwokerto',      prov:'Jawa Tengah' },
  { name:'SMAN 1 Medan',            tier:'A+', akreditasi:'Unggul',     kota:'Medan',           prov:'Sumatera Utara' },
  { name:'SMAN 2 Medan',            tier:'A',  akreditasi:'Unggul',     kota:'Medan',           prov:'Sumatera Utara' },
  { name:'SMAN 3 Medan',            tier:'A',  akreditasi:'Unggul',     kota:'Medan',           prov:'Sumatera Utara' },
  { name:'SMAN 1 Bukittinggi',      tier:'A+', akreditasi:'Unggul',     kota:'Bukittinggi',     prov:'Sumatera Barat' },
  { name:'SMAN 1 Padang',           tier:'A',  akreditasi:'Unggul',     kota:'Padang',          prov:'Sumatera Barat' },
  { name:'SMAN 2 Padang',           tier:'A',  akreditasi:'Unggul',     kota:'Padang',          prov:'Sumatera Barat' },
  { name:'SMAN 1 Pekanbaru',        tier:'A',  akreditasi:'Unggul',     kota:'Pekanbaru',       prov:'Riau' },
  { name:'SMAN 2 Pekanbaru',        tier:'A',  akreditasi:'Unggul',     kota:'Pekanbaru',       prov:'Riau' },
  { name:'SMAN 1 Palembang',        tier:'A',  akreditasi:'Unggul',     kota:'Palembang',       prov:'Sumatera Selatan' },
  { name:'SMAN 2 Palembang',        tier:'A',  akreditasi:'Unggul',     kota:'Palembang',       prov:'Sumatera Selatan' },
  { name:'SMAN 1 Bandar Lampung',   tier:'A',  akreditasi:'Unggul',     kota:'Bandar Lampung',  prov:'Lampung' },
  { name:'SMAN 2 Bandar Lampung',   tier:'A',  akreditasi:'Unggul',     kota:'Bandar Lampung',  prov:'Lampung' },
  { name:'SMAN 1 Makassar',         tier:'A+', akreditasi:'Unggul',     kota:'Makassar',        prov:'Sulawesi Selatan' },
  { name:'SMAN 2 Makassar',         tier:'A',  akreditasi:'Unggul',     kota:'Makassar',        prov:'Sulawesi Selatan' },
  { name:'SMAN 5 Makassar',         tier:'A',  akreditasi:'Unggul',     kota:'Makassar',        prov:'Sulawesi Selatan' },
  { name:'SMAN 1 Denpasar',         tier:'A',  akreditasi:'Unggul',     kota:'Denpasar',        prov:'Bali' },
  { name:'SMAN 4 Denpasar',         tier:'A',  akreditasi:'Unggul',     kota:'Denpasar',        prov:'Bali' },
  { name:'SMAN 1 Mataram',          tier:'A',  akreditasi:'Unggul',     kota:'Mataram',         prov:'Nusa Tenggara Barat' },
  { name:'SMAN 1 Banjarmasin',      tier:'A',  akreditasi:'Unggul',     kota:'Banjarmasin',     prov:'Kalimantan Selatan' },
  { name:'SMAN 1 Samarinda',        tier:'A',  akreditasi:'Unggul',     kota:'Samarinda',       prov:'Kalimantan Timur' },
  { name:'SMAN 1 Pontianak',        tier:'A',  akreditasi:'Unggul',     kota:'Pontianak',       prov:'Kalimantan Barat' },
  { name:'SMAN 1 Manado',           tier:'A',  akreditasi:'Unggul',     kota:'Manado',          prov:'Sulawesi Utara' },
  { name:'SMAN 1 Kupang',           tier:'B',  akreditasi:'Unggul',     kota:'Kupang',          prov:'Nusa Tenggara Timur' },
  { name:'SMAN 1 Jayapura',         tier:'B',  akreditasi:'Unggul',     kota:'Jayapura',        prov:'Papua' },
  { name:'SMA Labschool Kebayoran', tier:'A+', akreditasi:'Unggul',     kota:'Jakarta Selatan', prov:'DKI Jakarta' },
  { name:'SMA Labschool Cibubur',   tier:'A',  akreditasi:'Unggul',     kota:'Depok',           prov:'Jawa Barat' },
  { name:'SMA Santa Ursula Jakarta',tier:'A+', akreditasi:'Unggul',     kota:'Jakarta Pusat',   prov:'DKI Jakarta' },
  { name:'SMA BPK Penabur Jakarta', tier:'A+', akreditasi:'Unggul',     kota:'Jakarta',         prov:'DKI Jakarta' },
  { name:'SMA Kolese Kanisius',     tier:'A+', akreditasi:'Unggul',     kota:'Jakarta Pusat',   prov:'DKI Jakarta' },
  { name:'SMA Kolese De Britto',    tier:'A+', akreditasi:'Unggul',     kota:'Yogyakarta',      prov:'DI Yogyakarta' },
  { name:'SMA Taruna Nusantara',    tier:'A+', akreditasi:'Unggul',     kota:'Magelang',        prov:'Jawa Tengah' },
  { name:'SMA Dian Harapan Jakarta',tier:'A',  akreditasi:'Unggul',     kota:'Jakarta',         prov:'DKI Jakarta' },
  { name:'SMA Pradita Dirgantara',  tier:'A+', akreditasi:'Unggul',     kota:'Boyolali',        prov:'Jawa Tengah' },
  { name:'SMA Insan Cendekia MBS',  tier:'A+', akreditasi:'Unggul',     kota:'Sleman',          prov:'DI Yogyakarta' },
  { name:'SMA Al-Azhar 1 Jakarta',  tier:'A',  akreditasi:'Unggul',     kota:'Jakarta Selatan', prov:'DKI Jakarta' },
  // Ranking LTMPT — Top 100 Nasional
  { name:'MAN Insan Cendekia Serpong',     tier:'A+', akreditasi:'Unggul', kota:'Tangerang Selatan', prov:'Banten' },
  { name:'SMA Katolik St Louis 1',         tier:'A+', akreditasi:'Unggul', kota:'Surabaya',          prov:'Jawa Timur' },
  { name:'MAN Insan Cendekia Pekalongan',  tier:'A+', akreditasi:'Unggul', kota:'Pekalongan',        prov:'Jawa Tengah' },
  { name:'SMA Labschool Jakarta',          tier:'A+', akreditasi:'Unggul', kota:'Jakarta Timur',     prov:'DKI Jakarta' },
  { name:'SMAN 2 Jakarta',                 tier:'A+', akreditasi:'Unggul', kota:'Jakarta Pusat',     prov:'DKI Jakarta' },
  { name:'SMA Unggul Del',                 tier:'A+', akreditasi:'Unggul', kota:'Toba',              prov:'Sumatera Utara' },
  { name:'SMAN 81 Jakarta',                tier:'A',  akreditasi:'Unggul', kota:'Jakarta Timur',     prov:'DKI Jakarta' },
  { name:'SMAN 1 Godean',                  tier:'A',  akreditasi:'Unggul', kota:'Sleman',            prov:'DI Yogyakarta' },
  { name:'MAN 2 Kota Malang',              tier:'A+', akreditasi:'Unggul', kota:'Malang',            prov:'Jawa Timur' },
  { name:'MAN Insan Cendekia Kota Batam',  tier:'A+', akreditasi:'Unggul', kota:'Batam',             prov:'Kepulauan Riau' },
  { name:'SMAN 6 Yogyakarta',              tier:'A',  akreditasi:'Unggul', kota:'Yogyakarta',        prov:'DI Yogyakarta' },
  { name:'SMAN 61 Jakarta',                tier:'A',  akreditasi:'Unggul', kota:'Jakarta Timur',     prov:'DKI Jakarta' },
  { name:'SMAN Banua Kal Sel',             tier:'A+', akreditasi:'Unggul', kota:'Banjarbaru',        prov:'Kalimantan Selatan' },
  { name:'SMA Kolese Loyola',              tier:'A+', akreditasi:'Unggul', kota:'Semarang',          prov:'Jawa Tengah' },
  { name:'SMA Al-Irsyad Satya',           tier:'A',  akreditasi:'Unggul', kota:'Bandung',           prov:'Jawa Barat' },
  { name:'SMA Gonzaga Jakarta',            tier:'A+', akreditasi:'Unggul', kota:'Jakarta Selatan',   prov:'DKI Jakarta' },
  { name:'SMA Alloysius 1',               tier:'A+', akreditasi:'Unggul', kota:'Semarang',          prov:'Jawa Tengah' },
  { name:'MAN Insan Cendekia Gorontalo',   tier:'A+', akreditasi:'Unggul', kota:'Gorontalo',         prov:'Gorontalo' },
  { name:'SMAN 47 Jakarta',               tier:'A',  akreditasi:'Unggul', kota:'Jakarta Selatan',   prov:'DKI Jakarta' },
  { name:'MAN Insan Cendekia Jambi',      tier:'A+', akreditasi:'Unggul', kota:'Muaro Jambi',       prov:'Jambi' },
  { name:'SMAN 26 Jakarta',               tier:'A',  akreditasi:'Unggul', kota:'Jakarta Selatan',   prov:'DKI Jakarta' },
  { name:'MAN Insan Cendekia Pasuruan',   tier:'A+', akreditasi:'Unggul', kota:'Pasuruan',          prov:'Jawa Timur' },
  { name:'SMAN 1 Kalasan',                tier:'A',  akreditasi:'Unggul', kota:'Sleman',            prov:'DI Yogyakarta' },
  { name:'SMAN 1 Sleman',                 tier:'A',  akreditasi:'Unggul', kota:'Sleman',            prov:'DI Yogyakarta' },
  { name:'SMA Regina Pacis',              tier:'A',  akreditasi:'Unggul', kota:'Bogor',             prov:'Jawa Barat' },
  { name:'SMAN 1 Wonosari',              tier:'A',  akreditasi:'Unggul', kota:'Gunungkidul',       prov:'DI Yogyakarta' },
  { name:'SMAN 71 Jakarta',              tier:'A',  akreditasi:'Unggul', kota:'Jakarta Timur',     prov:'DKI Jakarta' },
  { name:'SMAN 12 Jakarta',              tier:'A',  akreditasi:'Unggul', kota:'Jakarta Timur',     prov:'DKI Jakarta' },
  { name:'SMAN 65 Jakarta',              tier:'A',  akreditasi:'Unggul', kota:'Jakarta Barat',     prov:'DKI Jakarta' },
  { name:'SMA Darma Yudha',              tier:'A',  akreditasi:'Unggul', kota:'Pekanbaru',         prov:'Riau' },
  { name:'MAN Insan Cendekia OKI',       tier:'A+', akreditasi:'Unggul', kota:'Ogan Komering Ilir', prov:'Sumatera Selatan' },
  { name:'SMAN 1 Sumatera Barat',        tier:'A+', akreditasi:'Unggul', kota:'Padang Pariaman',   prov:'Sumatera Barat' },
  { name:'SMAN 9 Yogyakarta',            tier:'A',  akreditasi:'Unggul', kota:'Yogyakarta',        prov:'DI Yogyakarta' },
  { name:'SMAN 1 Wates',                 tier:'A',  akreditasi:'Unggul', kota:'Kulon Progo',       prov:'DI Yogyakarta' },
  { name:'SMAN 99 Jakarta',              tier:'A',  akreditasi:'Unggul', kota:'Jakarta Timur',     prov:'DKI Jakarta' },
  { name:'SMA Unggulan CT Arsa Foundation', tier:'A+', akreditasi:'Unggul', kota:'Sukoharjo',    prov:'Jawa Tengah' },
  { name:'SMA Islam Nurul Fikri',        tier:'A',  akreditasi:'Unggul', kota:'Depok',            prov:'Jawa Barat' },
  { name:'SMAN 17 Palembang',            tier:'A',  akreditasi:'Unggul', kota:'Palembang',        prov:'Sumatera Selatan' },
  { name:'SMAN 70 Jakarta',              tier:'A+', akreditasi:'Unggul', kota:'Jakarta Selatan',  prov:'DKI Jakarta' },
  { name:'SMAN 14 Jakarta',              tier:'A',  akreditasi:'Unggul', kota:'Jakarta Selatan',  prov:'DKI Jakarta' },
  { name:'SMAN 1 Sanden',               tier:'A',  akreditasi:'Unggul', kota:'Bantul',           prov:'DI Yogyakarta' },
  { name:'SMA IT As-Syifa Boarding School', tier:'A', akreditasi:'Unggul', kota:'Subang',        prov:'Jawa Barat' },
  { name:'SMA UPH College',             tier:'A',  akreditasi:'Unggul', kota:'Tangerang',        prov:'Banten' },
  { name:'SMAN 1 Padang Panjang',       tier:'A',  akreditasi:'Unggul', kota:'Padang Panjang',   prov:'Sumatera Barat' },
  { name:'SMA Pangudi Luhur Van Lith',  tier:'A+', akreditasi:'Unggul', kota:'Magelang',         prov:'Jawa Tengah' },
  { name:'SMAN 19 Jakarta',             tier:'A',  akreditasi:'Unggul', kota:'Jakarta Selatan',  prov:'DKI Jakarta' },
  { name:'SMAN 1 Purworejo',            tier:'A',  akreditasi:'Unggul', kota:'Purworejo',        prov:'Jawa Tengah' },
  { name:'SMAN 13 Jakarta',             tier:'A',  akreditasi:'Unggul', kota:'Jakarta Pusat',    prov:'DKI Jakarta' },
  { name:'SMA BPK Penabur Bintaro',     tier:'A',  akreditasi:'Unggul', kota:'Tangerang Selatan', prov:'Banten' },
  { name:'MAN Insan Cendekia Tanah Laut', tier:'A+', akreditasi:'Unggul', kota:'Tanah Laut',    prov:'Kalimantan Selatan' },
  { name:'SMAN 1 Salatiga',             tier:'A',  akreditasi:'Unggul', kota:'Salatiga',         prov:'Jawa Tengah' },
  { name:'SMA Taruna Bakti',            tier:'A',  akreditasi:'Unggul', kota:'Bandung',          prov:'Jawa Barat' },
  { name:'MAN Insan Cendekia Lombok Timur', tier:'A+', akreditasi:'Unggul', kota:'Lombok Timur', prov:'Nusa Tenggara Barat' },
  { name:'SMAN 103 Jakarta',            tier:'A',  akreditasi:'Unggul', kota:'Jakarta Timur',   prov:'DKI Jakarta' },
  { name:'SMA Methodist 3 Medan',       tier:'A',  akreditasi:'Unggul', kota:'Medan',           prov:'Sumatera Utara' },
  { name:'SMAN 66 Jakarta',             tier:'A',  akreditasi:'Unggul', kota:'Jakarta Selatan', prov:'DKI Jakarta' },
  { name:'SMAN 48 Jakarta',             tier:'A',  akreditasi:'Unggul', kota:'Jakarta Selatan', prov:'DKI Jakarta' },
  { name:'SMA BPK 1 Penabur Bandung',   tier:'A+', akreditasi:'Unggul', kota:'Bandung',         prov:'Jawa Barat' },
  { name:'SMAN 1 Bantul',              tier:'A',  akreditasi:'Unggul', kota:'Bantul',           prov:'DI Yogyakarta' },
  { name:'SMAN 5 Yogyakarta',           tier:'A',  akreditasi:'Unggul', kota:'Yogyakarta',      prov:'DI Yogyakarta' },
  { name:'SMAN 7 Yogyakarta',           tier:'A',  akreditasi:'Unggul', kota:'Yogyakarta',      prov:'DI Yogyakarta' },
  { name:'MAN 1 Yogyakarta',            tier:'A+', akreditasi:'Unggul', kota:'Yogyakarta',      prov:'DI Yogyakarta' },
  { name:'SMAN 39 Jakarta',            tier:'A',  akreditasi:'Unggul', kota:'Jakarta Selatan', prov:'DKI Jakarta' },
  { name:'SMAN 38 Jakarta',            tier:'A',  akreditasi:'Unggul', kota:'Jakarta Selatan', prov:'DKI Jakarta' },
  { name:'SMAN 49 Jakarta',            tier:'A',  akreditasi:'Unggul', kota:'Jakarta Selatan', prov:'DKI Jakarta' },
  { name:'SMA Unggulan MH Thamrin',    tier:'A+', akreditasi:'Unggul', kota:'Jakarta Timur',  prov:'DKI Jakarta' },
  { name:'SMA Kristen BPK Penabur Gading Serpong', tier:'A', akreditasi:'Unggul', kota:'Tangerang', prov:'Banten' },
  { name:'SMA Pesantren Unggul Al Bayan', tier:'A', akreditasi:'Unggul', kota:'Cianjur',      prov:'Jawa Barat' },
  { name:'SMA IT Ibnu Abbas',          tier:'A',  akreditasi:'Unggul', kota:'Klaten',          prov:'Jawa Tengah' },
  { name:'SMA Muhammadiyah PK Surakarta', tier:'A', akreditasi:'Unggul', kota:'Surakarta',     prov:'Jawa Tengah' },
  { name:'SMAN 1 Martapura',           tier:'A',  akreditasi:'Unggul', kota:'Martapura',       prov:'Kalimantan Selatan' },
  { name:'SMAN 1 Banda Aceh',          tier:'A+', akreditasi:'Unggul', kota:'Banda Aceh',      prov:'Aceh' },
  { name:'SMAN 4 Malang',              tier:'A',  akreditasi:'Unggul', kota:'Malang',          prov:'Jawa Timur' },
  { name:'SMAN 1 Gresik',              tier:'A',  akreditasi:'Unggul', kota:'Gresik',          prov:'Jawa Timur' },
  { name:'SMAN 2 Malang',              tier:'A',  akreditasi:'Unggul', kota:'Malang',          prov:'Jawa Timur' },
  { name:'SMAN 1 Kediri',              tier:'A',  akreditasi:'Unggul', kota:'Kediri',          prov:'Jawa Timur' },
  { name:'SMAN 1 Sidoarjo',            tier:'A',  akreditasi:'Unggul', kota:'Sidoarjo',        prov:'Jawa Timur' },
  { name:'SMAN 1 Pamekasan',           tier:'A',  akreditasi:'Unggul', kota:'Pamekasan',       prov:'Jawa Timur' },
  { name:'SMAN 2 Semarang',            tier:'A',  akreditasi:'Unggul', kota:'Semarang',        prov:'Jawa Tengah' },
  { name:'SMAN 4 Semarang',            tier:'A',  akreditasi:'Unggul', kota:'Semarang',        prov:'Jawa Tengah' },
  { name:'SMAN 1 Purwokerto',          tier:'A',  akreditasi:'Unggul', kota:'Purwokerto',      prov:'Jawa Tengah' },
  { name:'SMAN 1 Cilacap',             tier:'A',  akreditasi:'Unggul', kota:'Cilacap',         prov:'Jawa Tengah' },
  { name:'SMAN 1 Klaten',              tier:'A',  akreditasi:'Unggul', kota:'Klaten',          prov:'Jawa Tengah' },
  { name:'SMAN 1 Wonosobo',            tier:'A',  akreditasi:'Unggul', kota:'Wonosobo',        prov:'Jawa Tengah' },
  { name:'SMAN 1 Tasikmalaya',         tier:'A',  akreditasi:'Unggul', kota:'Tasikmalaya',     prov:'Jawa Barat' },
  { name:'SMAN 1 Karawang',            tier:'A',  akreditasi:'Unggul', kota:'Karawang',        prov:'Jawa Barat' },
  { name:'SMAN 1 Subang',              tier:'A',  akreditasi:'Unggul', kota:'Subang',          prov:'Jawa Barat' },
  { name:'SMAN 1 Sukabumi',            tier:'A',  akreditasi:'Unggul', kota:'Sukabumi',        prov:'Jawa Barat' },
  { name:'SMAN 1 Garut',               tier:'A',  akreditasi:'Unggul', kota:'Garut',           prov:'Jawa Barat' },
  { name:'SMAN 1 Majalengka',          tier:'A',  akreditasi:'Unggul', kota:'Majalengka',      prov:'Jawa Barat' },
  { name:'SMAN 3 Cirebon',             tier:'A',  akreditasi:'Unggul', kota:'Cirebon',         prov:'Jawa Barat' },
  { name:'SMAN 2 Depok',               tier:'A',  akreditasi:'Unggul', kota:'Depok',           prov:'Jawa Barat' },
  { name:'SMAN 3 Bogor',               tier:'A',  akreditasi:'Unggul', kota:'Bogor',           prov:'Jawa Barat' },
  { name:'SMAN 1 Ciamis',              tier:'A',  akreditasi:'Unggul', kota:'Ciamis',          prov:'Jawa Barat' },
  { name:'SMA Kolese De Britto Depok', tier:'A+', akreditasi:'Unggul', kota:'Depok',           prov:'Jawa Barat' },
  { name:'SMAN 2 Padang Panjang',      tier:'A',  akreditasi:'Unggul', kota:'Padang Panjang',  prov:'Sumatera Barat' },
  { name:'SMAN 3 Padang',              tier:'A',  akreditasi:'Unggul', kota:'Padang',          prov:'Sumatera Barat' },
  { name:'SMAN 1 Payakumbuh',          tier:'A',  akreditasi:'Unggul', kota:'Payakumbuh',      prov:'Sumatera Barat' },
  { name:'SMAN 1 Solok',               tier:'A',  akreditasi:'Unggul', kota:'Solok',           prov:'Sumatera Barat' },
  { name:'SMAN 3 Pekanbaru',           tier:'A',  akreditasi:'Unggul', kota:'Pekanbaru',       prov:'Riau' },
  { name:'SMAN 5 Pekanbaru',           tier:'A',  akreditasi:'Unggul', kota:'Pekanbaru',       prov:'Riau' },
  { name:'SMAN 1 Jambi',               tier:'A',  akreditasi:'Unggul', kota:'Jambi',           prov:'Jambi' },
  { name:'SMAN 1 Bengkulu',            tier:'A',  akreditasi:'Unggul', kota:'Bengkulu',        prov:'Bengkulu' },
  { name:'SMAN 1 Bandar Lampung',      tier:'A',  akreditasi:'Unggul', kota:'Bandar Lampung',  prov:'Lampung' },
  { name:'SMAN 2 Bandar Lampung',      tier:'A',  akreditasi:'Unggul', kota:'Bandar Lampung',  prov:'Lampung' },
  { name:'SMAN 3 Makassar',            tier:'A',  akreditasi:'Unggul', kota:'Makassar',        prov:'Sulawesi Selatan' },
  { name:'SMAN 9 Makassar',            tier:'A',  akreditasi:'Unggul', kota:'Makassar',        prov:'Sulawesi Selatan' },
  { name:'SMAN 1 Pare-Pare',           tier:'A',  akreditasi:'Unggul', kota:'Parepare',        prov:'Sulawesi Selatan' },
  { name:'SMAN 1 Manado',              tier:'A',  akreditasi:'Unggul', kota:'Manado',          prov:'Sulawesi Utara' },
  { name:'SMAN 1 Palu',                tier:'A',  akreditasi:'Unggul', kota:'Palu',            prov:'Sulawesi Tengah' },
  { name:'SMAN 1 Ambon',               tier:'B',  akreditasi:'Unggul', kota:'Ambon',           prov:'Maluku' },
  { name:'SMAN 1 Ternate',             tier:'B',  akreditasi:'Unggul', kota:'Ternate',         prov:'Maluku Utara' },
  { name:'SMAN 1 Banjarbaru',          tier:'A',  akreditasi:'Unggul', kota:'Banjarbaru',      prov:'Kalimantan Selatan' },
  { name:'SMAN 1 Banjarmasin',         tier:'A',  akreditasi:'Unggul', kota:'Banjarmasin',     prov:'Kalimantan Selatan' },
  { name:'SMAN 1 Balikpapan',          tier:'A',  akreditasi:'Unggul', kota:'Balikpapan',      prov:'Kalimantan Timur' },
  { name:'SMAN 1 Tarakan',             tier:'A',  akreditasi:'Unggul', kota:'Tarakan',         prov:'Kalimantan Utara' },
  { name:'SMAN 1 Singkawang',          tier:'A',  akreditasi:'Unggul', kota:'Singkawang',      prov:'Kalimantan Barat' },
  { name:'SMAN 2 Singaraja',           tier:'A',  akreditasi:'Unggul', kota:'Singaraja',       prov:'Bali' },
  { name:'SMAN 1 Gianyar',             tier:'A',  akreditasi:'Unggul', kota:'Gianyar',         prov:'Bali' },
  { name:'SMAN 1 Sumbawa',             tier:'A',  akreditasi:'Unggul', kota:'Sumbawa',         prov:'Nusa Tenggara Barat' },
  { name:'SMAN 2 Mataram',             tier:'A',  akreditasi:'Unggul', kota:'Mataram',         prov:'Nusa Tenggara Barat' },
  { name:'SMAN 1 Ende',                tier:'B',  akreditasi:'Unggul', kota:'Ende',            prov:'Nusa Tenggara Timur' },
  { name:'SMA Kristen 1 Maranatha Palu',tier:'A', akreditasi:'Unggul', kota:'Palu',            prov:'Sulawesi Tengah' },
  { name:'SMA Islam Athirah',          tier:'A',  akreditasi:'Unggul', kota:'Makassar',        prov:'Sulawesi Selatan' },
]

const TIER_STYLE: Record<string, { bg: string; color: string }> = {
  'A+': { bg: '#ffd400', color: '#7a5f00' },
  'A':  { bg: '#dbeafe', color: '#1e40af' },
  'B':  { bg: '#dcfce7', color: '#166534' },
}

function searchSchools(q: string, max = 6): SMANInfo[] {
  if (q.length < 2) return []
  const lq = q.toLowerCase()
  return SMAN_LIST.filter(s => s.name.toLowerCase().includes(lq)).slice(0, max)
}

// ── Jalur directory ────────────────────────────────────────────────────────────

type JalurType = 'essay' | 'prestasi' | 'hybrid' | 'other'
interface JalurOption { key: string; label: string; type: JalurType; ptn: string }

const JALUR_OPTIONS: JalurOption[] = [
  { key: 'ppkb_ui',          label: 'PPKB UI',                             type: 'essay',    ptn: 'UI' },
  { key: 'ssu_tes_itb',      label: 'SSU Jalur Tes Tulis ITB',            type: 'essay',    ptn: 'ITB' },
  { key: 'ssu_rapor_itb',    label: 'SSU Jalur Nilai Rapor ITB',          type: 'essay',    ptn: 'ITB' },
  { key: 'smits_its',        label: 'SMITS FLAT ITS',                     type: 'essay',    ptn: 'ITS' },
  { key: 'sjp_ui',           label: 'SJP UI',                             type: 'prestasi', ptn: 'UI' },
  { key: 'sbub_undip',       label: 'SBUB UNDIP',                         type: 'prestasi', ptn: 'UNDIP' },
  { key: 'smup_unpad',       label: 'SMUP Minat & Bakat UNPAD',           type: 'prestasi', ptn: 'UNPAD' },
  { key: 'smub_ub',          label: 'SMUB Prestasi UB',                   type: 'prestasi', ptn: 'UB' },
  { key: 'spmb_unsoed',      label: 'SPMB Mandiri Non-UTBK UNSOED',       type: 'prestasi', ptn: 'UNSOED' },
  { key: 'smjki_uns',        label: 'SMJKI UNS',                          type: 'prestasi', ptn: 'UNS' },
  { key: 'sima_unand',       label: 'SIMA UNAND',                         type: 'prestasi', ptn: 'UNAND' },
  { key: 'talenta_ipb',      label: 'Jalur Talenta IPB',                  type: 'prestasi', ptn: 'IPB' },
  { key: 'osis_ipb',         label: 'Jalur Ketua OSIS IPB',               type: 'prestasi', ptn: 'IPB' },
  { key: 'smua_unair',       label: 'SMUA Jalur Prestasi UNAIR',          type: 'prestasi', ptn: 'UNAIR' },
  { key: 'sm_prestasi_unnes',label: 'SM Prestasi UNNES',                  type: 'prestasi', ptn: 'UNNES' },
  { key: 'ssu_talenta_sains',label: 'SSU Jalur Talenta Sains ITB',        type: 'hybrid',   ptn: 'ITB' },
  { key: 'ssu_talenta_olahraga', label: 'SSU Jalur Talenta (Olahraga/Seni/Keagamaan) ITB', type: 'hybrid', ptn: 'ITB' },
  { key: 'lainnya',          label: 'Jalur Non-Tes Lainnya',              type: 'other',    ptn: '' },
]

const JALUR_TYPE_LABEL: Record<JalurType, string> = {
  essay:    'Essay Only',
  prestasi: 'Prestasi Only',
  hybrid:   'Hybrid (Essay + Prestasi)',
  other:    'Lainnya',
}
const JALUR_TYPE_COLOR: Record<JalurType, { bg: string; border: string; text: string }> = {
  essay:    { bg: 'rgba(59,130,246,0.1)',  border: '#3b82f6', text: '#1e40af' },
  prestasi: { bg: 'rgba(34,197,94,0.1)',   border: '#22c55e', text: '#166534' },
  hybrid:   { bg: 'rgba(168,85,247,0.1)',  border: '#a855f7', text: '#7e22ce' },
  other:    { bg: 'rgba(107,114,128,0.1)', border: '#9ca3af', text: '#374151' },
}

const JALUR_DEADLINE: Record<string, { month: number; day: number }> = {
  ppkb_ui: { month: 2, day: 15 }, ssu_tes_itb: { month: 2, day: 20 },
  ssu_rapor_itb: { month: 2, day: 20 }, smits_its: { month: 2, day: 25 },
  sjp_ui: { month: 2, day: 28 }, sbub_undip: { month: 3, day: 10 },
  smup_unpad: { month: 3, day: 5 }, smub_ub: { month: 3, day: 15 },
  spmb_unsoed: { month: 3, day: 20 }, smjki_uns: { month: 3, day: 10 },
  sima_unand: { month: 3, day: 15 }, talenta_ipb: { month: 2, day: 28 },
  osis_ipb: { month: 2, day: 28 }, smua_unair: { month: 3, day: 10 },
  sm_prestasi_unnes: { month: 3, day: 20 }, ssu_talenta_sains: { month: 2, day: 20 },
  ssu_talenta_olahraga: { month: 2, day: 20 }, lainnya: { month: 6, day: 30 },
}

// ── Essay quiz (pemanasan) ────────────────────────────────────────────────────

const ESSAY_SENTENCES = [
  { id: 0, text: 'Halo, perkenalkan nama saya Budi, siswi kelas 12 IPA.' },
  { id: 1, text: 'Saya sangat passionate terhadap dunia kedokteran.' },
  { id: 2, text: 'Kenapa saya ingin masuk FK UI?' },
  { id: 3, text: 'Karena menurut saya, FK UI adalah yang terbaik di Indonesia.' },
  { id: 4, text: 'Saya yakin saya adalah orang yang cocok untuk program ini.' },
]
const ESSAY_ISSUES: Record<number, string> = {
  0: '"siswi" tidak sesuai karena nama "Budi" biasanya laki-laki. Esai harus konsisten.',
  1: '"passionate" — gunakan kata baku: "bersemangat" atau "antusias" (KBBI)',
  2: '"Kenapa" tidak baku. Gunakan "Mengapa" sesuai kaidah penulisan formal.',
  4: '"cocok" terlalu lemah & tidak spesifik. Tunjukkan bukti konkret mengapa kamu layak.',
}
const ESSAY_OK = new Set([3])

// ── Other constants ────────────────────────────────────────────────────────────

const KELAS_OPTIONS = ['Kelas 10', 'Kelas 11', 'Kelas 12']
const MAPEL_WAJIB   = ['Bahasa Indonesia', 'Matematika Wajib', 'Bahasa Inggris', 'PKN/PPKN', 'Sejarah Indonesia', 'Seni Budaya']
const MAPEL_IPA     = ['Matematika Peminatan', 'Fisika', 'Kimia', 'Biologi']
const MAPEL_IPS     = ['Geografi', 'Sejarah Peminatan', 'Sosiologi', 'Ekonomi']
const MAPEL_BAHASA  = ['Sastra Indonesia', 'Sastra Inggris', 'Bahasa Asing', 'Antropologi']
const LEARNING_STYLES = ['Baca & tandai poin penting', 'Bikin rangkuman & mind map', 'Nulis esai & latihan menulis', 'Diskusi bareng teman/mentor', 'Riset mandiri & eksplorasi']
const CHALLENGE_OPTIONS = [
  { key: 'konsisten', label: 'Susah konsisten tiap hari' },
  { key: 'mulai',     label: 'Bingung harus mulai nulis dari mana' },
  { key: 'arah',      label: 'Bingung strategi jalur non-tes' },
  { key: 'distraksi', label: 'Gampang ke-distract HP' },
  { key: 'waktu',     label: 'Nggak ada waktu untuk persiapan' },
]
const CHALLENGE_FEATURES: Record<string, { title: string; desc: string; icon: string }> = {
  konsisten: { title: 'Tracker Esai & Rapor',  desc: 'Progres harianmu tercatat otomatis — dari draft esai sampai target rapor.',       icon: '/mascot/otbee-phone.png' },
  mulai:     { title: 'Template Esai AI',       desc: 'AI bisa langsung bikin draft esai pertamamu — tinggal edit sesuai gaya kamu.',    icon: '/mascot/writing-essay.png' },
  arah:      { title: 'Roadmap Non-Tes',        desc: 'Timeline lengkap PPKB, SJP, SBUB, dan jalur lainnya — tau persis harus ngapain.', icon: '/mascot/roadmap-flags.png' },
  distraksi: { title: 'Sesi Nulis Terfokus',    desc: 'Sesi 25 menit terfokus khusus nulis/revisi esai — pendek tapi efektif.',         icon: '/mascot/reading-clock.png' },
  waktu:     { title: 'Persiapan 30 Menit',     desc: 'Jadwal harian fleksibel, 30 menit per hari bisa bikin progress signifikan.',      icon: '/mascot/calendar-zoom.png' },
}
const DAILY_HOURS    = [{ n: 1, label: 'Santai' }, { n: 2, label: 'Konsisten' }, { n: 3, label: 'Intensif' }]
const DAYS           = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const TRIGGER_OPTIONS  = ['Pulang sekolah', 'Habis makan malam', 'Sebelum tidur', 'Pas istirahat sekolah']
const FALLBACK_OPTIONS = ['Buka template esai dan nulis 1 paragraf dulu', 'Minta semangat ke AI otwptn', 'Review info jalur yang dituju']
const LOADING_STAGES   = ['Menganalisis profilmu', 'Menyusun rencana esai & rapor', 'Mengoptimalkan strategi jalur non-tes', 'Rencanamu siap!']

const MASCOTS = [
  '/mascot/lulus-ptn.png',      // 0 welcome
  '/mascot/reading-books.png',  // 1 kelas
  '/mascot/roadmap-flags.png',  // 2 jalur
  '/mascot/thinking-idea.png',  // 3 confidence
  '/mascot/review-draft.png',   // 4 essay pemanasan
  '/mascot/star-sparkle.png',   // 5 hasil pemanasan
  '/mascot/winking-check.png',  // 6 kenalan
  '/mascot/diploma.png',        // 7 kampus jurusan
  '/mascot/percent-ring.png',   // 8 rapor
  '/mascot/medal.png',          // 9 prestasi upload
  '/mascot/writing-essay.png',  // 10 essay draft
  '/mascot/reading-clock.png',  // 11 gaya belajar
  '/mascot/bar-chart-point.png',// 12 insight
  '/mascot/confused.png',       // 13 tantangan
  '/mascot/calendar-zoom.png',  // 14 jadwal
  '/mascot/stats-chart.png',    // 15 proyeksi
  '/mascot/speech-doc.png',     // 16 rencana konkret
  '/mascot/grading-paper.png',  // 17 motivasi
  '/mascot/check-paper-happy.png', // 18 ringkasan
  '/mascot/thumbsup.png',       // 19 janji (hold - paling terakhir)
  '/mascot/folder-download.png',// 20 loading
  '/mascot/trophy-graduate.png',// 21 selesai
]

const STEP_COPY: { title: string; sub: string }[] = [
  { title: 'Halo! Aku OtBee, temenmu siap masuk PTN non-tes.',    sub: 'Cuma 5 menit buat nyusun rencana yang beneran cocok buat kamu.' },
  { title: 'Sekarang kamu kelas berapa?',                          sub: 'Biar aku bisa sesuaikan jalur yang tersedia.' },
  { title: 'Jalur non-tes mana yang kamu incar?',                  sub: 'Bisa pilih satu dulu — bisa diubah kapan aja.' },
  { title: 'Seberapa yakin kamu bisa lolos di jalur itu?',         sub: 'Jujur aja — ini buat ngukur titik awalmu.' },
  { title: 'Sebelum lanjut, latihan esai singkat yuk!',            sub: 'Temukan bagian mana yang perlu diperbaiki.' },
  { title: 'Hari pertamamu udah jalan!',                           sub: 'Progres persiapanmu mulai tercatat dari sekarang.' },
  { title: 'Kenalan dulu dong.',                                    sub: 'Biar makin personal rencananya.' },
  { title: 'Kampus & jurusan impianmu?',                           sub: 'Pilih yang paling kamu incer.' },
  { title: 'Seberapa kuat profil rapormu?',                        sub: 'Semakin detail, semakin akurat proyeksi peluangmu.' },
  { title: 'Daftarkan prestasi & sertifikatmu.',                   sub: 'Opsional tapi penting — makin lengkap, makin kuat profilmu.' },
  { title: 'Punya draft esai atau motivasi awal?',                 sub: 'Opsional — AI otwptn bisa membantu mengembangkannya.' },
  { title: 'Suka belajar & nulis dengan cara apa?',                sub: 'Untuk menentukan metode persiapan esai kamu.' },
  { title: 'Ini yang bikin kamu beda di jalur non-tes.',           sub: 'Pahami kenapa rapor, esai, dan prestasi itu kunci.' },
  { title: 'Tantangan terbesarmu apa?',                            sub: 'Biar aku siapin solusi yang tepat buat kamu.' },
  { title: 'Sehari mau dedikasikan berapa jam?',                   sub: 'Dan hari apa aja kamu sempat?' },
  { title: 'Kalau rencana ini jalan terus...',                     sub: 'Begini kira-kira total persiapanmu nanti.' },
  { title: 'Biar nggak cuma niat doang.',                          sub: 'Yuk bikin rencana konkretnya.' },
  { title: 'Terakhir, ceritain motivasimu.',                       sub: 'Opsional — ini jadi modal AI bantu nulis esaimu nanti.' },
  { title: 'Ringkasan rencanamu.',                                  sub: 'Semua udah aku rangkum di sini.' },
  { title: 'Janji sama diri sendiri.',                             sub: 'Tahan tombolnya sampai penuh ya.' },
  { title: 'Menyusun rencanamu...',                                sub: 'Tunggu sebentar ya.' },
  { title: 'Semua siap! Gas mulai.',                               sub: 'Rencanamu udah tersimpan.' },
]

const TOTAL_STEPS = STEP_COPY.length  // 21

// ── Form state ────────────────────────────────────────────────────────────────

interface PrestasiItem {
  judul: string
  tingkat: string
  penyelenggara: string
  tahun: string
  files: File[]
}

interface FormData {
  kelas: string
  jalur_tujuan: string
  confidence: number
  full_name: string
  school_name: string
  school_tier: string
  target_ptns: string[]
  target_majors: string
  avg_rapor: string
  rapor_per_semester: string[]
  peminatan: string
  rapor_mapel: Record<string, string>
  school_rank_tier: string
  cert_count: string
  cert_highest_level: string
  prestasi_list: PrestasiItem[]
  essay_draft: string
  learning_styles: string[]
  biggest_challenge: string
  daily_study_hours: number
  study_days: boolean[]
  trigger: string
  fallback_plan: string
  motivation_text: string
  ambassador_code: string
}

const INIT: FormData = {
  kelas: '', jalur_tujuan: '', confidence: 50, full_name: '', school_name: '', school_tier: '',
  target_ptns: [], target_majors: '', avg_rapor: '', rapor_per_semester: ['', '', '', '', '', ''],
  peminatan: '', rapor_mapel: {}, school_rank_tier: '', cert_count: '', cert_highest_level: '',
  prestasi_list: [], essay_draft: '', learning_styles: [], biggest_challenge: '', daily_study_hours: 0,
  study_days: Array(7).fill(false), trigger: '', fallback_plan: '', motivation_text: '', ambassador_code: '',
}

// ── Small components ──────────────────────────────────────────────────────────

function MascotBubble({ step, titleOverride, subOverride }: { step: number; titleOverride?: string; subOverride?: string }) {
  const copy = STEP_COPY[step]
  return (
    <div className="flex flex-col items-center mb-5">
      <motion.div
        key={`mascot-${step}`}
        initial={{ scale: 0.55, opacity: 0, y: 18 }}
        animate={{ scale: 1, opacity: 1, y: [0, -9, 0] }}
        transition={{
          scale: { type: 'spring', stiffness: 230, damping: 17 },
          opacity: { duration: 0.3 },
          y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.7 },
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={MASCOTS[step]}
          alt=""
          style={{
            display: 'block',
            width: 220,
            height: 220,
            objectFit: 'contain',
            filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.10))',
            mixBlendMode: 'multiply',
          }}
        />
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 14, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full rounded-2xl px-5 py-3.5 mt-1"
          style={{ background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(20px) saturate(2)', boxShadow: '0 4px 16px rgba(0,0,0,0.07), inset 0 0 0 1px rgba(255,255,255,0.5)' }}
        >
          <p className="text-[15px] font-bold mb-0.5 text-center" style={{ fontFamily: 'var(--font-heading)', color: 'var(--fg)', letterSpacing: '-0.01em' }}>{titleOverride ?? copy.title}</p>
          <p className="text-xs text-center" style={{ color: 'var(--muted)' }}>{subOverride ?? copy.sub}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function OptionRow({ label, sub, active, onClick }: { label: string; sub?: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button type="button" onClick={() => { playSfx('select'); onClick() }} whileTap={{ scale: 0.98 }}
      className="w-full flex items-center justify-between text-left px-4 py-3.5 rounded-xl transition-colors"
      style={{ background: active ? 'rgba(255,212,0,0.16)' : 'rgba(255,255,255,0.6)', border: active ? '1.5px solid #ffd400' : '1.5px solid rgba(0,0,0,0.08)' }}>
      <span>
        <span className="block text-sm font-semibold" style={{ color: active ? '#8a6500' : 'var(--fg)' }}>{label}</span>
        {sub && <span className="block text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{sub}</span>}
      </span>
      {active && (
        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ml-3" style={{ background: '#ffd400' }}>
          <Check size={12} color="#111" strokeWidth={3} />
        </motion.span>
      )}
    </motion.button>
  )
}

function Caption({ text }: { text: string }) {
  return (
    <AnimatePresence mode="wait">
      <motion.p key={text} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center text-sm font-semibold mt-3" style={{ color: 'var(--fg)' }}>
        {text}
      </motion.p>
    </AnimatePresence>
  )
}

function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg)' }}>{label}</label>
      {children}
    </div>
  )
}

function SchoolInput({ value, onChange }: { value: string; onChange: (v: string, info: SMANInfo | null) => void }) {
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState<SMANInfo[]>([])
  const [selected, setSelected] = useState<SMANInfo | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleChange(v: string) {
    onChange(v, null)
    setSelected(null)
    setOpen(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (v.length < 2) { setResults([]); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/schools?q=${encodeURIComponent(v)}`)
        const data = await res.json()
        setResults(data)
      } catch { setResults([]) }
    }, 220)
  }

  return (
    <div className="relative">
      <div className="relative">
        <input value={value} onChange={e => handleChange(e.target.value)}
          onFocus={() => { setOpen(true); if (value.length >= 2 && results.length === 0) handleChange(value) }}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Ketik nama SMA/MA/SMK kamu" className="input pr-9" />
        {value && <button type="button" onClick={() => { onChange('', null); setSelected(null); setResults([]) }} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80"><X size={14} /></button>}
      </div>
      {open && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden" style={{ background: 'white', boxShadow: '0 8px 28px rgba(0,0,0,0.14)', border: '1.5px solid rgba(0,0,0,0.09)' }}>
          {results.map(s => (
            <button key={s.name} type="button" onMouseDown={() => { onChange(s.name, s); setSelected(s); setOpen(false); playSfx('select') }}
              className="w-full flex items-center justify-between px-4 py-3 text-left transition-colors hover:bg-amber-50">
              <div>
                <div className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>{s.name}</div>
                <div className="text-[11px]" style={{ color: 'var(--muted)' }}>{s.kota}, {s.prov}</div>
              </div>
              <div className="flex flex-col items-end gap-0.5 ml-2 flex-shrink-0">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={TIER_STYLE[s.tier]}>{s.tier}</span>
                {s.rank && <span className="text-[9px]" style={{ color: 'var(--muted)' }}>#{s.rank} Nas.</span>}
              </div>
            </button>
          ))}
        </div>
      )}
      {selected && !open && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="mt-2 flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(255,212,0,0.12)', border: '1px solid rgba(255,212,0,0.3)' }}>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0" style={TIER_STYLE[selected.tier]}>Tier {selected.tier}</span>
          <span className="text-[11px]" style={{ color: 'var(--muted)' }}>
            {selected.rank ? `#${selected.rank} Nasional · ` : ''}{selected.kota}, {selected.prov}
          </span>
        </motion.div>
      )}
      {value.length > 2 && !selected && results.length === 0 && !open && (
        <p className="text-[11px] mt-1.5" style={{ color: 'var(--muted)' }}>Tidak ditemukan di database kami — tidak apa-apa, ketik nama lengkapnya saja!</p>
      )}
    </div>
  )
}

function JurusanPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const filtered = q.length > 0 ? JURUSAN_LIST.filter(j => j.toLowerCase().includes(q.toLowerCase())).slice(0, 8) : []
  return (
    <div className="relative">
      <div className="relative">
        <input value={value || q} onChange={e => { setQ(e.target.value); onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Cari atau ketik jurusan..." className="input pr-9" />
        {(value || q) && <button type="button" onClick={() => { onChange(''); setQ('') }} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80"><X size={14} /></button>}
      </div>
      {open && filtered.length > 0 && (
        <div className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden" style={{ background: 'white', boxShadow: '0 8px 28px rgba(0,0,0,0.14)', border: '1.5px solid rgba(0,0,0,0.09)', maxHeight: 260, overflowY: 'auto' }}>
          {filtered.map(j => (
            <button key={j} type="button" onMouseDown={() => { onChange(j); setQ(''); setOpen(false); playSfx('select') }}
              className="w-full text-left px-4 py-2.5 text-sm hover:bg-amber-50 transition-colors" style={{ color: 'var(--fg)' }}>
              {j}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Flying bees for the final celebration
function FlyingBees() {
  const bees = ['/bee1-hd.png', '/bee2-hd.png', '/bee3-hd.png', '/bee1-hd.png', '/bee2-hd.png']
  return (
    <div className="pointer-events-none" style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
      {bees.map((src, i) => (
        <motion.div key={i}
          initial={{ x: -100 - i * 60, y: 100 + i * 80, opacity: 0, scale: 0.5, rotate: -20 }}
          animate={{ x: [null, 200 + i * 120, 400 + i * 80, 700 + i * 60], y: [null, 50 + i * 30, 150 + i * 40, -50 - i * 20], opacity: [0, 1, 1, 0], scale: [0.5, 0.8 + i * 0.1, 0.9, 0.6], rotate: [-20, 15, -10, 20] }}
          transition={{ duration: 2.5, delay: i * 0.3, ease: 'easeInOut' }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" style={{ width: 60 + i * 12, height: 'auto', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))' }} />
        </motion.div>
      ))}
    </div>
  )
}

const TINGKAT_OPTIONS = ['Lokal/Kota', 'Provinsi', 'Nasional', 'Internasional']

function PrestasiStep({ list, onChange }: { list: PrestasiItem[]; onChange: (l: PrestasiItem[]) => void }) {
  function addNew() {
    const newItem: PrestasiItem = { judul: '', tingkat: '', penyelenggara: '', tahun: '', files: [] }
    onChange([...list, newItem])
    playSfx('select')
  }

  function update(i: number, patch: Partial<PrestasiItem>) {
    const next = list.map((item, idx) => idx === i ? { ...item, ...patch } : item)
    onChange(next)
  }

  function remove(i: number) {
    onChange(list.filter((_, idx) => idx !== i))
    playSfx('select')
  }

  function handleFiles(i: number, files: FileList | null) {
    if (!files) return
    const accepted = Array.from(files).filter(f => f.size < 10 * 1024 * 1024)
    update(i, { files: [...list[i].files, ...accepted] })
  }

  function removeFile(itemIdx: number, fileIdx: number) {
    const newFiles = list[itemIdx].files.filter((_, fi) => fi !== fileIdx)
    update(itemIdx, { files: newFiles })
  }

  return (
    <div className="space-y-3">
      {list.length === 0 && (
        <p className="text-xs text-center py-2" style={{ color: 'var(--muted)' }}>
          Belum ada prestasi. Tambahkan satu per satu — bisa olimpiade, lomba, organisasi, dll.
        </p>
      )}
      {list.map((item, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl p-3.5 space-y-2.5" style={{ background: 'rgba(255,255,255,0.65)', border: '1.5px solid rgba(0,0,0,0.08)' }}>
          <div className="flex items-start justify-between gap-2">
            <input value={item.judul} onChange={e => update(i, { judul: e.target.value })}
              placeholder="Judul prestasi / nama lomba" className="input text-sm flex-1" />
            <button onClick={() => remove(i)} className="p-1.5 rounded-lg flex-shrink-0" style={{ color: 'var(--muted)' }}>
              <Trash2 size={14} />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {TINGKAT_OPTIONS.map(t => (
              <button key={t} onClick={() => update(i, { tingkat: t })}
                className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                style={{ background: item.tingkat === t ? '#ffd400' : 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(0,0,0,0.08)', color: '#111' }}>
                {t}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={item.penyelenggara} onChange={e => update(i, { penyelenggara: e.target.value })}
              placeholder="Penyelenggara" className="input text-xs" />
            <input value={item.tahun} onChange={e => update(i, { tahun: e.target.value })}
              placeholder="Tahun" type="number" min={2010} max={2030} className="input text-xs" />
          </div>
          <div>
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer text-xs font-semibold"
              style={{ background: 'rgba(255,212,0,0.1)', border: '1.5px dashed rgba(255,212,0,0.5)', color: 'var(--fg)' }}>
              <Upload size={13} />
              Upload sertifikat (PDF/JPG/PNG, maks 10MB)
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple className="hidden"
                onChange={e => handleFiles(i, e.target.files)} />
            </label>
            {item.files.length > 0 && (
              <div className="mt-1.5 space-y-1">
                {item.files.map((f, fi) => (
                  <div key={fi} className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg"
                    style={{ background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(0,0,0,0.07)' }}>
                    <span className="text-[11px] truncate" style={{ color: 'var(--fg)' }}>{f.name}</span>
                    <button onClick={() => removeFile(i, fi)} style={{ color: 'var(--muted)', flexShrink: 0 }}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
      <button onClick={addNew}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
        style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px dashed rgba(0,0,0,0.15)', color: 'var(--fg)' }}>
        <Plus size={15} /> Tambah Prestasi
      </button>
      <p className="text-[11px] text-center" style={{ color: 'var(--muted)' }}>
        Opsional — kalau belum ada prestasi, langsung lanjut aja
      </p>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [step, setStep]         = useState(0)
  const [dir, setDir]           = useState(1)
  const [form, setForm]         = useState<FormData>(INIT)
  const [essayPicks, setEssayPicks] = useState<Set<number>>(new Set())
  const [essayRevealed, setEssayRevealed] = useState(false)
  const [committed, setCommitted]   = useState(false)
  const [loadingStage, setLoadingStage] = useState(0)
  const [showBees, setShowBees] = useState(false)
  const [showMapel, setShowMapel] = useState(false)
  const router = useRouter()
  const progressBarRef = useRef<HTMLDivElement>(null)

  function set<K extends keyof FormData>(k: K, v: FormData[K]) { setForm(p => ({ ...p, [k]: v })) }
  function toggleArr(k: 'target_ptns' | 'learning_styles', v: string) {
    setForm(p => ({ ...p, [k]: p[k].includes(v) ? p[k].filter(x => x !== v) : [...p[k], v] }))
  }
  function toggleDay(i: number) { setForm(p => { const d = [...p.study_days]; d[i] = !d[i]; return { ...p, study_days: d } }) }
  function setRaporSem(i: number, v: string) { setForm(p => { const s = [...p.rapor_per_semester]; s[i] = v; return { ...p, rapor_per_semester: s } }) }
  function setMapelVal(mapel: string, v: string) { setForm(p => ({ ...p, rapor_mapel: { ...p.rapor_mapel, [mapel]: v } })) }

  function goNext() { playSfx('next'); setDir(1); setStep(s => Math.min(s + 1, TOTAL_STEPS - 1)) }
  function goBack() { setDir(-1); setStep(s => Math.max(s - 1, 0)) }

  const studyDaysCount = form.study_days.filter(Boolean).length

  const canNext = useMemo(() => [
    true,          // 0 welcome
    form.kelas !== '',
    form.jalur_tujuan !== '',
    true,          // 3 confidence slider
    essayRevealed, // 4 essay must be submitted
    true,          // 5 gamified
    form.full_name.trim().length > 1 && form.school_name.trim().length > 1,
    form.target_ptns.length > 0,
    form.avg_rapor !== '',
    true,          // 9 prestasi optional
    true,          // 10 essay draft optional
    form.learning_styles.length > 0,
    true,          // 12 insight
    form.biggest_challenge !== '',
    form.daily_study_hours > 0 && studyDaysCount > 0,
    true,          // 15 proyeksi
    form.trigger !== '' && form.fallback_plan !== '',
    true,          // 17 motivasi optional
    true,          // 18 ringkasan
    committed,     // 19 janji
    false,         // 20 loading auto
    false,         // 21 final own CTA
  ][step], [step, form, essayRevealed, committed, studyDaysCount])

  const confidenceLabel = form.confidence < 26 ? 'Masih ragu-ragu' : form.confidence < 51 ? 'Cukup percaya diri' : form.confidence < 76 ? 'Yakin bisa!' : 'Sangat yakin lolos!'

  const jalurInfo = JALUR_OPTIONS.find(j => j.key === form.jalur_tujuan)
  const isEssay     = jalurInfo?.type === 'essay'
  const isPrestasi  = jalurInfo?.type === 'prestasi'
  const isHybrid    = jalurInfo?.type === 'hybrid'

  // Jalur-dependent copy overrides for MascotBubble
  const jalurStepCopy: { title: string; sub: string } | undefined = useMemo(() => {
    if (!jalurInfo) return undefined
    if (step === 8) {
      if (isPrestasi) return { title: 'Seberapa kuat profil rapormu?', sub: 'Rapor tetap penting meski bukan faktor utama di jalur prestasi.' }
      if (isEssay)   return { title: 'Seberapa kuat profil rapormu?', sub: 'Rapor & nilai akademik jadi fondasi kuat di jalur esai.' }
    }
    if (step === 9) {
      if (isPrestasi) return { title: 'Daftarkan prestasi & sertifikatmu.', sub: 'Ini komponen utama jalur prestasi — semakin detail, semakin kuat.' }
      if (isEssay)   return { title: 'Ada prestasi yang mau dicantumkan?', sub: 'Opsional untuk jalur esai, tapi bisa jadi nilai tambah.' }
    }
    if (step === 10) {
      if (isPrestasi) return { title: 'Punya draft motivasi awal?', sub: 'Biasanya jalur prestasi butuh surat rekomendasi atau motivasi singkat.' }
      if (isEssay)   return { title: 'Draft esai pertamamu yuk!', sub: 'Esai adalah jantung jalurmu — tulis bebas, AI bantu poles nanti.' }
    }
    if (step === 12) {
      if (isPrestasi) return { title: 'Ini yang bikin kamu unggul di jalur prestasi.', sub: 'Sertifikat & prestasi kamu adalah senjata utamanya.' }
      if (isEssay)   return { title: 'Ini yang bikin esaimu powerful.', sub: 'Kombinasi esai kuat + rapor baik = peluang lolos makin besar.' }
    }
    return undefined
  }, [step, jalurInfo, isPrestasi, isEssay])

  const { daysLeft, totalHours, deadlineYear } = useMemo(() => {
    const now = new Date()
    const dl = JALUR_DEADLINE[form.jalur_tujuan] || { month: 3, day: 15 }
    let year = now.getFullYear()
    let target = new Date(year, dl.month - 1, dl.day)
    if (now >= target) { year++; target = new Date(year, dl.month - 1, dl.day) }
    const days = Math.max(1, Math.round((target.getTime() - now.getTime()) / 86_400_000))
    const total = Math.round((form.daily_study_hours || 1) * ((studyDaysCount || 7) / 7) * days)
    return { daysLeft: days, totalHours: total, deadlineYear: year }
  }, [form.daily_study_hours, studyDaysCount, form.jalur_tujuan])

  const commitmentSentence = useMemo(() => {
    const base = `Aku dedikasikan ${form.daily_study_hours || '…'} jam/hari, ${studyDaysCount || '…'} hari/minggu, untuk persiapkan ${jalurInfo?.label || 'jalur non-tes'}.`
    const tail = [
      form.trigger && `Biasanya ${form.trigger.toLowerCase()}`,
      form.fallback_plan && `kalau lagi males aku ${form.fallback_plan.toLowerCase()}`,
    ].filter(Boolean).join(', ')
    return tail ? `${base} ${tail}.` : base
  }, [form.daily_study_hours, studyDaysCount, jalurInfo, form.trigger, form.fallback_plan])

  const peminatanMapel = form.peminatan === 'IPA' ? MAPEL_IPA : form.peminatan === 'IPS' ? MAPEL_IPS : form.peminatan === 'Bahasa' ? MAPEL_BAHASA : []

  useEffect(() => {
    if (step !== 20) return
    setLoadingStage(0)
    const tl = gsap.timeline({ onComplete: () => { void handleFinish() } })
    LOADING_STAGES.forEach((_, i) => {
      tl.call(() => setLoadingStage(i))
      tl.to(progressBarRef.current, { width: `${((i + 1) / LOADING_STAGES.length) * 100}%`, duration: 0.7, ease: 'power2.inOut' })
      tl.to({}, { duration: 0.25 })
    })
    tl.call(() => { setDir(1); setStep(21); fireConfetti(0.4, 0.3); setTimeout(() => { fireConfetti(0.6, 0.5); fireConfetti(0.3, 0.7) }, 400) })
    return () => { tl.kill() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  // Trigger fanfare + bees when landing on final step
  useEffect(() => {
    if (step !== 21) return
    playFanfare()
    setShowBees(true)
    setTimeout(() => setShowBees(false), 3500)
  }, [step])

  async function handleFinish() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const semFilled = form.rapor_per_semester.filter(v => v !== '' && !isNaN(parseFloat(v))).map(parseFloat)
    const computedAvg = semFilled.length > 0 ? semFilled.reduce((a, b) => a + b, 0) / semFilled.length : parseFloat(form.avg_rapor)

    // Upload sertifikat files and build prestasi_items payload
    const prestasiPayload = await Promise.all(form.prestasi_list.map(async item => {
      const uploadedUrls: string[] = []
      for (const file of item.files) {
        const ext = file.name.split('.').pop()
        const path = `prestasi/${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const { data } = await supabase.storage.from('uploads').upload(path, file, { upsert: false })
        if (data?.path) {
          const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(data.path)
          uploadedUrls.push(urlData.publicUrl)
        }
      }
      return { judul: item.judul, tingkat: item.tingkat, penyelenggara: item.penyelenggara, tahun: item.tahun, sertifikat_urls: uploadedUrls }
    }))

    await supabase.from('profiles').update({
      full_name: form.full_name, school_name: form.school_name,
      school_rank_tier: form.school_rank_tier || null,
      target_ptns: form.target_ptns,
      target_majors: form.target_majors ? [form.target_majors] : [],
      target_jalurs: [form.jalur_tujuan], jalur_tujuan: form.jalur_tujuan,
      avg_rapor: computedAvg || null,
      rapor_per_semester: semFilled.length > 0 ? form.rapor_per_semester : null,
      cert_count: form.cert_count ? parseInt(form.cert_count) : (form.prestasi_list.length || 0),
      cert_highest_level: form.cert_highest_level || null,
      prestasi_items: prestasiPayload,
      essay_draft: form.essay_draft || null,
      learning_styles: form.learning_styles,
      biggest_challenge: form.biggest_challenge,
      daily_question_target: form.daily_study_hours,
      study_days_per_week: studyDaysCount,
      commitment_text: commitmentSentence,
      motivation_text: form.motivation_text || null,
      ambassador_code: form.ambassador_code || null,
      target_score: form.confidence,
      onboarding_completed: true,
    }).eq('id', user.id)
  }

  function handleHoldComplete() {
    setCommitted(true)
    playSfx('complete')
    fireConfetti(0.5, 0.65)
    setTimeout(() => goNext(), 700)
  }

  const showParticles  = step === 0 || step === 21
  const showBackArrow  = step > 0 && step < 20
  const showFooterCta  = step !== 19 && step !== 20 && step !== 21

  // Grouped jalur for step 2 display
  const jalurGrouped = (['essay', 'prestasi', 'hybrid', 'other'] as JalurType[]).map(type => ({
    type, items: JALUR_OPTIONS.filter(j => j.type === type)
  })).filter(g => g.items.length > 0)

  return (
    <div className="min-h-screen relative" style={{ background: 'var(--hero-grad)' }}>
      {/* Separate clipped layer for particles & bees — never bleeds into content */}
      {(showParticles || showBees) && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
          {showParticles && <ParticleField />}
          {showBees && <FlyingBees />}
        </div>
      )}

      {/* Main content — NO overflow clipping so mascot can extend freely */}
      <div className="flex flex-col items-center px-4 pt-7 pb-10" style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {showBackArrow ? (
            <button onClick={goBack} className="p-2 -ml-2 rounded-xl" style={{ color: 'var(--muted)' }}><ArrowLeft size={18} /></button>
          ) : <div className="w-8" />}
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, letterSpacing: '-0.04em', color: 'var(--fg)' }}>otwptn</span>
          <span className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>{Math.min(step + 1, TOTAL_STEPS)}/{TOTAL_STEPS}</span>
        </div>

        {/* Progress */}
        <div className="h-1.5 rounded-full mb-7" style={{ background: 'rgba(0,0,0,0.08)' }}>
          <motion.div className="h-full rounded-full" style={{ background: '#111' }} animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }} transition={{ duration: 0.4, ease: 'easeInOut' }} />
        </div>

        <MascotBubble step={step} titleOverride={jalurStepCopy?.title} subOverride={jalurStepCopy?.sub} />

        {/* Step content */}
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={step} custom={dir} initial={{ opacity: 0, x: dir * 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: dir * -28 }} transition={{ duration: 0.28, ease: 'easeOut' }}
            className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(20px) saturate(1.8)', boxShadow: '0 8px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)' }}>

            {/* 0 welcome */}
            {step === 0 && (
              <div className="text-center py-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }} className="flex justify-center mb-4">
                  <Sparkles size={28} color="#ffd400" fill="#ffd400" />
                </motion.div>
                <p className="text-sm mb-1" style={{ color: 'var(--muted)' }}>otwptn khusus fokus di jalur <b>non-tes</b> —</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--fg)' }}>PPKB UI, SJP UI, SBUB, dan 30+ jalur prestasi lainnya.</p>
                <p className="text-xs mt-2" style={{ color: 'var(--muted)' }}>Kita susun rencana rapor, esai, dan strategi yang beneran cocok buat kamu.</p>
              </div>
            )}

            {/* 1 kelas */}
            {step === 1 && (
              <div className="space-y-2.5">
                {KELAS_OPTIONS.map(k => <OptionRow key={k} label={k} active={form.kelas === k} onClick={() => set('kelas', k)} />)}
                <p className="text-[11px] mt-1 text-center" style={{ color: 'var(--muted)' }}>Jalur non-tes biasanya membutuhkan status kelas 12 saat pendaftaran, namun persiapan bisa dimulai dari kelas 10.</p>
              </div>
            )}

            {/* 2 jalur — grouped by type */}
            {step === 2 && (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                {jalurGrouped.map(({ type, items }) => (
                  <div key={type}>
                    <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5 px-1" style={{ color: JALUR_TYPE_COLOR[type].text }}>{JALUR_TYPE_LABEL[type]}</p>
                    <div className="space-y-1.5">
                      {items.map(j => {
                        const active = form.jalur_tujuan === j.key
                        const tc = JALUR_TYPE_COLOR[j.type]
                        return (
                          <motion.button key={j.key} type="button" onClick={() => { set('jalur_tujuan', j.key); playSfx('select') }} whileTap={{ scale: 0.98 }}
                            className="w-full flex items-center justify-between text-left px-4 py-3 rounded-xl transition-colors"
                            style={{ background: active ? `${tc.bg}` : 'rgba(255,255,255,0.6)', border: active ? `1.5px solid ${tc.border}` : '1.5px solid rgba(0,0,0,0.08)' }}>
                            <div>
                              <span className="text-sm font-semibold block" style={{ color: active ? tc.text : 'var(--fg)' }}>{j.label}</span>
                              {j.ptn && <span className="text-[10px] font-bold" style={{ color: 'var(--muted)' }}>{j.ptn}</span>}
                            </div>
                            {active && <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ml-2" style={{ background: tc.border }}><Check size={11} color="#fff" strokeWidth={3} /></motion.span>}
                          </motion.button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 3 confidence slider */}
            {step === 3 && (
              <div>
                <div className="flex items-center justify-center gap-5 mb-4">
                  <button onClick={() => set('confidence', Math.max(0, form.confidence - 5))} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.06)' }}><Minus size={16} /></button>
                  <div className="text-center">
                    <div className="text-4xl font-extrabold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--fg)' }}>{form.confidence}%</div>
                    <div className="text-[11px] font-semibold" style={{ color: 'var(--muted)' }}>tingkat keyakinan</div>
                  </div>
                  <button onClick={() => set('confidence', Math.min(100, form.confidence + 5))} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.06)' }}><Plus size={16} /></button>
                </div>
                <input type="range" min={0} max={100} step={5} value={form.confidence} onChange={e => set('confidence', parseInt(e.target.value))} className="w-full accent-[#ffd400]" />
                <div className="flex justify-between text-[11px] font-semibold mt-1" style={{ color: 'var(--muted)' }}><span>Masih ragu</span><span>Sangat yakin</span></div>
                <Caption text={confidenceLabel} />
                <p className="text-center text-[11px] mt-2" style={{ color: 'var(--muted)' }}>otwptn akan bantu kamu naikan angka ini ke 90%+ lewat persiapan yang tepat.</p>
              </div>
            )}

            {/* 4 essay pemanasan */}
            {step === 4 && (
              <div>
                <p className="text-xs font-semibold mb-3" style={{ color: 'var(--fg)' }}>Temukan kalimat mana yang bermasalah dalam esai berikut (bisa lebih dari satu):</p>
                <div className="space-y-2 mb-4">
                  {ESSAY_SENTENCES.map(s => {
                    const picked = essayPicks.has(s.id)
                    const isIssue = s.id in ESSAY_ISSUES
                    let bg = picked ? 'rgba(255,212,0,0.18)' : 'rgba(255,255,255,0.65)'
                    let border = picked ? '1.5px solid #ffd400' : '1.5px solid rgba(0,0,0,0.08)'
                    if (essayRevealed) {
                      if (isIssue)  { bg = 'rgba(239,68,68,0.1)';   border = '1.5px solid #ef4444' }
                      else          { bg = 'rgba(34,197,94,0.1)';    border = '1.5px solid #22c55e' }
                    }
                    return (
                      <button key={s.id} disabled={essayRevealed}
                        onClick={() => { setEssayPicks(p => { const n = new Set(p); n.has(s.id) ? n.delete(s.id) : n.add(s.id); return n }); playSfx('select') }}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-colors"
                        style={{ background: bg, border, color: 'var(--fg)' }}>
                        <span className="font-semibold mr-1 text-[11px]" style={{ color: 'var(--muted)' }}>{s.id + 1}.</span> {s.text}
                        {essayRevealed && isIssue && <p className="text-[11px] mt-1 font-semibold" style={{ color: '#b91c1c' }}>⚠ {ESSAY_ISSUES[s.id]}</p>}
                        {essayRevealed && !isIssue && <p className="text-[11px] mt-1 font-semibold" style={{ color: '#166534' }}>Kalimat ini sudah cukup baik.</p>}
                      </button>
                    )
                  })}
                </div>
                {!essayRevealed && (
                  <button onClick={() => { setEssayRevealed(true); playSfx('correct') }}
                    disabled={essayPicks.size === 0}
                    className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-40"
                    style={{ background: '#ffd400', color: '#111' }}>
                    Cek Jawabanku
                  </button>
                )}
                {essayRevealed && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 p-3 rounded-xl" style={{ background: 'rgba(0,0,0,0.04)' }}>
                    <p className="text-[11px] font-semibold" style={{ color: 'var(--fg)' }}>Kalimat 1, 2, 3, dan 5 punya masalah. Kalimat 4 sudah cukup baik, meski perlu argumen lebih kuat.</p>
                  </motion.div>
                )}
              </div>
            )}

            {/* 5 gamified hasil */}
            {step === 5 && (
              <div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'Terdeteksi', val: `${essayPicks.size}/${Object.keys(ESSAY_ISSUES).length}` },
                    { label: 'Jalur',      val: jalurInfo?.ptn || '—' },
                    { label: 'XP',         val: '+15' },
                  ].map(s => (
                    <div key={s.label} className="rounded-xl py-3 text-center" style={{ background: 'rgba(255,255,255,0.65)', border: '1px solid rgba(0,0,0,0.06)' }}>
                      <div className="text-base font-extrabold leading-tight" style={{ fontFamily: 'var(--font-heading)', color: 'var(--fg)' }}>{s.val}</div>
                      <div className="text-[10px] font-semibold mt-0.5" style={{ color: 'var(--muted)' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col items-center py-3">
                  <motion.div animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
                    <Flame size={48} color="#ff8a00" fill="#ffb347" />
                  </motion.div>
                  <div className="text-2xl font-extrabold mt-1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--fg)' }}>1</div>
                  <div className="text-xs font-semibold" style={{ color: 'var(--muted)' }}>Hari persiapan ke-1</div>
                </div>
              </div>
            )}

            {/* 6 kenalan */}
            {step === 6 && (
              <div className="space-y-3">
                <Field label="Nama Lengkap">
                  <input value={form.full_name} onChange={e => set('full_name', e.target.value)} placeholder="Nama kamu" className="input" />
                </Field>
                <Field label="Nama Sekolah">
                  <SchoolInput value={form.school_name} onChange={(v, info) => { set('school_name', v); if (info) set('school_tier', info.tier) }} />
                </Field>
              </div>
            )}

            {/* 7 kampus + jurusan */}
            {step === 7 && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--fg)' }}>Kampus impian (bisa pilih lebih dari satu)</p>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {PTN_LIST.map(p => {
                    const active = form.target_ptns.includes(p.name)
                    return (
                      <button key={p.code} onClick={() => { toggleArr('target_ptns', p.name); playSfx('select') }}
                        className="flex flex-col items-center gap-1 py-2 rounded-xl transition-colors"
                        style={{ background: active ? 'rgba(255,212,0,0.18)' : 'rgba(255,255,255,0.6)', border: active ? '1.5px solid #ffd400' : '1.5px solid rgba(0,0,0,0.08)' }}>
                        {p.logo
                          ? <Image src={p.logo} alt={p.name} width={26} height={26} style={{ width: 26, height: 26, objectFit: 'contain' }} />
                          : <div className="flex items-center justify-center rounded-full text-[8px] font-black" style={{ width: 26, height: 26, background: '#eef2f8', color: '#1e40af', letterSpacing: '-0.5px' }}>{p.code.toUpperCase()}</div>
                        }
                        <span className="text-[10px] font-bold uppercase" style={{ color: 'var(--fg)' }}>{p.code}</span>
                      </button>
                    )
                  })}
                </div>
                {/* Lainnya — custom PTN */}
                <div className="mb-4">
                  <p className="text-[11px] font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>PTN lainnya? Ketik nama kampus:</p>
                  <input
                    placeholder="cth: Universitas Brawijaya, ITB, UGM..."
                    className="input text-sm"
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault()
                        const v = (e.currentTarget.value).trim()
                        if (v && !form.target_ptns.includes(v)) { toggleArr('target_ptns', v); playSfx('select') }
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                  <p className="text-[10px] mt-1" style={{ color: 'var(--muted)' }}>Tekan Enter atau koma untuk menambahkan</p>
                </div>
                {form.target_ptns.filter(p => !PTN_LIST.map(x => x.name).includes(p)).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {form.target_ptns.filter(p => !PTN_LIST.map(x => x.name).includes(p)).map(p => (
                      <span key={p} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: 'rgba(255,212,0,0.18)', border: '1.5px solid #ffd400', color: '#111' }}>
                        {p}
                        <button onClick={() => toggleArr('target_ptns', p)} style={{ color: 'var(--muted)' }}><X size={11} /></button>
                      </span>
                    ))}
                  </div>
                )}
                <Field label="Jurusan yang diminati">
                  <JurusanPicker value={form.target_majors} onChange={v => set('target_majors', v)} />
                </Field>
              </div>
            )}

            {/* 8 rapor profile */}
            {step === 8 && (
              <div className="space-y-4">
                {/* Wajib: total avg */}
                <Field label={<>Rata-rata Rapor Total <span className="text-red-500">*</span></>}>
                  <input type="number" value={form.avg_rapor} onChange={e => set('avg_rapor', e.target.value)} placeholder="cth: 88.5" min={0} max={100} step={0.1} className="input" />
                </Field>
                <p className="text-[11px] -mt-2" style={{ color: 'var(--muted)' }}>
                  {isPrestasi
                    ? 'Rapor mendukung profilmu meski bukan faktor utama — tetap isi ya.'
                    : isEssay
                    ? 'Rapor & nilai akademik jadi fondasi penting di jalur esai.'
                    : 'Semakin detail infonya, semakin akurat proyeksi peluangmu di jalur non-tes.'}
                </p>

                {/* Opsional: per semester */}
                <details className="rounded-xl overflow-hidden" style={{ border: '1.5px solid rgba(0,0,0,0.08)' }}>
                  <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none" style={{ background: 'rgba(255,255,255,0.6)' }}>
                    <span className="text-xs font-semibold" style={{ color: 'var(--fg)' }}>Nilai per semester <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(opsional)</span></span>
                    <ChevronDown size={14} style={{ color: 'var(--muted)' }} />
                  </summary>
                  <div className="px-4 pb-4 pt-2 grid grid-cols-3 gap-2" style={{ background: 'rgba(255,255,255,0.4)' }}>
                    {['Sem 1','Sem 2','Sem 3','Sem 4','Sem 5','Sem 6'].map((sem, i) => (
                      <div key={sem}>
                        <label className="block text-[10px] font-semibold mb-1" style={{ color: 'var(--muted)' }}>{sem}</label>
                        <input type="number" value={form.rapor_per_semester[i]} onChange={e => setRaporSem(i, e.target.value)}
                          placeholder="—" min={0} max={100} step={0.1} className="input text-center py-2" style={{ fontSize: 13 }} />
                      </div>
                    ))}
                  </div>
                </details>

                {/* Opsional: per mapel */}
                <details className="rounded-xl overflow-hidden" style={{ border: '1.5px solid rgba(0,0,0,0.08)' }}>
                  <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none" style={{ background: 'rgba(255,255,255,0.6)' }}>
                    <span className="text-xs font-semibold" style={{ color: 'var(--fg)' }}>Nilai per mata pelajaran <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(opsional)</span></span>
                    <ChevronDown size={14} style={{ color: 'var(--muted)' }} />
                  </summary>
                  <div className="px-4 pb-4 pt-2" style={{ background: 'rgba(255,255,255,0.4)' }}>
                    <p className="text-[11px] mb-2" style={{ color: 'var(--muted)' }}>Peminatan:</p>
                    <div className="flex gap-2 mb-3">
                      {['IPA', 'IPS', 'Bahasa'].map(p => (
                        <button key={p} onClick={() => set('peminatan', p)} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: form.peminatan === p ? '#ffd400' : 'rgba(255,255,255,0.7)', border: '1.5px solid rgba(0,0,0,0.08)', color: '#111' }}>{p}</button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      {[...MAPEL_WAJIB, ...peminatanMapel].map(mapel => (
                        <div key={mapel} className="flex items-center gap-3">
                          <span className="text-xs flex-1 truncate" style={{ color: 'var(--fg)' }}>{mapel}</span>
                          <input type="number" value={form.rapor_mapel[mapel] || ''} onChange={e => setMapelVal(mapel, e.target.value)}
                            placeholder="—" min={0} max={100} step={0.1} className="input py-1.5" style={{ fontSize: 13, width: 70 }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </details>

                {/* Prestasi */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Jumlah Sertifikat Prestasi">
                    <input type="number" value={form.cert_count} onChange={e => set('cert_count', e.target.value)} placeholder="0" min={0} className="input" />
                  </Field>
                  <div>
                    <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--fg)' }}>Level Tertinggi</p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Sekolah','Kab/Kota','Provinsi','Nasional','Internasional'].map(l => (
                        <button key={l} onClick={() => { set('cert_highest_level', l); playSfx('select') }} className="px-2 py-1.5 rounded-full text-[11px] font-semibold"
                          style={{ background: form.cert_highest_level === l ? '#ffd400' : 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(0,0,0,0.08)', color: '#111' }}>{l}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 9 prestasi upload */}
            {step === 9 && (
              <PrestasiStep
                list={form.prestasi_list}
                onChange={list => set('prestasi_list', list)}
              />
            )}

            {/* 10 essay draft (opsional, own step) */}
            {step === 10 && (
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg)' }}>
                  {isPrestasi ? 'Surat motivasi / cerita diri' : 'Draft esai / surat motivasi'}{' '}
                  <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(opsional)</span>
                </label>
                {isPrestasi && (
                  <div className="mb-2 px-3 py-2 rounded-xl text-[11px] font-semibold" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#166534' }}>
                    Jalur prestasi biasanya butuh surat motivasi singkat atau cerita latar belakang. Tulis bebas dulu.
                  </div>
                )}
                {isEssay && (
                  <div className="mb-2 px-3 py-2 rounded-xl text-[11px] font-semibold" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', color: '#1e40af' }}>
                    Esai adalah komponen utama jalurmu. Draft awal apapun membantu — AI akan memolesnya nanti.
                  </div>
                )}
                <textarea value={form.essay_draft} onChange={e => set('essay_draft', e.target.value)} rows={6}
                  placeholder={isPrestasi
                    ? 'Ceritain siapa kamu, prestasi terbaik yang pernah kamu raih, dan kenapa kamu mau masuk jalur ini...'
                    : 'Ceritain singkat siapa kamu, apa prestasi terbaikmu, dan kenapa kamu layak masuk jalur ini. Tulis bebas — AI otwptn akan membantu mengembangkannya nanti...'}
                  className="input resize-none" style={{ height: 150 }} />
                {form.essay_draft.length > 0 && <p className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>{form.essay_draft.length} karakter · AI akan bantu poles ini menjadi {isPrestasi ? 'surat motivasi' : 'esai'} yang kuat</p>}
              </div>
            )}

            {/* 11 gaya belajar */}
            {step === 11 && (
              <div className="space-y-2.5">
                {LEARNING_STYLES.map(l => <OptionRow key={l} label={l} active={form.learning_styles.includes(l)} onClick={() => toggleArr('learning_styles', l)} />)}
              </div>
            )}

            {/* 12 insight — bars are 100% jalur-type-dependent */}
            {step === 12 && (() => {
              const bars = isPrestasi
                ? [
                    { label: 'Prestasi & Sertifikat',  pct: 60, color: '#22c55e' },
                    { label: 'Rapor & Nilai Akademik', pct: 30, color: '#ffd400' },
                    { label: 'Esai & Surat Motivasi',  pct: 10, color: '#3b82f6' },
                  ]
                : isEssay
                ? [
                    { label: 'Esai & Surat Motivasi',  pct: 45, color: '#3b82f6' },
                    { label: 'Rapor & Nilai Akademik', pct: 45, color: '#ffd400' },
                    { label: 'Prestasi & Sertifikat',  pct: 10, color: '#22c55e' },
                  ]
                : isHybrid
                ? [
                    { label: 'Prestasi & Sertifikat',  pct: 40, color: '#22c55e' },
                    { label: 'Rapor & Nilai Akademik', pct: 35, color: '#ffd400' },
                    { label: 'Esai & Surat Motivasi',  pct: 25, color: '#3b82f6' },
                  ]
                : [
                    { label: 'Rapor & Nilai Akademik', pct: 40, color: '#ffd400' },
                    { label: 'Esai & Surat Motivasi',  pct: 35, color: '#3b82f6' },
                    { label: 'Prestasi & Sertifikat',  pct: 25, color: '#22c55e' },
                  ]
              const jalurLabel = isPrestasi ? 'Prestasi Only' : isEssay ? 'Jalur Esai' : isHybrid ? 'Prestasi + Esai' : 'Non-Tes Umum'
              return (
                <div key={form.jalur_tujuan}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold" style={{ color: 'var(--fg)' }}>Bobot penilaian di jalurmu:</p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.07)', color: 'var(--muted)' }}>{jalurLabel}</span>
                  </div>
                  <div className="space-y-3 mb-3">
                    {bars.map((item, i) => (
                      <div key={item.label}>
                        <div className="flex justify-between text-[11px] font-semibold mb-1" style={{ color: 'var(--fg)' }}><span>{item.label}</span><span>{item.pct}%</span></div>
                        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
                          <motion.div key={`${form.jalur_tujuan}-${item.label}`} initial={{ width: 0 }} animate={{ width: `${item.pct}%` }} transition={{ duration: 0.8, delay: i * 0.15, ease: 'easeOut' }} className="h-full rounded-full" style={{ background: item.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-[11px]" style={{ color: 'var(--muted)' }}>Estimasi bobot untuk <b>{jalurInfo?.label || 'jalurmu'}</b> — bervariasi antar universitas</p>
                </div>
              )
            })()}

            {/* 13 tantangan */}
            {step === 13 && (
              <div className="space-y-2.5">
                {CHALLENGE_OPTIONS.map(c => <OptionRow key={c.key} label={c.label} active={form.biggest_challenge === c.key} onClick={() => set('biggest_challenge', c.key)} />)}
                {form.biggest_challenge && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,212,0,0.14)', border: '1px solid rgba(255,212,0,0.4)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={CHALLENGE_FEATURES[form.biggest_challenge].icon} alt="" style={{ width: 40, height: 40, objectFit: 'contain' }} />
                    <div>
                      <p className="text-xs font-bold" style={{ color: 'var(--fg)' }}>{CHALLENGE_FEATURES[form.biggest_challenge].title}</p>
                      <p className="text-[11px]" style={{ color: 'var(--muted)' }}>{CHALLENGE_FEATURES[form.biggest_challenge].desc}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* 14 jadwal */}
            {step === 14 && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--fg)' }}>Target jam persiapan per hari</p>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {DAILY_HOURS.map(d => (
                    <button key={d.n} onClick={() => { set('daily_study_hours', d.n); playSfx('select') }}
                      className="rounded-xl py-3 text-center transition-colors"
                      style={{ background: form.daily_study_hours === d.n ? 'rgba(255,212,0,0.18)' : 'rgba(255,255,255,0.6)', border: form.daily_study_hours === d.n ? '1.5px solid #ffd400' : '1.5px solid rgba(0,0,0,0.08)' }}>
                      <div className="text-lg font-extrabold" style={{ fontFamily: 'var(--font-heading)', color: 'var(--fg)' }}>{d.n} jam</div>
                      <div className="text-[10px] font-semibold" style={{ color: 'var(--muted)' }}>{d.label}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--fg)' }}>Hari apa aja kamu sempat?</p>
                <div className="flex justify-between">
                  {DAYS.map((d, i) => (
                    <button key={d} onClick={() => { toggleDay(i); playSfx('select') }}
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors"
                      style={{ background: form.study_days[i] ? '#ffd400' : 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(0,0,0,0.08)', color: '#111' }}>
                      {d[0]}
                    </button>
                  ))}
                </div>
                {studyDaysCount > 0 && <Caption text={studyDaysCount === 7 ? 'Tiap hari, luar biasa!' : `${studyDaysCount}x seminggu, siap!`} />}
              </div>
            )}

            {/* 15 proyeksi jam */}
            {step === 15 && <GrowthCurve totalQuestions={totalHours} daysLeft={daysLeft} />}

            {/* 16 rencana konkret */}
            {step === 16 && (
              <div className="space-y-4">
                <div className="rounded-xl p-3.5 text-sm font-semibold leading-relaxed" style={{ background: 'rgba(255,255,255,0.65)', border: '1.5px solid rgba(0,0,0,0.08)', color: 'var(--fg)' }}>
                  {commitmentSentence}
                </div>
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--fg)' }}>Biasanya kapan kamu sempat?</p>
                  <div className="flex flex-wrap gap-2">
                    {TRIGGER_OPTIONS.map(t => <button key={t} onClick={() => { set('trigger', t); playSfx('select') }} className="px-3.5 py-2 rounded-full text-xs font-semibold" style={{ background: form.trigger === t ? '#ffd400' : 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(0,0,0,0.08)', color: '#111' }}>{t}</button>)}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: 'var(--fg)' }}>Kalau lagi males, kamu bakal...</p>
                  <div className="flex flex-col gap-2">
                    {FALLBACK_OPTIONS.map(f => <button key={f} onClick={() => { set('fallback_plan', f); playSfx('select') }} className="text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold" style={{ background: form.fallback_plan === f ? 'rgba(255,212,0,0.18)' : 'rgba(255,255,255,0.6)', border: form.fallback_plan === f ? '1.5px solid #ffd400' : '1.5px solid rgba(0,0,0,0.08)', color: 'var(--fg)' }}>{f}</button>)}
                  </div>
                </div>
              </div>
            )}

            {/* 17 motivasi (opsional) + ambassador code */}
            {step === 17 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg)' }}>Motivasimu masuk PTN non-tes impian <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(opsional)</span></label>
                  <textarea value={form.motivation_text} onChange={e => set('motivation_text', e.target.value)} rows={4}
                    placeholder="Kenapa kamu ingin masuk PTN itu? Apa yang mau kamu capai? Ceritain bebas..." className="input resize-none" style={{ height: 100 }} />
                  {form.motivation_text.length > 0 && <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{form.motivation_text.length} karakter</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--fg)' }}>Kode Ambassador <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(opsional)</span></label>
                  <input value={form.ambassador_code} onChange={e => set('ambassador_code', e.target.value.toUpperCase())} placeholder="KODE123" className="input" style={{ letterSpacing: '0.1em' }} />
                  <p className="text-[11px] mt-1" style={{ color: 'var(--muted)' }}>Dapat kode dari teman atau ambassador? Masukkan di sini!</p>
                </div>
              </div>
            )}

            {/* 18 ringkasan */}
            {step === 18 && (
              <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }} className="space-y-2">
                {[
                  { label: 'Jalur Target',  val: jalurInfo?.label || '—' },
                  { label: 'Kampus Impian', val: form.target_ptns[0] || '—' },
                  { label: 'Keyakinan',     val: `${form.confidence}% — ${confidenceLabel}` },
                  { label: 'Komitmen',      val: `${form.daily_study_hours} jam · ${studyDaysCount}x/minggu` },
                  { label: 'Total Persiapan', val: `±${totalHours} jam sampai ${deadlineYear}` },
                ].map(row => (
                  <motion.div key={row.label} variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0 } }}
                    className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.65)', border: '1.5px solid rgba(0,0,0,0.08)' }}>
                    <div>
                      <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>{row.label}</div>
                      <div className="text-sm font-bold" style={{ color: 'var(--fg)' }}>{row.val}</div>
                    </div>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ml-3" style={{ background: '#22c55e' }}>
                      <Check size={13} color="#fff" strokeWidth={3} />
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* 19 janji / hold — PALING TERAKHIR sebelum loading */}
            {step === 19 && (
              <div>
                <div className="rounded-xl p-3.5 text-sm font-bold leading-relaxed text-center mb-5" style={{ background: 'rgba(255,255,255,0.65)', border: '1.5px solid rgba(0,0,0,0.08)', color: 'var(--fg)' }}>
                  {commitmentSentence}
                </div>
                <HoldButton onComplete={handleHoldComplete} />
              </div>
            )}

            {/* 20 loading */}
            {step === 20 && (
              <div className="py-4">
                <div className="h-2 rounded-full mb-5 overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
                  <div ref={progressBarRef} className="h-full rounded-full" style={{ background: '#ffd400', width: '0%' }} />
                </div>
                <AnimatePresence mode="wait">
                  <motion.p key={loadingStage} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center text-sm font-bold" style={{ color: 'var(--fg)' }}>
                    {LOADING_STAGES[loadingStage]}
                  </motion.p>
                </AnimatePresence>
              </div>
            )}

            {/* 21 selesai + celebration */}
            {step === 21 && (
              <div className="text-center py-5">
                <motion.div animate={{ rotate: [0, -10, 10, -7, 4, 0], scale: [1, 1.15, 1.05, 1.1, 1] }} transition={{ duration: 0.8, delay: 0.1 }} className="flex justify-center mb-4">
                  <Star size={44} color="#ffd400" fill="#ffd400" />
                </motion.div>
                <p className="text-base font-bold mb-1" style={{ color: 'var(--fg)' }}>Yeay, rencanamu siap!</p>
                <p className="text-sm mb-2" style={{ color: 'var(--muted)' }}>Selamat berjuang meraih <b>{jalurInfo?.label || 'jalur non-tes'}</b> impianmu!</p>
                <p className="text-xs mb-6" style={{ color: 'var(--muted)' }}>OtBee siap menemanimu dari sekarang sampai diterima. 💛🐝</p>
                <button onClick={() => router.push('/dashboard')} className="btn btn-primary w-full py-4 text-base" style={{ fontWeight: 700, boxShadow: '0 8px 24px rgba(255,212,0,0.4)' }}>
                  Mulai Persiapan Sekarang!
                </button>
              </div>
            )}

          </motion.div>
        </AnimatePresence>

        {/* Footer CTA */}
        {showFooterCta && (
          <div className="mt-5">
            <button onClick={goNext} disabled={!canNext} className="btn btn-primary w-full py-4 text-base disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ fontWeight: 700, boxShadow: canNext ? '0 8px 24px rgba(255,212,0,0.4)' : 'none' }}>
              {step === 16 ? 'Ini rencanaku' : step === 18 ? 'Lanjut ke Janji' : 'Lanjut'}
            </button>
            {step === 7 && <p className="text-center text-[11px] mt-2" style={{ color: 'var(--muted)' }}><Lock size={10} className="inline mr-1" />Bisa diganti kapan aja nanti</p>}
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
