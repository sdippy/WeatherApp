export type GeoCity = {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
};

export type OpenMeteoWeather = {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
    pressure_msl: number;
    wind_speed_10m: number;
    apparent_temperature: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
  };
};
