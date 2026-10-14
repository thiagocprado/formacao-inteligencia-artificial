import { Weather } from '../types/Weather';

type GeocodingResult = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
};

type GeocodingResponse = { results?: GeocodingResult[] };
type ForecastResponse = {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    time: string;
  };
};

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const CURRENT_FIELDS = 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m';

async function fetchJson<T>(url: URL): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Não foi possível consultar o serviço de clima.');
  return response.json() as Promise<T>;
}

export async function getWeatherForCity(city: string): Promise<Weather | null> {
  const geocodingUrl = new URL(GEOCODING_URL);
  geocodingUrl.search = new URLSearchParams({ name: city, count: '1', language: 'pt', format: 'json' }).toString();
  const location = (await fetchJson<GeocodingResponse>(geocodingUrl)).results?.[0];
  if (!location) return null;
  const forecastUrl = new URL(FORECAST_URL);
  forecastUrl.search = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    current: CURRENT_FIELDS,
    timezone: 'auto',
  }).toString();
  const forecast = await fetchJson<ForecastResponse>(forecastUrl);
  return {
    city: location.name,
    country: location.country,
    temperature: forecast.current.temperature_2m,
    apparentTemperature: forecast.current.apparent_temperature,
    relativeHumidity: forecast.current.relative_humidity_2m,
    weatherCode: forecast.current.weather_code,
    windSpeed: forecast.current.wind_speed_10m,
    time: forecast.current.time,
  };
}
