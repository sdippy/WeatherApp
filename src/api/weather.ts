import type { GeoCity, OpenMeteoWeather } from "../types/weather";

// 1. Геокодинг (город → координаты)
export async function getCoordinates(city: string): Promise<GeoCity> {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=ru&format=json`,
  );

  if (!res.ok) {
    throw new Error("Ошибка геокодинга");
  }

  const data = await res.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("Город не найден");
  }

  const result = data.results[0];

  return {
    name: result.name,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude,
  };
}

// 2. Погода (Open-Meteo)
export async function fetchWeather(
  lat: number,
  lon: number,
): Promise<OpenMeteoWeather> {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,pressure_msl,wind_speed_10m,weather_code,apparent_temperature&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`,
  );

  if (!res.ok) {
    throw new Error("Ошибка получения погоды");
  }

  return res.json();
}

// 3. Reverse geocoding (координаты → город)
export async function getCityByCoords(lat: number, lon: number) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
    {
      headers: {
        "User-Agent": "weather-app",
      },
    },
  );

  if (!res.ok) {
    throw new Error("Ошибка reverse geocoding");
  }

  const data = await res.json();

  return {
    name:
      data.address.city ||
      data.address.town ||
      data.address.village ||
      data.address.county ||
      "Unknown",
    country: data.address.country,
  };
}
