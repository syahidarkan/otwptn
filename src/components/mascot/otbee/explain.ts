/**
 * What Otbee says about whatever the user is pointing at / lingering on.
 * Rule based (no network): a small knowledge base of otwptn features + PTN jargon, plus generic
 * descriptions built from the element itself (button label + where a link goes, heading + the line below it ...).
 */
import { IGNORE_SELECTOR } from './world'

export interface Explanation { text: string; kind: 'control' | 'heading' | 'text' | 'media' | 'field' }

const KB: { re: RegExp; text: string }[] = [
  { re: /essay.*(review|ai)|review essay|koreksi essay/i, text: 'Essay AI Review: unggah draf essay-mu, AI kasih skor dan catatan revisi per kalimat, kayak dikoreksi di Google Docs ✍️' },
  { re: /kalkulator|peluang/i, text: 'Kalkulator Peluang: isi rapor, peringkat sekolah & sertifikat, lalu keluar estimasi peluang lolos jalur non-tes 📈' },
  { re: /mentor/i, text: 'Mentor Alumni: kakak-kakak alumni UI/ITB/UGM yang bimbing essay & strategimu lewat sesi grup dengan sharescreen 🎓' },
  { re: /komunitas/i, text: 'Komunitas: forum real-time buat tanya jawab dan saling semangatin sesama pejuang PTN 💬' },
  { re: /tracking|lacak jalur/i, text: 'Tracking Jalur: pantau status tiap pendaftaran (draf, submit, hasil) biar nggak ada yang kelewat 🗺️' },
  { re: /modul|video|e-?course/i, text: 'Modul & Video: materi per jalur (strategi essay, portofolio, wawancara) dalam video singkat yang gampang dicerna 🎬' },
  { re: /otbee tv|video call|cari teman|teman belajar/i, text: 'Otbee TV: video call acak sama sesama pejuang PTN buat belajar bareng dan saling nyemangatin 📺' },
  { re: /dokumen/i, text: 'Penyimpanan Dokumen: rapor, sertifikat, dan essay versi terbaru disimpan rapi di satu tempat 📁' },
  { re: /otbee ai|asisten/i, text: 'Otbee AI: konsultan 24 jam yang dilatih dari data kelulusan jalur non-tes tahun-tahun sebelumnya 🐝' },
  { re: /royal jelly/i, text: 'Royal Jelly: paket paling lengkap, cek tabel harga buat bandingin semua fiturnya 👑' },
  { re: /honeycomb/i, text: 'Honeycomb: paket menengah dengan bimbingan lebih intens, bandingin fiturnya di tabel harga ya 🍯' },
  { re: /nectar/i, text: 'Nectar: paket awal buat mulai bimbingan dengan harga paling ramah 🌼' },
  { re: /harga|paket|premium|akun gratis|circle|squad/i, text: 'Harga & paket: ada akun gratis dan premium (Individu atau Circle/Squad 3 orang), bayarnya sekali aja 💳' },
  { re: /snbp/i, text: 'SNBP = Seleksi Nasional Berdasarkan Prestasi: jalur masuk PTN tanpa tes, dinilai dari rapor dan prestasi 🏅' },
  { re: /ppkb|pbub|smup|sjp|golden ticket|smitb|jalur mandiri/i, text: 'Ini jalur mandiri non-tes tiap kampus: seleksinya pakai portofolio, essay, dan prestasi, bukan ujian tulis 📝' },
  { re: /rasionalisasi/i, text: 'Rasionalisasi nilai rapor = menilai kewajaran tren nilaimu dibanding nilai lain di sekolah yang sama ⚖️' },
  { re: /faq|pertanyaan umum/i, text: 'FAQ: jawaban untuk pertanyaan yang paling sering ditanyain pejuang PTN ❓' },
  { re: /testimoni|cerita alumni/i, text: 'Testimoni: cerita pejuang PTN yang sudah lolos lewat otwptn 🌟' },
  { re: /artikel|panduan/i, text: 'Artikel & panduan: tips strategi lolos PTN jalur non-tes, ditulis langsung sama mentor 📚' },
  { re: /leaderboard|peringkat/i, text: 'Leaderboard: lihat posisimu dibanding pejuang lain, XP naik tiap kamu belajar 🏆' },
  { re: /streak|xp|quest/i, text: 'XP & streak: makin rajin belajar tiap hari, makin tinggi XP dan streak-mu 🔥' },
  { re: /ambassador/i, text: 'Ambassador: ajak teman pakai kode referralmu dan dapat komisi 💰' },
]

const DEST: [RegExp, string][] = [
  [/^\/login/, 'masuk ke akunmu'],
  [/^\/(register|daftar)/, 'bikin akun baru, gratis'],
  [/^\/dashboard\/essay/, 'buka Essay AI Review'],
  [/^\/dashboard\/kalkulator/, 'hitung peluangmu'],
  [/^\/dashboard\/otbee/, 'ngobrol sama Otbee AI'],
  [/^\/dashboard\/mentor/, 'ke halaman Mentor'],
  [/^\/dashboard\/komunitas/, 'ke Komunitas'],
  [/^\/dashboard\/ecourse/, 'buka Modul & Video'],
  [/^\/dashboard/, 'ke dashboard belajarmu'],
  [/^\/artikel/, 'baca artikel & panduan'],
  [/^\/jalur/, 'lihat info jalur masuk PTN'],
  [/^\/(upgrade|checkout|paket)/, 'lihat / beli paket premium'],
  [/^\/panduan/, 'baca panduan pemakaian'],
  [/^\/tentang/, 'kenalan sama otwptn'],
  [/^#/, 'loncat ke bagian itu di halaman ini'],
  [/^mailto:/, 'kirim email'],
  [/^https?:\/\//, 'buka link di luar otwptn'],
  [/^\/$/, 'balik ke beranda'],
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
    const what = known ?? (dest ? `Klik ini buat ${dest} 👉` : isSubmit ? 'Klik ini buat kirim isian formulirnya 👉' : 'Klik ini buat lanjut 👉')
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
