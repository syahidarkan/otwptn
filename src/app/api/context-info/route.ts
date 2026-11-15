import { NextResponse } from 'next/server'

interface ContextInfo {
  city: string | null
  region: string | null
  temp: number | null
  weather: string | null
  isDay: boolean
  cachedAt: number
}

let cachedInfo: ContextInfo | null = null
const CACHE_TTL = 15 * 60 * 1000 // 15 minutes

function mapWeatherCode(code: number): string {
  if (code === 0) return 'Cerah'
  if (code === 1 || code === 2) return 'Cerah Berawan'
  if (code === 3) return 'Berawan'
  if (code === 45 || code === 48) return 'Berkabut'
  if (code >= 51 && code <= 57) return 'Gerimis'
  if (code >= 61 && code <= 67) return 'Hujan'
  if (code >= 71 && code <= 77) return 'Hujan Salju'
  if (code >= 80 && code <= 82) return 'Hujan Lebat'
  if (code >= 95 && code <= 99) return 'Hujan Petir'
  return 'Cerah'
}

export async function GET(req: Request) {
  const now = Date.now()
  if (cachedInfo && now - cachedInfo.cachedAt < CACHE_TTL) {
    return NextResponse.json(cachedInfo)
  }

  try {
    // Cloudflare or edge headers if present
    const cfCity = req.headers.get('cf-ipcity')
    const cfCountry = req.headers.get('cf-ipcountry')

    // Geolocation lookup
    let lat = -6.2
    let lon = 106.81
    let city = cfCity || 'Jakarta'
    let region = 'Indonesia'

    try {
      const geoRes = await fetch('https://get.geojs.io/v1/ip/geo.json', {
        headers: { 'User-Agent': 'OtwPTN-Mascot/1.0' },
        next: { revalidate: 900 },
      })
      if (geoRes.ok) {
        const geoData = await geoRes.json()
        if (geoData.city) city = geoData.city
        if (geoData.region) region = geoData.region
        if (geoData.latitude && geoData.longitude) {
          lat = parseFloat(geoData.latitude)
          lon = parseFloat(geoData.longitude)
        }
      }
    } catch {}

    // Weather lookup from open-meteo
    let temp: number | null = null
    let weather: string | null = null
    let isDay = true

    try {
      const weatherRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}&current=temperature_2m,weather_code,is_day`,
        { next: { revalidate: 900 } }
      )
      if (weatherRes.ok) {
        const wData = await weatherRes.json()
        if (wData.current) {
          temp = Math.round(wData.current.temperature_2m)
          weather = mapWeatherCode(wData.current.weather_code)
          isDay = wData.current.is_day === 1
        }
      }
    } catch {}

    cachedInfo = {
      city,
      region,
      temp,
      weather,
      isDay,
      cachedAt: now,
    }

    return NextResponse.json(cachedInfo)
  } catch {
    return NextResponse.json({
      city: 'Indonesia',
      region: null,
      temp: 28,
      weather: 'Cerah',
      isDay: true,
      cachedAt: now,
    })
  }
}
