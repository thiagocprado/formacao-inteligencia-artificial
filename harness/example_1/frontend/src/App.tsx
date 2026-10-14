import { FormEvent, useState } from 'react'
import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, LoaderCircle, MapPin, Search, Sun, Wind, Droplets, Thermometer } from 'lucide-react'

type WeatherData = {
  location: { name: string; region?: string; country?: string }
  current: Record<string, number | string>
  currentUnits: Record<string, string>
  daily: Record<string, Array<number | string>>
}

function weatherDescription(code: number) {
  if (code === 0) return 'Céu limpo'
  if ([1, 2].includes(code)) return 'Poucas nuvens'
  if (code === 3) return 'Nublado'
  if ([45, 48].includes(code)) return 'Neblina'
  if ([51, 53, 55, 56, 57].includes(code)) return 'Chuvisco'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Chuva'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Neve'
  if ([95, 96, 99].includes(code)) return 'Trovoadas'
  return 'Condição variável'
}

function WeatherIcon({ code, className }: { code: number; className?: string }) {
  if (code === 0) return <Sun className={className} />
  if ([45, 48].includes(code)) return <CloudFog className={className} />
  if ([51, 53, 55, 56, 57].includes(code)) return <CloudDrizzle className={className} />
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return <CloudRain className={className} />
  if ([71, 73, 75, 77, 85, 86].includes(code)) return <CloudSnow className={className} />
  if ([95, 96, 99].includes(code)) return <CloudLightning className={className} />
  if ([1, 2, 3].includes(code)) return <Cloud className={className} />
  return <Sun className={className} />
}

function App() {
  const [city, setCity] = useState('')
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function searchWeather(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = city.trim()
    if (!query) return
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`http://localhost:3000/api/weather?city=${encodeURIComponent(query)}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Não foi possível buscar o clima.')
      setWeather(data as WeatherData)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível conectar ao servidor.')
      setWeather(null)
    } finally {
      setLoading(false)
    }
  }

  const current = weather?.current
  const code = Number(current?.weather_code ?? 0)

  return (
    <main className="weather-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <section className="weather-shell">
        <header className="topbar">
          <a className="brand" href="#inicio" aria-label="Clima de hoje, início">
            <span className="brand-mark"><Sun size={19} /></span>
            <span>tempo<span className="brand-light">.</span></span>
          </a>
          <span className="topbar-note">SEU TEMPO, AGORA</span>
        </header>

        <div className="intro" id="inicio">
          <p className="eyebrow">PREVISÃO LOCAL</p>
          <h1>O céu da sua cidade.</h1>
          <p className="intro-copy">Descubra como está o tempo onde você está — ou em qualquer lugar do mundo.</p>
        </div>

        <form className="search-form" onSubmit={searchWeather}>
          <MapPin className="search-pin" size={19} />
          <input aria-label="Nome da cidade" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Digite uma cidade..." />
          <button type="submit" disabled={loading || !city.trim()} aria-label="Buscar clima">
            {loading ? <LoaderCircle className="spin" size={19} /> : <Search size={19} />}
            <span>{loading ? 'Buscando' : 'Buscar'}</span>
          </button>
        </form>

        {error && <div className="error-message" role="alert">{error}</div>}

        {weather && current ? (
          <section className="weather-card" aria-live="polite">
            <div className="weather-card-top">
              <div>
                <p className="card-label">AGORA EM</p>
                <h2>{weather.location.name}</h2>
                <p className="location-line">{[weather.location.region, weather.location.country].filter(Boolean).join(', ')}</p>
              </div>
              <div className="current-icon"><WeatherIcon code={code} /></div>
            </div>
            <div className="temperature-row">
              <span className="temperature">{Math.round(Number(current.temperature_2m))}<sup>°</sup></span>
              <div className="condition-copy">
                <span>{weatherDescription(code)}</span>
                <small>Sensação de {Math.round(Number(current.apparent_temperature))}°</small>
              </div>
            </div>
            <div className="weather-divider" />
            <div className="details-grid">
              <div className="detail-item"><span className="detail-icon"><Droplets size={17} /></span><div><small>Umidade</small><strong>{current.relative_humidity_2m}{weather.currentUnits.relative_humidity_2m}</strong></div></div>
              <div className="detail-item"><span className="detail-icon"><Wind size={17} /></span><div><small>Vento</small><strong>{current.wind_speed_10m} {weather.currentUnits.wind_speed_10m}</strong></div></div>
              <div className="detail-item"><span className="detail-icon"><Thermometer size={17} /></span><div><small>Máxima</small><strong>{weather.daily.temperature_2m_max?.[0]}°</strong></div></div>
              <div className="detail-item"><span className="detail-icon"><Cloud size={17} /></span><div><small>Mínima</small><strong>{weather.daily.temperature_2m_min?.[0]}°</strong></div></div>
            </div>
          </section>
        ) : !loading && !error ? (
          <div className="empty-state">
            <div className="empty-icon"><Cloud size={29} /></div>
            <p>Um lugar, um olhar para o céu.</p>
            <span>Busque uma cidade para ver as condições atuais.</span>
          </div>
        ) : null}

        <footer className="page-footer"><span>Dados meteorológicos por Open-Meteo</span><span className="footer-dot" /> <span>Feito para você respirar fundo.</span></footer>
      </section>
    </main>
  )
}

export default App
