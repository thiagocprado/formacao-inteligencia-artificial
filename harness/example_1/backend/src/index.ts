import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/weather', async (req: Request, res: Response) => {
  const city = typeof req.query.city === 'string' ? req.query.city.trim() : '';
  if (!city) {
    res.status(400).json({ error: 'Informe uma cidade no parâmetro city.' });
    return;
  }

  try {
    const geocodingUrl = new URL('https://geocoding-api.open-meteo.com/v1/search');
    geocodingUrl.search = new URLSearchParams({ name: city, count: '1', language: 'pt', format: 'json' }).toString();
    const geocodingResponse = await fetch(geocodingUrl);
    if (!geocodingResponse.ok) throw new Error('Não foi possível consultar a localização.');
    const geocoding = await geocodingResponse.json() as {
      results?: Array<{ name: string; latitude: number; longitude: number; country?: string; admin1?: string; timezone?: string }>;
    };
    const location = geocoding.results?.[0];
    if (!location) {
      res.status(404).json({ error: `Não encontramos a cidade “${city}”.` });
      return;
    }

    const weatherUrl = new URL('https://api.open-meteo.com/v1/forecast');
    weatherUrl.search = new URLSearchParams({
      latitude: String(location.latitude), longitude: String(location.longitude),
      current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
      timezone: location.timezone || 'auto', forecast_days: '1',
    }).toString();
    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) throw new Error('Não foi possível consultar o clima agora.');
    const weather = await weatherResponse.json() as {
      current?: Record<string, number | string>;
      current_units?: Record<string, string>;
      daily?: Record<string, Array<number | string>>;
    };
    res.json({
      location: { name: location.name, region: location.admin1, country: location.country },
      current: weather.current,
      currentUnits: weather.current_units,
      daily: weather.daily,
    });
  } catch (error) {
    console.error('Weather lookup failed:', error);
    res.status(502).json({ error: 'Não foi possível obter os dados do clima. Tente novamente.' });
  }
});

app.use((err: Error, _req: Request, res: Response, _next: any) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
