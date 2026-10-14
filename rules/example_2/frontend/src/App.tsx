import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, Search, Sun, Wind } from 'lucide-react';
import { useWeather } from './hooks/useWeather';
import type { Weather } from './types/weather';

function getWeatherDescription(code: number): string {
  if (code === 0) return 'Céu limpo';
  if (code <= 3) return 'Parcialmente nublado';
  if (code <= 48) return 'Neblina';
  if (code <= 57) return 'Garoa';
  if (code <= 67 || (code >= 80 && code <= 82)) return 'Chuva';
  if (code <= 77 || (code >= 85 && code <= 86)) return 'Neve';
  if (code <= 99) return 'Tempestade';
  return 'Condição desconhecida';
}

function WeatherIcon({ code }: { code: number }) {
  const iconClass = 'h-20 w-20 text-sky-100';
  if (code === 0) return <Sun aria-hidden="true" className="h-20 w-20 text-amber-300" strokeWidth={1.4} />;
  if (code <= 3) return <Cloud aria-hidden="true" className={iconClass} strokeWidth={1.4} />;
  if (code <= 48) return <CloudFog aria-hidden="true" className={iconClass} strokeWidth={1.4} />;
  if (code <= 57) return <CloudDrizzle aria-hidden="true" className={iconClass} strokeWidth={1.4} />;
  if (code <= 67 || (code >= 80 && code <= 82)) return <CloudRain aria-hidden="true" className={iconClass} strokeWidth={1.4} />;
  if (code <= 77 || (code >= 85 && code <= 86)) return <CloudSnow aria-hidden="true" className={iconClass} strokeWidth={1.4} />;
  return <CloudLightning aria-hidden="true" className="h-20 w-20 text-amber-200" strokeWidth={1.4} />;
}

function WeatherCard({ weather }: { weather: Weather }) {
  const observedAt = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(weather.time));
  return (
    <article aria-label={`Clima atual em ${weather.city}`} className="mx-auto mt-10 max-w-xl rounded-3xl border border-white/10 bg-gradient-to-br from-sky-500/20 to-white/[0.05] p-7 shadow-2xl shadow-black/20 backdrop-blur sm:p-9">
      <div className="flex items-center justify-between gap-4">
        <div><p className="text-sm text-sky-200">Agora em</p><h2 className="mt-1 text-2xl font-semibold">{weather.city}, {weather.country}</h2><p className="mt-2 text-slate-300">{getWeatherDescription(weather.weatherCode)}</p></div>
        <WeatherIcon code={weather.weatherCode} />
      </div>
      <div className="my-8 flex items-start"><p className="text-7xl font-light tracking-tight">{Math.round(weather.temperature)}<span className="align-top text-3xl">°</span></p><p className="ml-4 mt-3 text-sm text-slate-300">Sensação de {Math.round(weather.apparentTemperature)}°C</p></div>
      <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
        <div className="rounded-2xl bg-black/10 p-4"><p className="text-xs text-slate-400">Umidade</p><p className="mt-1 text-lg font-medium">{weather.relativeHumidity}%</p></div>
        <div className="rounded-2xl bg-black/10 p-4"><p className="flex items-center gap-2 text-xs text-slate-400"><Wind aria-hidden="true" className="h-3.5 w-3.5" /> Vento</p><p className="mt-1 text-lg font-medium">{weather.windSpeed} km/h</p></div>
      </div>
      <p className="mt-5 text-right text-xs text-slate-400">Atualizado em {observedAt}</p>
    </article>
  );
}

function App() {
  const { city, setCity, weather, loading, error, searchWeather } = useWeather();
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071b33] px-5 py-12 text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-40 h-[34rem] w-[34rem] rounded-full bg-sky-500/20 blur-3xl" />
      <section className="relative mx-auto max-w-4xl">
        <header className="mb-12 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-sky-300">Previsão em tempo real</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Clima por aí<span className="text-sky-300">.</span></h1>
          <p className="mt-4 text-slate-300">Descubra como está o tempo em qualquer cidade.</p>
        </header>
        <form onSubmit={searchWeather} className="mx-auto flex max-w-xl gap-2 rounded-2xl border border-white/10 bg-white/[0.07] p-2 shadow-2xl shadow-black/20 backdrop-blur">
          <label className="sr-only" htmlFor="city">Nome da cidade</label>
          <input id="city" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Busque uma cidade…" className="min-w-0 flex-1 bg-transparent px-4 text-base outline-none placeholder:text-slate-400" />
          <button type="submit" disabled={loading} className="flex items-center gap-2 rounded-xl bg-sky-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-sky-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-wait disabled:opacity-70">
            <Search aria-hidden="true" className="h-4 w-4" /> <span>{loading ? 'Buscando' : 'Buscar'}</span>
          </button>
        </form>
        {error && <p role="alert" className="mx-auto mt-4 max-w-xl text-center text-sm text-rose-300">{error}</p>}
        {weather ? <WeatherCard weather={weather} /> : <p className="mt-16 text-center text-sm text-slate-400">Digite uma cidade para ver o clima atual.</p>}
      </section>
      <footer className="absolute bottom-6 left-0 right-0 text-center text-xs text-slate-500">Dados meteorológicos por Open-Meteo</footer>
    </main>
  );
}

export default App;
