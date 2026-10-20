// Локальное хранилище истории измерений (аналог shared_preferences).

import { type Measurement, type ValuesMap, METRIC_ORDER } from "./metrics";

const STORAGE_KEY = "smartblood.history.v1";

function isValuesMap(value: unknown): value is ValuesMap {
  if (typeof value !== "object" || value === null) return false;
  return METRIC_ORDER.every(
    (key) => typeof (value as Record<string, unknown>)[key] === "number",
  );
}

function isMeasurement(value: unknown): value is Measurement {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.id === "string" &&
    typeof item.date === "string" &&
    isValuesMap(item.values)
  );
}

export function loadHistory(): Measurement[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isMeasurement);
  } catch {
    return [];
  }
}

export function saveHistory(history: Measurement[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Приватный режим / переполнение квоты: MVP продолжает работать в памяти
  }
}
