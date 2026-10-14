import { FormEvent, useState } from 'react';
import { fetchWeather } from '../services/weather';
import type { Weather } from '../types/weather';

export function useWeather() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<Weather | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function searchWeather(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!city.trim()) {
      setError('Digite o nome de uma cidade.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      setWeather(await fetchWeather(city.trim()));
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível consultar o clima.');
    } finally {
      setLoading(false);
    }
  }
  return { city, setCity, weather, loading, error, searchWeather };
}
