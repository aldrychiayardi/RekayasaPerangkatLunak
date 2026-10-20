export const ORIGIN_CITY = "Pontianak";

export const DESTINATION_CITIES = [
  "Kubu Raya",
  "Sungai Pinyuh",
  "Anjongan",
  "Toho",
  "Menjalin",
  "Karangan",
  "Seluas"
] as const;

export function isSupportedDestination(city: string): boolean {
  return DESTINATION_CITIES.some((destination) => destination === city);
}
