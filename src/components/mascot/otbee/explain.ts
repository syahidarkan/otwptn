/**
 * What Otbee says about whatever the user is pointing at / lingering on.
 * Rule based (no network): a small knowledge base of otwptn features + PTN jargon, plus generic
 * descriptions built from the element itself (button label + where a link goes, heading + the line below it ...).
 */
import { IGNORE_SELECTOR } from './world'

export interface Explanation { text: string; kind: 'control' | 'heading' | 'text' | 'media' | 'field' }

const KB: { re: RegExp; text: string }[] = [
  { re: /essay.*(review|ai)|review essay|koreksi essay/i, text: 'Essay AI Review: unggah draf essay-mu, AI kurator kasih skor 4 dimensi, deteksi kalimat klise, dan catatan revisi per kalimat sesuai standar PPKB UI & PTN unggulan ✍️' },
  { re: /kalkulator|peluang/i, text: 'Kalkulator Peluang: rasionalisasi nilai rapor semester 1-5, kuota akreditasi sekolah, mapel pendukung SNPMB & kurasi sertifikat Puspresnas 📈' },
  { re: /atur strategi|strategi prodi/i, text: 'Atur Strategi: susun piramida prodi pilihan 1 & 2 serta portofolio sertifikat taktis agar tidak saling kanibalisme dengan teman sekolah 🎯' },
  { re: /mentor/i, text: 'Mentor Alumni: kakak-kakak lulusan jalur non-tes UI/ITB/UGM yang bimbing essay & strategimu lewat sesi Zoom 1-on-1 dan grup WhatsApp 🎓' },
  { re: /komunitas/i, text: 'Komunitas: forum real-time buat tanya jawab, diskusi jurusan, dan saling semangatin sesama pejuang PTN se-Indonesia 💬' },
  { re: /tracking|lacak jalur/i, text: 'Tracking Jalur: pantau timeline dan checklist syarat berkas pendaftaran kampus biar nggak ada deadline yang kelewat 🗺️' },
  { re: /modul|video|e-?course/i, text: 'Modul & Video E-Course: video pembelajaran taktis bedah strategi essay, portofolio, dan tips wawancara langsung dari mentor 🎬' },
  { re: /otbee tv|video call|cari teman|teman belajar/i, text: 'Cari Teman Belajar Virtual: ruang belajar virtual buat diskusi dan peer-review bareng pejuang PTN se-Indonesia 📺' },
  { re: /dokumen/i, text: 'Penyimpanan Dokumen: rapor, sertifikat prestasi, dan draf essay tersimpan rapi dan aman di cloud OtwPTN 📁' },
  { re: /otbee ai|asisten/i, text: 'Otbee AI: konsultan cerdas 24 jam yang siap bantu rekomendasi prodi, hitung peluang, dan tips seleksi PTN non-tes 🐝' },
  { re: /royal jelly/i, text: 'Paket Royal Jelly VIP: bimbingan 1-on-1 unlimited sampai hari H, dokumen analisis mentor, prioritas 24/7, plus tiket trip tour ke UI 👑' },
  { re: /honeycomb/i, text: 'Paket Honeycomb (Terpopuler): Akun Premium + 5x putaran revisi berkas + 2x Zoom 1-on-1 + grup WhatsApp 3 pihak bareng mentor 🍯' },
  { re: /nectar/i, text: 'Paket Nectar: Akun Premium + 2x putaran revisi dokumen & esai via chat WhatsApp bersama mentor alumni PTN 🌼' },
  { re: /harga|paket|premium|akun gratis|circle|squad/i, text: 'Harga & Paket: pilih Akun Premium mandiri atau paket bimbingan mentor (Nectar, Honeycomb, Royal Jelly) dengan garansi bimbingan maksimal 💳' },
  { re: /snbp/i, text: 'SNBP = Seleksi Nasional Berdasarkan Prestasi: jalur masuk PTN tanpa tes ujian, dinilai dari rapor semester 1-5 dan prestasi siswa eligible 🏅' },
  { re: /ppkb|pbub|smup|sjp|golden ticket|smitb|jalur mandiri/i, text: 'Jalur Mandiri Non-Tes: seleksi rapor & portofolio kampus (PPKB UI, PBUB UGM, SJP IPB, Golden Ticket UNAIR, SMUP Unpad) tanpa tes tertulis 📝' },
  { re: /rasionalisasi/i, text: 'Rasionalisasi nilai rapor = menilai kewajaran tren nilai, linearitas mapel pendukung, dan rekam jejak sekolah di kampus tujuan ⚖️' },
  { re: /faq|pertanyaan umum/i, text: 'FAQ: rangkuman jawaban untuk pertanyaan yang paling sering diajukan pejuang PTN dan orang tua ❓' },
  { re: /testimoni|cerita alumni/i, text: 'Testimoni: cerita nyata pejuang PTN yang berhasil lolos ke UI, ITB, UGM, IPB lewat bimbingan OtwPTN 🌟' },
  { re: /artikel|panduan/i, text: 'Panduan & Artikel: tips strategi seleksi non-tes, regulasi SNPMB terbaru, dan bedah jurusan langsung dari mentor 📚' },
  { re: /leaderboard|peringkat/i, text: 'Leaderboard: lihat peringkat keaktifan belajarmu dibanding pejuang PTN lain se-Indonesia 🏆' },
  { re: /streak|xp|quest/i, text: 'XP & Streak: jaga konsistensi belajar harianmu, selesaikan quest, dan kumpulkan poin XP 🔥' },
  { re: /ambassador|referral/i, text: 'Student Ambassador: ajak teman daftar pakai kode referralmu dan dapatkan komisi tunai 15% 💰' },
  { re: /creator|content creator/i, text: 'Content Creator OtwPTN: daftar dan submit konten edukasi untuk dapat kompensasi menarik 📹' },
]

const DEST: [RegExp, string][] = [
  [/^\/login/, 'masuk ke akun OtwPTN kamu 🔑'],
  [/^\/(register|daftar)/, 'daftar akun OtwPTN gratis dan mulai uji coba 🚀'],
  [/^\/dashboard\/essay/, 'buka lembar kerja Essay AI Review untuk bedah esaimu ✍️'],
  [/^\/dashboard\/kalkulator/, 'buka Kalkulator Peluang Rapor untuk rasionalisasi nilai SNBP 📈'],
  [/^\/dashboard\/otbee/, 'konsultasi langsung sama Otbee AI seputar strategi jurusan 🐝'],
  [/^\/dashboard\/mentor/, 'jadwalkan mentoring & bedah berkas bareng mentor alumni PTN 🎓'],
  [/^\/dashboard\/komunitas/, 'buka forum komunitas pejuang PTN se-Indonesia 💬'],
  [/^\/dashboard\/ecourse/, 'buka video & modul strategi lolos seleksi PTN 🎬'],
  [/^\/dashboard\/teman/, 'masuk ke ruang Cari Teman Belajar Virtual 👥'],
  [/^\/dashboard\/tracking-jalur/, 'cek status dan timeline pendaftaran jalur masuk PTN 🗺️'],
  [/^\/dashboard\/ambassador/, 'buka dashboard Student Ambassador & referral komisi 💰'],
  [/^\/dashboard\/creator/, 'buka dashboard Content Creator resmi OtwPTN 📹'],
  [/^\/career\/content-creator/, 'daftar jadi Content Creator resmi OtwPTN 🎬'],
  [/^\/dashboard/, 'ke dashboard utama belajarmu 🏠'],
  [/^\/upgrade/, 'buka halaman pilihan paket & upgrade akun premium 💳'],
  [/^\/paket\/nectar/, 'lihat rincian Paket Nectar (Akun Premium + 2x revisi dokumen) 🌼'],
  [/^\/paket\/honeycomb/, 'lihat rincian Paket Honeycomb (Akun Premium + 5x revisi + 2x Zoom 1-on-1) 🍯'],
  [/^\/paket\/royal-jelly/, 'lihat rincian Paket Royal Jelly VIP (Bimbingan unlimited + trip tour UI) 👑'],
  [/^\/paket/, 'lihat detail paket bimbingan belajar OtwPTN 📦'],
  [/^\/syarat-paket/, 'baca syarat dan ketentuan resmi paket bimbingan OtwPTN 📜'],
  [/^\/kebijakan-privasi/, 'baca kebijakan privasi perlindungan data pengguna OtwPTN 🔒'],
  [/^\/panduan/, 'baca panduan langkah demi langkah penggunaan platform OtwPTN 📖'],
  [/^\/profil/, 'atur informasi akun, target prodi, dan data profilmu 👤'],
  [/^\/artikel/, 'baca artikel tips & panduan lolos seleksi PTN 📚'],
  [/^\/jalur/, 'eksplorasi info lengkap jalur masuk PTN non-tes se-Indonesia 🎯'],
  [/^\/tentang/, 'baca profil resmi OtwPTN & PT. Lembaga Sains Nasional 🏢'],
  [/^#fitur/, 'lihat seluruh fitur cerdas OtwPTN (kalkulator, esai, mentor, modul) ⚡'],
  [/^#harga|^#paket/, 'lihat perbandingan harga paket bimbingan OtwPTN 🏷️'],
  [/^#mentor/, 'kenalan dengan kakak-kakak mentor alumni UI, ITB, dan UGM 🎓'],
  [/^#testimoni/, 'baca kisah sukses pejuang PTN yang lolos lewat OtwPTN 🌟'],
  [/^#faq/, 'baca jawaban atas pertanyaan yang paling sering ditanyakan ❓'],
  [/^#/, 'loncat ke bagian tersebut di halaman ini 📌'],
  [/^mailto:otwptn\.com@gmail\.com|^mailto:/, 'kirim email resmi ke tim OtwPTN di otwptn.com@gmail.com ✉️'],
  [/instagram\.com\/otwptn/, 'buka akun Instagram resmi @otwptn untuk info & tips harian 📸'],
  [/tiktok\.com\/@otwptn/, 'tonton video tips singkat & bedah prodi di TikTok resmi @otwptn 🎵'],
  [/wa\.me|whatsapp\.com/, 'chat Customer Service resmi OtwPTN via WhatsApp 💬'],
  [/^https?:\/\//, 'buka tautan resmi terkait OtwPTN 🔗'],
  [/^\/$/, 'kembali ke halaman beranda OtwPTN 🏠'],
]

const FIELD_HINT: Record<string, string> = {
  password: 'buat kata sandi, rahasiain ya 🔒',
  email: 'isi emailmu yang aktif',
  tel: 'isi nomor HP / WhatsApp aktif',
  search: 'ketik kata kunci yang dicari',
  number: 'isi angka di sini',
  file: 'pilih file dari perangkatmu',
}

const clean = (s: string) => s.replace(/\s+/g, ' ').trim()
const trunc = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s)
const firstSentence = (s: string, n: number) => {
  const m = s.match(/^.{20,}?[.!?](\s|$)/)
  return trunc((m ? m[0] : s).trim(), n)
}
function kb(text: string): string | null {
  for (const k of KB) if (k.re.test(text)) return k.text
  return null
}
function hasOwnText(el: Element, min = 3): boolean {
  for (const n of el.childNodes) if (n.nodeType === 3 && (n.nodeValue ?? '').trim().length >= min) return true
  return false
}

/** the thing under the pointer that is worth talking about (null = just empty space / decoration) */
export function meaningfulTarget(el: Element | null): Element | null {
  if (!el || el.closest(IGNORE_SELECTOR)) return null
  const inter = el.closest('a,button,[role=button],summary,select,input,textarea,label')
  if (inter) return inter
  let cur: Element | null = el
  let fallback: Element | null = null
  for (let i = 0; cur && cur !== document.body && i < 7; i++, cur = cur.parentElement) {
    const tag = cur.tagName
    if (/^H[1-6]$/.test(tag) || ['P', 'LI', 'FIGCAPTION', 'BLOCKQUOTE', 'TD', 'TH', 'DT', 'DD', 'IMG', 'VIDEO'].includes(tag)) return cur
    if (!fallback && hasOwnText(cur)) fallback = cur
  }
  return fallback
}

export function explain(el: Element): Explanation | null {
  const tag = el.tagName
  const text = clean(el.textContent ?? '')
  // ---- form fields
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
    const inp = el as HTMLInputElement
    const lab = inp.id ? document.querySelector(`label[for="${CSS.escape(inp.id)}"]`) : null
    const name = clean(lab?.textContent ?? inp.getAttribute('aria-label') ?? inp.placeholder ?? '') || 'ini'
    if (inp.type === 'submit' || inp.type === 'button') return { kind: 'control', text: `Klik aja kalau "${trunc(inp.value || name, 34)}" udah siap lanjut 👉` }
    const hint = FIELD_HINT[inp.type] ?? (tag === 'TEXTAREA' ? 'tulis panjang-panjang boleh, santai aja ✍️' : 'isi di sini ya')
    return { kind: 'field', text: `Isi ${trunc(name, 34)} ya, ${hint}` }
  }
  if (tag === 'LABEL') return text ? { kind: 'field', text: `Isi kolom "${trunc(text, 40)}" di sebelahnya ya ✍️` } : null
  // ---- buttons / links
  if (tag === 'A' || tag === 'BUTTON' || el.getAttribute('role') === 'button' || tag === 'SUMMARY') {
    const label = text || clean(el.getAttribute('aria-label') ?? el.getAttribute('title') ?? '')
    if (!label) return null
    const href = tag === 'A' ? (el.getAttribute('href') ?? '') : ''
    const known = kb(label)
    let dest = ''
    if (href) for (const [re, d] of DEST) if (re.test(href)) { dest = d; break }
    const isSubmit = (el as HTMLButtonElement).type === 'submit'
    const what = dest
      ? (dest.startsWith('buka') || dest.startsWith('lihat') || dest.startsWith('daftar') || dest.startsWith('masuk') || dest.startsWith('tonton') || dest.startsWith('chat') || dest.startsWith('kirim') ? `${dest} 👉` : `Klik ini buat ${dest} 👉`)
      : (known ?? (isSubmit ? 'Klik ini buat kirim isian formulirnya dengan aman 👉' : `Tombol "${trunc(label, 30)}": klik untuk lanjut 👉`))
    return { kind: 'control', text: what }
  }
  // ---- images
  if (tag === 'IMG') {
    const alt = clean((el as HTMLImageElement).alt)
    return alt ? { kind: 'media', text: trunc(alt, 110) } : null
  }
  if (tag === 'VIDEO') return { kind: 'media', text: 'Ini video, klik play buat nonton ▶️' }
  // ---- headings
  if (/^H[1-6]$/.test(tag)) {
    if (text.length < 3) return null
    const known = kb(text)
    if (known) return { kind: 'heading', text: known }
    let sub = ''
    let sib: Element | null = el.nextElementSibling
    for (let i = 0; sib && i < 3 && !sub; i++, sib = sib.nextElementSibling) {
      const t = clean(sib.textContent ?? '')
      if (t.length > 25) sub = t
    }
    if (!sub) { const p = el.parentElement?.querySelector('p'); sub = clean(p?.textContent ?? '') }
    return { kind: 'heading', text: sub ? firstSentence(sub, 150) : `Terusin scroll buat lihat isi "${trunc(text, 44)}" ya 👀` }
  }
  // ---- plain text
  if (text.length < 8) return null
  const known = text.length < 60 ? kb(text) : null
  if (known) return { kind: 'text', text: known }
  if (text.length > 90) return { kind: 'text', text: firstSentence(text, 150) }
  return null
}

/** sometimes address the user by name, as a friend would */
export function withName(text: string, name: string | null | undefined): string {
  if (!name || Math.random() > 0.4) return text
  const opener = ['Eh', 'Nih', 'Hai', 'Btw'][Math.floor(Math.random() * 4)]
  return `${opener} ${name}, ${text.charAt(0).toLowerCase()}${text.slice(1)}`
}
