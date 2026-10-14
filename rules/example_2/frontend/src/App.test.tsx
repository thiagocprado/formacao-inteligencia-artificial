import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('painel de clima', () => {
  it('consulta o backend e apresenta o clima atual da cidade', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        city: 'São Paulo', country: 'Brasil', temperature: 24.5, apparentTemperature: 25.1,
        relativeHumidity: 70, weatherCode: 1, windSpeed: 8.2, time: '2026-10-13T14:00:00Z',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    render(<App />);
    fireEvent.change(screen.getByLabelText('Nome da cidade'), { target: { value: 'São Paulo' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(await screen.findByRole('heading', { name: 'São Paulo, Brasil' })).toBeTruthy();
    expect(screen.getByRole('article').textContent).toContain('25°');
    expect(screen.getByText('Parcialmente nublado')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:3000/weather?city=S%C3%A3o%20Paulo');
  });

  it('exibe erro quando o backend não encontra a cidade', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Cidade não encontrada.' }) }));
    render(<App />);
    fireEvent.change(screen.getByLabelText('Nome da cidade'), { target: { value: 'Atlantis' } });
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Cidade não encontrada.'));
  });

  it('valida a cidade antes de chamar o backend', () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(screen.getByRole('alert').textContent).toBe('Digite o nome de uma cidade.');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
