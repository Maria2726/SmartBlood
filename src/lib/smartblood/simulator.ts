// Имитация устройства SmartBlood: случайные значения в правдоподобных
// пределах (норма + возможные отклонения). Аналог Future.delayed + Random()
// из Flutter-версии.

import {
  type Measurement,
  type MetricKey,
  type ValuesMap,
  METRIC_ORDER,
  NORMS,
} from "./metrics";

/** Диапазон, в который «попадает» устройство при измерении */
const DEVICE_RANGES: Record<MetricKey, [number, number]> = {
  glucose: [4.2, 7.6],
  cholesterol: [3.8, 6.6],
  triglycerides: [0.7, 2.8],
  hemoglobin: [112, 168],
  uricAcid: [230, 480],
  crp: [0.4, 8.5],
};

export function randomMetricValue(key: MetricKey): number {
  const [from, to] = DEVICE_RANGES[key];
  const raw = from + Math.random() * (to - from);
  return Number(raw.toFixed(NORMS[key].decimals));
}

export function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createMeasurement(date: Date = new Date()): Measurement {
  const values = {} as ValuesMap;
  for (const key of METRIC_ORDER) {
    values[key] = randomMetricValue(key);
  }
  return { id: uid(), date: date.toISOString(), values };
}

/**
 * Демо-история за последние 7 дней: детерминированные значения,
 * чтобы первый показ инвесторам сразу был показательным.
 */
const SEED_SAMPLES: number[][] = [
  [5.4, 4.6, 1.1, 142, 320, 1.6],
  [5.1, 4.9, 1.3, 140, 335, 2.1],
  [5.6, 5.4, 1.2, 145, 310, 1.9],
  [6.4, 5.0, 1.5, 138, 352, 3.0],
  [5.9, 5.6, 1.4, 141, 341, 2.4],
  [5.2, 4.8, 1.0, 144, 328, 1.7],
  [5.8, 5.5, 1.2, 139, 347, 2.6],
];

export function seedHistory(now: Date = new Date()): Measurement[] {
  return SEED_SAMPLES.map((sample, index) => {
    const date = new Date(now);
    date.setDate(date.getDate() - (SEED_SAMPLES.length - 1 - index));
    date.setHours(9, 30, 0, 0);
    const values = {} as ValuesMap;
    METRIC_ORDER.forEach((key, i) => {
      values[key] = sample[i];
    });
    return { id: `seed-${index}`, date: date.toISOString(), values };
  });
}
