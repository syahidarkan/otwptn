/**
 * Context Awareness for Otbee Mascot:
 * 1. Form Input Reading (detects name, grades, achievements, PTN target, major, etc. while typing/blurring)
 * 2. Battery Monitoring (low battery alerts, charging reactions)
 * 3. Local Time / Clock (late-night sleep advice, early-morning cheer, lunch reminder)
 * 4. Location & Weather (city and weather-based conversational lines)
 */

export interface ContextAwarenessCallbacks {
  say: (text: string, ms?: number) => void
  act: (clip: any, opts?: { text?: string; force?: boolean; ms?: number }) => void
  setName: (name: string) => void
  getName: () => string | null
}

interface ContextInfo {
  city: string | null
  region: string | null
  temp: number | null
  weather: string | null
  isDay: boolean
}

let contextCache: ContextInfo | null = null

export async function fetchContextInfo(): Promise<ContextInfo | null> {
  if (contextCache) return contextCache
  try {
    const res = await fetch('/api/context-info')
    if (res.ok) {
      contextCache = await res.json()
      return contextCache
    }
  } catch {}
  return null
}

export function getTimeContext(): { hour: number; timeStr: string; quote: string | null } {
  const now = new Date()
  const hour = now.getHours()
  const minutes = now.getMinutes()
  const timeStr = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

  let quote: string | null = null
  if (hour >= 23 || hour < 5) {
    quote = `Udah jam ${timeStr} malam nih! Belajarnya lanjut besok ajaa biar sehat & fresh, istirahat itu penting! 🌙😴`
  } else if (hour >= 5 && hour < 8) {
    quote = `Selamat pagi! Jam ${timeStr} udah aktif belajar, keren banget! Otak lagi fresh-freshnya nih! 🌅🧠`
  } else if (hour >= 12 && hour <= 13) {
    quote = `Udah jam ${timeStr} siang nih, jangan lupa makan siang & istirahat bentar ya! 🍱😋`
  } else if (hour >= 18 && hour < 19 && minutes <= 30) {
    quote = `Udah masuk jam ${timeStr} petang nih, rehat bentar yuk sebelum sesi belajar malam! 🌇✨`
  }

  return { hour, timeStr, quote }
}

export function getWeatherContextQuote(info: ContextInfo | null): string | null {
  if (!info || !info.city) return null
  const city = info.city
  const temp = info.temp
  const weather = info.weather?.toLowerCase() || ''

  if (weather.includes('hujan') || weather.includes('gerimis') || weather.includes('petir')) {
    return `Di ${city} lagi ${info.weather?.toLowerCase()} nih 🌧️ Suasananya syahdu banget buat belajar materi PTN sambil ngeteh! ☕`
  }
  if (temp && temp >= 32) {
    return `Wah di ${city} lagi panas ${temp}°C ya? Jangan lupa minum air putih biar belajarnya tetap fokus! ☀️🥤`
  }
  if (temp && temp <= 25) {
    return `Udaranya lagi sejuk nih di ${city} (${temp}°C), pas banget buat ngerjain latihan soal! ⛅📖`
  }
  return `Halo pejuang PTN di ${city}! Otbee nemenin kamu dari mana aja lho! 🐝🇮🇩`
}

export class ContextAwareness {
  private batteryManager: any = null
  private batteryWarned = false
  private batteryFullWarned = false
  private lastInputSeen = new WeakMap<Element, string>()
  private inputDebounceTimer: ReturnType<typeof setTimeout> | null = null
  private lastEnvQuoteTime = 0
  private disposed = false

  constructor(private callbacks: ContextAwarenessCallbacks) {
    this.initBattery()
    fetchContextInfo().catch(() => {})
  }

  private async initBattery() {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return
    try {
      const nav = navigator as any
      if (typeof nav.getBattery === 'function') {
        const b = await nav.getBattery()
        if (this.disposed) return
        this.batteryManager = b
        this.checkBattery(b)

        b.addEventListener('levelchange', () => this.checkBattery(b))
        b.addEventListener('chargingchange', () => this.onChargingChange(b))
      }
    } catch {}
  }

  private checkBattery(b: any) {
    if (this.disposed) return
    const level = b.level ?? 1
    const charging = b.charging ?? false
    const pct = Math.round(level * 100)

    if (pct <= 20 && !charging && !this.batteryWarned) {
      this.batteryWarned = true
      this.callbacks.act('surprised', {
        text: `Eh batre laptop/HP kamu tinggal ${pct}% nih! Cas dulu sana biar gak tiba-tiba mati pas belajar! 🔋⚡`,
        force: true,
        ms: 5500,
      })
    } else if (pct > 25) {
      this.batteryWarned = false
    }

    if (pct === 100 && charging && !this.batteryFullWarned) {
      this.batteryFullWarned = true
      this.callbacks.act('cheer', {
        text: 'Batre udah full 100%! Baterai siap, energi siap, gaspol kejar PTN impian! 🚀🔋',
        force: true,
        ms: 5000,
      })
    }
  }

  private onChargingChange(b: any) {
    if (this.disposed) return
    const charging = b.charging ?? false
    const pct = Math.round((b.level ?? 1) * 100)
    if (charging && pct <= 35) {
      this.callbacks.act('nod', {
        text: 'Nah gitu, udah dicas! Jadi tenang belajarnya tanpa takut lowbat! ⚡✨',
        force: true,
        ms: 4500,
      })
    }
  }

  /**
   * Called during idle ladder checks to occasionally surface real-world insights (weather/battery/time)
   */
  public getIdleEnvironmentalQuote(): string | null {
    const now = performance.now()
    if (now - this.lastEnvQuoteTime < 90000) return null // at most once every 1.5 minutes

    // 1. Time advice (night, morning, lunch)
    const time = getTimeContext()
    if (time.quote) {
      this.lastEnvQuoteTime = now
      return time.quote
    }

    // 2. Weather & Location
    if (contextCache && Math.random() < 0.6) {
      const wQuote = getWeatherContextQuote(contextCache)
      if (wQuote) {
        this.lastEnvQuoteTime = now
        return wQuote
      }
    }

    return null
  }

  /**
   * Analyzes an input element and value to trigger intelligent, contextual mascot responses.
   */
  public handleFormInput(el: HTMLElement, eventType: 'input' | 'blur' | 'change') {
    if (this.disposed) return
    if (!(el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el.isContentEditable)) return

    const val = (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement ? el.value : el.textContent || '').trim()
    if (!val) return

    // Never inspect or speak private password/PIN fields
    const type = el.getAttribute('type') || ''
    if (type === 'password' || el.dataset.sensitive === 'true') return

    const lastVal = this.lastInputSeen.get(el)
    if (lastVal === val && eventType !== 'blur') return

    if (this.inputDebounceTimer) clearTimeout(this.inputDebounceTimer)

    const delay = eventType === 'blur' ? 100 : 1200
    this.inputDebounceTimer = setTimeout(() => {
      if (this.disposed) return
      this.processFieldReaction(el, val)
    }, delay)
  }

  private processFieldReaction(el: HTMLElement, val: string) {
    const lastVal = this.lastInputSeen.get(el)
    if (lastVal === val) return
    this.lastInputSeen.set(el, val)

    const nameAttr = (el.getAttribute('name') || '').toLowerCase()
    const idAttr = (el.getAttribute('id') || '').toLowerCase()
    const placeholder = (el.getAttribute('placeholder') || '').toLowerCase()
    const ariaLabel = (el.getAttribute('aria-label') || '').toLowerCase()
    const labelText = (el.closest('label')?.textContent || '').toLowerCase()
    const fieldMeta = `${nameAttr} ${idAttr} ${placeholder} ${ariaLabel} ${labelText}`

    // 0. Explicit exclusion for non-person entities (mapel, sekolah, kampus, prodi, etc.)
    const isNonPersonEntity = /(mapel|mata_pelajaran|pelajaran|subject|sekolah|school|kampus|ptn|univ|universitas|jurusan|prodi|program_studi|prestasi|sertifikat|lomba|kejuaraan|organisasi|kegiatan|proyek|project|bank|instansi|perusahaan|judul|title)/i.test(fieldMeta)

    // Mapel (Mata Pelajaran) -> strictly ignore so Otbee doesn't greet subjects as people!
    if (/(mapel|mata_pelajaran|pelajaran|subject)/i.test(fieldMeta)) {
      return
    }

    // 1. Student Personal Name Field (strictly requires personal name identifiers and excludes non-person entities)
    if (!isNonPersonEntity && /(nama_lengkap|nama_siswa|full_name|fullname|student_name|user_name|username|^name$|^nama$|nama_kamu|nama_anda)/i.test(fieldMeta)) {
      if (val.length >= 2 && !val.includes('@') && !/^\d+$/.test(val)) {
        const cleanName = val.split(/\s+/)[0] // First name
        const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1).toLowerCase()
        this.callbacks.setName(capitalized)
        this.callbacks.act('wave', {
          text: `Haii ${capitalized}! Salam kenal ya! Senang ketemu kamu 👋🐝`,
          force: true,
          ms: 5000,
        })
        return
      }
    }

    // 2. Rapor / Nilai
    if (/(rapor|nilai|score|skor|matematika|mtk|fisika|kimia|biologi|bahasa|semester)/i.test(fieldMeta)) {
      const num = parseFloat(val.replace(',', '.'))
      if (!isNaN(num) && num > 0 && num <= 100) {
        if (num >= 88) {
          this.callbacks.act('cheer', {
            text: `Wih nilai rapornya ${num}! Keren banget, peluang lolos SNBP makin terbuka lebar! 📈🔥`,
            force: true,
            ms: 5200,
          })
        } else if (num >= 78) {
          this.callbacks.act('nod', {
            text: `Nilai ${num} udah bagus! Nanti kita kombinasikan dengan sertifikat & strategi prodi yang tepat ya! 🎯`,
            force: true,
            ms: 5200,
          })
        } else {
          this.callbacks.act('nod', {
            text: `Nilai ${num} tercatat! Tenang, masih banyak strategi buat dongkrak peluang lolos PTN! 💪`,
            force: true,
            ms: 5200,
          })
        }
        return
      }
    }

    // 3. Prestasi / Sertifikat
    if (/(prestasi|sertifikat|lomba|kejuaraan|olympiad|juara|award)/i.test(fieldMeta)) {
      if (val.length >= 3) {
        this.callbacks.act('celebrate', {
          text: `Keren banget punya prestasi "${val}"! Di jalur SNBP & Prestasi, ini poinnya berharga banget lho! 🏅✨`,
          force: true,
          ms: 5500,
        })
        return
      }
    }

    // 4. Target PTN / Kampus
    if (/(ptn|kampus|universitas|pilihan_1|pilihan_2|target_univ)/i.test(fieldMeta)) {
      if (val.length >= 2) {
        this.callbacks.act('salto', {
          text: `Wah targetnya ${val}! Pilihan kampus impian banget! Yuk kita persiapkan strateginya bareng-bareng! 🎓🚀`,
          force: true,
          ms: 5500,
        })
        return
      }
    }

    // 5. Jurusan / Prodi
    if (/(jurusan|prodi|program_studi|major)/i.test(fieldMeta)) {
      if (val.length >= 3) {
        this.callbacks.act('cheer', {
          text: `Prodi ${val} prospeknya bagus banget! Otbee doain kamu tembus jadi mahasiswa di sana ya! 🌟`,
          force: true,
          ms: 5200,
        })
        return
      }
    }

    // 6. Asal Sekolah
    if (/(sekolah|school|sma|smk|man|asal_sekolah)/i.test(fieldMeta)) {
      if (val.length >= 3) {
        this.callbacks.act('nod', {
          text: `Wah anak ${val}! Semangat bawa nama baik sekolah tembus ke PTN idaman ya! 🏫🔥`,
          force: true,
          ms: 5000,
        })
        return
      }
    }

    // 7. WhatsApp / Nomor HP
    if (/(wa|whatsapp|phone|telepon|nohp|no_hp)/i.test(fieldMeta)) {
      const cleanDigits = val.replace(/\D/g, '')
      if (cleanDigits.length >= 10 && cleanDigits.length <= 15) {
        this.callbacks.act('nod', {
          text: 'Sip, nomor WhatsApp tersimpan! Siap terima kabar baik kelolosan PTN nanti ya! 📲✨',
          force: true,
          ms: 4800,
        })
        return
      }
    }
  }

  public dispose() {
    this.disposed = true
    if (this.inputDebounceTimer) clearTimeout(this.inputDebounceTimer)
  }
}
