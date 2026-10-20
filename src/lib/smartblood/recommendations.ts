// ИИ-рекомендации: правило-ориентированная логика из ТЗ проекта.
// Тексты правил синхронизированы со smartblood-ai/recommendations.py.

import { type MetricKey, type ValuesMap, NORMS, metricStatus } from "./metrics";

export type RecommendationTone = "good" | "warning" | "alert";

export interface Recommendation {
  tone: RecommendationTone;
  title: string;
  advice: string[];
}

const ADVICE: Partial<Record<MetricKey, string>> = {
  glucose:
    "Рекомендуем снизить потребление быстрых углеводов и проконсультироваться с эндокринологом.",
  cholesterol: "Добавьте в рацион больше овощей, клетчатки и рыбы.",
  triglycerides:
    "Ограничьте сахар и алкоголь, добавьте регулярную аэробную нагрузку.",
  crp: "Рекомендуем обратиться к врачу.",
  uricAcid: "Ограничьте красное мясо и пейте больше воды.",
};

const LOW_ADVICE: Partial<Record<MetricKey, string>> = {
  glucose:
    "Не пропускайте приёмы пищи; при повторении результата обратитесь к врачу.",
  hemoglobin:
    "Добавьте в рацион продукты, богатые железом, и обсудите результат с терапевтом.",
};

/**
 * Персональная рекомендация по 6 измеренным показателям.
 * Приоритет тона: воспаление/сахар → alert, прочие отклонения → warning.
 */
export function getRecommendations(values: ValuesMap): Recommendation {
  const advice: string[] = [];
  let alert = false;

  // Правила из ТЗ
  if (values.glucose > NORMS.glucose.max) {
    alert = true;
    advice.push(
      `Повышенный уровень сахара. ${ADVICE.glucose}`,
    );
  }
  if (values.cholesterol > NORMS.cholesterol.max) {
    advice.push(`Повышен холестерин. ${ADVICE.cholesterol}`);
  }
  if (values.crp > NORMS.crp.max) {
    alert = true;
    advice.push(`Признаки воспаления. ${ADVICE.crp}`);
  }

  // Дополнительные правила по остальным показателям
  if (values.triglycerides > NORMS.triglycerides.max) {
    advice.push(`Повышены триглицериды. ${ADVICE.triglycerides}`);
  }
  if (values.uricAcid > NORMS.uricAcid.max) {
    advice.push(`Мочевая кислота выше нормы. ${ADVICE.uricAcid}`);
  }

  const hb = values.hemoglobin;
  if (hb < NORMS.hemoglobin.min) {
    advice.push(`Гемоглобин ниже нормы. ${LOW_ADVICE.hemoglobin}`);
  } else if (hb > NORMS.hemoglobin.max) {
    advice.push(
      "Гемоглобин выше нормы. Пейте достаточно воды и сообщите о результате врачу.",
    );
  }
  if (values.glucose < NORMS.glucose.min && !alert) {
    advice.push(`Глюкоза ниже нормы. ${LOW_ADVICE.glucose}`);
  }

  if (advice.length === 0) {
    return {
      tone: "good",
      title: "Ваши показатели в норме",
      advice: ["Продолжайте вести здоровый образ жизни!"],
    };
  }

  const title = alert
    ? "Требуется внимание к здоровью"
    : "Есть отклонения от нормы";
  return { tone: alert ? "alert" : "warning", title, advice };
}

/** Заголовок-«саммари» для списка истории: «3 отклонения» / «Все в норме» */
export function summaryLabel(values: ValuesMap): string {
  const deviations = ["glucose", "cholesterol", "triglycerides", "hemoglobin", "uricAcid", "crp"].filter(
    (key) => metricStatus(key as MetricKey, values[key as MetricKey]) !== "normal",
  ).length;
  if (deviations === 0) return "Все показатели в норме";
  return `Отклонений: ${deviations}`;
}
