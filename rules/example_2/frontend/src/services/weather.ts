import type { Weather } from '../types/weather';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function fetchWeather(city: string): Promise<Weather> {
  const response = await fetch(`${API_BASE_URL}/weather?city=${encodeURIComponent(city)}`);
  if (!response.ok) {
    const payload = await response.json() as { error?: string };
    throw new Error(payload.error ?? 'Não foi possível consultar o clima.');
  }
  return response.json() as Promise<Weather>;
}
