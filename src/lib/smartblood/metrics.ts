// Дизайн-система данных SmartBlood: 6 показателей, нормы и статусы.

export type MetricKey =
  | "glucose"
  | "cholesterol"
  | "triglycerides"
  | "hemoglobin"
  | "uricAcid"
  | "crp";

export interface MetricMeta {
  key: MetricKey;
  /** Русское название показателя */
  name: string;
  /** Короткое имя для чипов графика */
  short: string;
  unit: string;
  /** Границы нормы */
  min: number;
  max: number;
  /** Знаков после запятой при отображении */
  decimals: number;
  /** Диапазон оси графика динамики */
  chartMin: number;
  chartMax: number;
}

// Референсные нормы для взрослых; единый источник истины для UI и ИИ-блока.
export const NORMS: Record<MetricKey, MetricMeta> = {
  glucose: {
    key: "glucose",
    name: "Глюкоза",
    short: "Глюкоза",
    unit: "ммоль/л",
    min: 3.9,
    max: 6.1,
    decimals: 1,
    chartMin: 3,
    chartMax: 9,
  },
  cholesterol: {
    key: "cholesterol",
    name: "Холестерин",
    short: "Холестерин",
    unit: "ммоль/л",
    min: 3,
    max: 5.2,
    decimals: 1,
    chartMin: 2.5,
    chartMax: 7.5,
  },
  triglycerides: {
    key: "triglycerides",
    name: "Триглицериды",
    short: "Триглицериды",
    unit: "ммоль/л",
    min: 0.5,
    max: 1.7,
    decimals: 1,
    chartMin: 0,
    chartMax: 3.5,
  },
  hemoglobin: {
    key: "hemoglobin",
    name: "Гемоглобин",
    short: "Гемоглобин",
    unit: "г/л",
    min: 120,
    max: 160,
    decimals: 0,
    chartMin: 100,
    chartMax: 185,
  },
  uricAcid: {
    key: "uricAcid",
    name: "Мочевая кислота",
    short: "Мочевая к-та",
    unit: "мкмоль/л",
    min: 210,
    max: 420,
    decimals: 0,
    chartMin: 120,
    chartMax: 540,
  },
  crp: {
    key: "crp",
    name: "С-реактивный белок",
    short: "СРБ",
    unit: "мг/л",
    min: 0,
    max: 5,
    decimals: 1,
    chartMin: 0,
    chartMax: 12,
  },
};

/** Порядок показателей на экране результата */
export const METRIC_ORDER: MetricKey[] = [
  "glucose",
  "cholesterol",
  "triglycerides",
  "hemoglobin",
  "uricAcid",
  "crp",
];

export type MetricStatus = "normal" | "high" | "low";

export function metricStatus(key: MetricKey, value: number): MetricStatus {
  const meta = NORMS[key];
  if (value > meta.max) return "high";
  if (value < meta.min) return "low";
  return "normal";
}

/** «5,4» — русская запись числа без зависимости от локали среды */
export function formatMetricValue(meta: MetricMeta, value: number): string {
  return value.toFixed(meta.decimals).replace(".", ",");
}

/** «3,9–6,1 ммоль/л» — подпись нормы */
export function normRangeLabel(meta: MetricMeta): string {
  const from = meta.min.toFixed(meta.decimals).replace(".", ",");
  const to = meta.max.toFixed(meta.decimals).replace(".", ",");
  return `${from}–${to} ${meta.unit}`;
}

export type ValuesMap = Record<MetricKey, number>;

export interface Measurement {
  id: string;
  /** ISO-строка даты и времени измерения */
  date: string;
  values: ValuesMap;
}

/** Количество отклонений от нормы в измерении */
export function deviationCount(values: ValuesMap): number {
  return METRIC_ORDER.filter((key) => metricStatus(key, values[key]) !== "normal")
    .length;
}
