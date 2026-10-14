import { Router, Request, Response } from 'express';
import { getWeatherForCity } from '../data/openMeteo';

export const weatherRouter = Router();

weatherRouter.get('/', async (req: Request, res: Response) => {
  const city = typeof req.query.city === 'string' ? req.query.city.trim() : '';
  if (!city) {
    res.status(400).json({ error: 'Informe o nome de uma cidade.' });
    return;
  }
  try {
    const weather = await getWeatherForCity(city);
    if (!weather) {
      res.status(404).json({ error: 'Cidade não encontrada.' });
      return;
    }
    res.json(weather);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Falha ao consultar o clima.';
    res.status(502).json({ error: message });
  }
});
