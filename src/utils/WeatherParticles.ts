export function getParticleType(code: number): "rain" | "snow" | "clear" {
  if (code >= 51 && code <= 67) return "rain"; // дождь
  if (code >= 71 && code <= 77) return "snow"; // снег
  if (code >= 95) return "rain"; // гроза = дождь эффект
  return "clear";
}
