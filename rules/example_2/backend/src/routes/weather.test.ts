import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { app } from '../index';

const mockGeocoding = {
  results: [{ name: 'São Paulo', country: 'Brasil', latitude: -23.55, longitude: -46.63 }],
};
const mockForecast = {
  current: {
    temperature_2m: 24.5,
    apparent_temperature: 25.1,
    relative_humidity_2m: 70,
    weather_code: 1,
    wind_speed_10m: 8.2,
    time: '2026-10-13T14:00',
  },
};

afterEach(() => vi.unstubAllGlobals());

describe('GET /weather', () => {
  it('retorna condições atuais encontradas para a cidade', async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => mockGeocoding })
      .mockResolvedValueOnce({ ok: true, json: async () => mockForecast });
    vi.stubGlobal('fetch', fetchMock);
    const response = await request(app).get('/weather').query({ city: 'São Paulo' });
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      city: 'São Paulo', country: 'Brasil', temperature: 24.5, apparentTemperature: 25.1,
      relativeHumidity: 70, weatherCode: 1, windSpeed: 8.2, time: '2026-10-13T14:00',
    });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('rejeita consultas sem cidade', async () => {
    const response = await request(app).get('/weather');
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Informe o nome de uma cidade.');
  });

  it('retorna 404 quando a busca não encontra cidade', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }));
    const response = await request(app).get('/weather').query({ city: 'Cidade inexistente' });
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Cidade não encontrada.');
  });

  it('retorna 502 quando o serviço externo falha', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    const response = await request(app).get('/weather').query({ city: 'São Paulo' });
    expect(response.status).toBe(502);
    expect(response.body.error).toContain('serviço de clima');
  });
});
