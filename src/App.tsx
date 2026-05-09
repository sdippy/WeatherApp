import { useEffect, useState } from "react";
import { getCoordinates, fetchWeather, getCityByCoords } from "./api/weather";
import type { OpenMeteoWeather, GeoCity } from "./types/weather";
import { getWeatherLabel, weatherIcons } from "./utils/weather";
import { MapPin, Cloud } from "lucide-react";

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<OpenMeteoWeather | null>(null);
  const [location, setLocation] = useState<GeoCity | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!city) return;

    try {
      setLoading(true);
      setError(null);

      const geo = await getCoordinates(city);
      const data = await fetchWeather(geo.latitude, geo.longitude);

      setLocation(geo);
      setWeather(data);
    } catch (e: unknown) {
      if (e instanceof Error) setError(e.message);
      setWeather(null);
      setLocation(null);
    } finally {
      setLoading(false);
    }
  };

  const current = weather?.current;
  const hourly = weather?.hourly;
  const daily = weather?.daily;

  useEffect(() => {
    const DEFAULT = {
      lat: 55.7558,
      lon: 37.6173,
      name: "Москва",
      country: "RU",
    };

    const loadWeather = async (lat: number, lon: number, cityName?: string) => {
      try {
        setLoading(true);
        setError(null);

        const [weatherData, cityData] = await Promise.all([
          fetchWeather(lat, lon),
          getCityByCoords(lat, lon),
        ]);

        setWeather(weatherData);

        setLocation({
          name: cityData?.name || cityName || "Unknown",
          latitude: lat,
          longitude: lon,
          country: cityData?.country || "",
        });
      } catch (e) {
        if (e instanceof Error) setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    const cached = localStorage.getItem("coords");

    // 1. SILENT MODE — используем кеш
    if (cached) {
      const { lat, lon, name, country } = JSON.parse(cached);

      loadWeather(lat, lon, name);

      setLocation({
        name,
        latitude: lat,
        longitude: lon,
        country,
      });

      return;
    }

    // 2. нет кеша → геолокация
    if (!navigator.geolocation) {
      loadWeather(DEFAULT.lat, DEFAULT.lon, DEFAULT.name);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // сохраняем кеш (silent mode ключевая часть)
        localStorage.setItem(
          "coords",
          JSON.stringify({
            lat,
            lon,
          }),
        );

        await loadWeather(lat, lon);
      },
      async () => {
        // 3. если пользователь запретил гео → fallback
        await loadWeather(DEFAULT.lat, DEFAULT.lon, DEFAULT.name);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      },
    );
  }, []);

  const hourlyForecast =
    hourly?.time.map((time, index) => ({
      time,
      temperature: hourly.temperature_2m[index],
      weatherCode: Number(hourly.weather_code[index]),
    })) || [];

  const selectedHours = hourlyForecast
    .filter((hour) => {
      const date = new Date(hour.time);

      return date.getHours() % 2 === 0;
    })
    .slice(0, 5);

  const forecast5Days =
    weather?.daily?.time.slice(0, 5).map((date, index) => ({
      date,
      max: weather.daily.temperature_2m_max[index],
      min: weather.daily.temperature_2m_min[index],
      code: weather.daily.weather_code[index],
    })) || [];

  function getWeekday(date: string) {
    return new Date(date).toLocaleDateString("ru-RU", {
      weekday: "short",
    });
  }

  return (
    <div
      className={` relative
    min-h-screen flex items-center justify-center
    text-[#FAF9F6]
    bg-[#1F1F1E]
    transition-all duration-1000 ease-in-out animate-gradient
    
  `}
    >
      {/* <WeatherParticles type={particleType} /> */}

      <div className="relative z-10 flex flex-col items-center justify-center gap-[20px] w-full">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex gap-[10px] h-[40px] w-[450px] grid grid-cols-3"
        >
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Введите город..."
            className="border-[1px] border-[#4A4A46] rounded-[10px] bg-[#30302E] col-span-2 px-10"
          />
          <button
            className="border-[1px] border-[#4A4A46] rounded-[10px] bg-[#30302E] hover:bg-[#262624] transition-colors px-10"
            onClick={handleSearch}
          >
            Найти
          </button>
        </form>

        {loading && <p>Loading...</p>}

        {error && <p style={{ color: "red" }}>{error}</p>}
        {/* info */}
        {current && (
          <div className="border-[1px] border-[#4A4A46] p-10 rounded-[10px] bg-[#30302E] w-[450px]">
            <div className="flex items-center gap-1 leading-none">
              <MapPin size={12} color="#C8C6BC" />

              {location && (
                <h2 className="text-[#C8C6BC] text-[12px]">{location.name}</h2>
              )}
              <span className="text-[#C8C6BC]">·</span>
              <h2 className="text-[#80AADD] text-[12px] rounded-[10px] bg-[#253E60] px-2">
                Сейчас
              </h2>
            </div>

            <div className="gap-5 pt-2 flex flex-col">
              <div className="flex flex-row gap-5">
                <p className="text-[35px] text-[#FAF9F6] font-bold">
                  {current.temperature_2m}°
                </p>
                <div className="flex flex-col justify-center gap-1 text-[#FAF9F6]">
                  <div className="text-[16px]">
                    {getWeatherLabel(current.weather_code)}
                  </div>
                  <p className="text-[14px]">
                    Ощущается как: {current.apparent_temperature}°
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col justify-center text-center bg-[#262624] rounded-[7px] py-4">
                  <p className="text-[12px] text-[#C2C0B6]">Влажность</p>
                  <p className="text-[14px] text-[#FAF9F6] font-bold">
                    {current.relative_humidity_2m}%
                  </p>
                </div>
                <div className="flex flex-col justify-center text-center bg-[#262624] rounded-[7px]">
                  <p className="text-[12px] text-[#C2C0B6]">Ветер</p>
                  <p className="text-[14px] text-[#FAF9F6] font-bold">
                    {current.wind_speed_10m} км/ч
                  </p>
                </div>
                <div className="flex flex-col justify-center text-center bg-[#262624] rounded-[7px]">
                  <p className="text-[12px] text-[#C2C0B6]">Давление</p>
                  <p className="text-[14px] text-[#FAF9F6] font-bold">
                    {Math.round(current.pressure_msl * 0.750062)} мм
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        {hourly && (
          <div className="max-w-[450px] w-full flex flex-col gap-5">
            <p className="text-[14px] text-[#C2C0B6]">ПО ЧАСАМ</p>
            <div className="grid grid-cols-5 gap-2 overflow-x-auto scrollbar-hide">
              {selectedHours.map((hour) => {
                const Icon =
                  weatherIcons[hour.weatherCode as keyof typeof weatherIcons] ||
                  Cloud;

                return (
                  <div
                    key={hour.time}
                    className="min-w-[75px] max-w-[80px] bg-[#30302E] border-[1px] border-[#4A4A46] rounded-[10px] py-2 text-center flex flex-col justify-center items-center gap-1"
                  >
                    <p className="text-[12px] text-[#C2C0B6]">
                      {new Date(hour.time).toLocaleTimeString("ru-RU", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <div>
                      <Icon size={18} color="#C2C0B6" />
                    </div>
                    <p className="text-[14px] font-bold text-[#FAF9F6]">
                      {Math.round(hour.temperature)}°
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {daily && (
          <div className="w-[450px] w-full flex flex-col gap-5">
            <p className="text-[14px] text-[#C2C0B6]">5 ДНЕЙ</p>
            <div className="flex flex-col border-[1px] border-[#4A4A46] rounded-[10px] bg-[#30302E]">
              {forecast5Days.map((day) => {
                const Icon =
                  weatherIcons[day.code as keyof typeof weatherIcons] || Cloud;
                return (
                  <div
                    key={day.date}
                    className="grid grid-cols-[110px_1fr_80px] items-center h-[40px] border-b-[1px] border-[#4A4A46] last:border-b-0 px-10"
                  >
                    <p className="text-[14px] text-[#FAF9F6]">
                      {getWeekday(day.date)}
                    </p>

                    <div className="flex items-center gap-2">
                      <Icon size={18} color="#C2C0B6" />
                      <p className="text-[#C2C0B6] text-[14px]">
                        {getWeatherLabel(day.code)}
                      </p>
                    </div>

                    <div className="flex justify-end gap-2">
                      <p className="w-[28px] text-right text-[14px] font-bold text-[#FAF9F6]">
                        {Math.round(day.max)}°
                      </p>
                      <p className="w-[28px] text-right text-[14px] font-bold text-[#C2C0B6]">
                        {Math.round(day.min)}°
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
