import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudFog,
  CloudLightning,
} from "lucide-react";

export function getWeatherLabel(code: number): string {
  if (code === 0) return "Ясно";
  if (code <= 3) return "Облачно";
  if (code <= 48) return "Туман";
  if (code <= 67) return "Дождь";
  if (code <= 77) return "Снег";
  if (code <= 82) return "Ливни";
  if (code >= 85) return "Снегопад";
  if (code >= 86) return "Сильный снегопад";
  if (code >= 95) return "Гроза";
  if (code >= 96) return "Гроза с градом";
  if (code >= 99) return "Сильная гроза с градом";
  return "Неизвестно";
}

export const weatherIcons = {
  0: Sun,

  1: Cloud,
  2: Cloud,
  3: Cloud,

  45: CloudFog,
  48: CloudFog,

  61: CloudRain,
  63: CloudRain,
  65: CloudRain,

  80: CloudRain,
  81: CloudRain,
  82: CloudRain,

  71: CloudSnow,
  73: CloudSnow,
  75: CloudSnow,
  77: CloudSnow,

  95: CloudLightning,
  96: CloudLightning,
  99: CloudLightning,
};

export function getWeatherBackground(code: number) {
  // Ясно
  if (code === 0) {
    return "from-[#2E5CFF] via-[#5DA9FF] to-[#A6D8FF]";
  }

  // Облачно
  if (code >= 1 && code <= 3) {
    return "from-[#3A3A3A] via-[#6B6B6B] to-[#AFAFAF]";
  }

  // Дождь
  if (code >= 51 && code <= 67) {
    return "from-[#1E3A5F] via-[#2C4F7A] to-[#5A7DA3]";
  }

  // Гроза
  if (code >= 95) {
    return "from-[#0B0F1A] via-[#1B1F2E] to-[#3A3F55]";
  }

  // Снег
  if (code >= 71 && code <= 77) {
    return "from-[#DDE6F2] via-[#AFC2D5] to-[#8FA4BB]";
  }

  // дефолт
  return "from-[#1F1F1E] via-[#2A2A28] to-[#3A3A36]";
}
