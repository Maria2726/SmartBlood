"use client";

// Экран 3. Result: 6 показателей с нормами, блок «Рекомендация ИИ»
// и сохранение в историю.

import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Activity, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  type Measurement,
  METRIC_ORDER,
  NORMS,
  deviationCount,
  formatMetricValue,
  metricStatus,
  normRangeLabel,
} from "@/lib/smartblood/metrics";
import { getRecommendations, type RecommendationTone } from "@/lib/smartblood/recommendations";
import { StatusPill } from "./ui";

const TONE_STYLES: Record<
  RecommendationTone,
  { icon: typeof Activity; badge: string; card: string }
> = {
  good: {
    icon: CheckCircle2,
    badge: "bg-sb-mint/20 text-emerald-300",
    card: "from-sb-primary to-[#0E3A5C]",
  },
  warning: {
    icon: Activity,
    badge: "bg-amber-400/20 text-amber-300",
    card: "from-sb-primary to-[#0E3A5C]",
  },
  alert: {
    icon: AlertTriangle,
    badge: "bg-sb-error/25 text-red-300",
    card: "from-[#5C1220] to-sb-primary",
  },
};

export function ResultScreen({
  measurement,
  onSave,
  onDiscard,
}: {
  measurement: Measurement;
  onSave: () => void;
  onDiscard: () => void;
}) {
  const recommendation = getRecommendations(measurement.values);
  const deviations = deviationCount(measurement.values);
  const tone = TONE_STYLES[recommendation.tone];
  const ToneIcon = tone.icon;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-5 pb-6 pt-4">
        <header>
          <h1 className="text-2xl font-bold text-sb-primary">
            Результат анализа
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {format(new Date(measurement.date), "d MMMM, HH:mm", { locale: ru })} · SmartBlood
          </p>
        </header>

        {/* Все 6 показателей с нормами */}
        <section className="rounded-2xl border border-slate-100 bg-white px-4 shadow-card">
          {METRIC_ORDER.map((key, index) => {
            const meta = NORMS[key];
            const value = measurement.values[key];
            return (
              <div
                key={key}
                className={`flex items-center justify-between gap-3 py-3.5 ${
                  index > 0 ? "border-t border-slate-100" : ""
                }`}
              >
                <div>
                  <p className="text-base font-semibold text-sb-primary">
                    {meta.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    Норма: {normRangeLabel(meta)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-bold text-sb-primary">
                    {formatMetricValue(meta, value)}
                    <span className="ml-1 text-xs font-medium text-slate-400">
                      {meta.unit}
                    </span>
                  </p>
                  <StatusPill status={metricStatus(key, value)} />
                </div>
              </div>
            );
          })}
        </section>

        {/* Блок «Рекомендация ИИ» */}
        <section
          className={`rounded-2xl bg-gradient-to-br p-5 text-white shadow-card ${tone.card}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
                <Sparkles className="h-5 w-5 text-sb-mint" />
              </span>
              <h2 className="text-base font-bold">Рекомендация ИИ</h2>
            </div>
            <span
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${tone.badge}`}
            >
              <ToneIcon className="h-3.5 w-3.5" />
              {deviations === 0 ? "Все в норме" : `Отклонений: ${deviations}`}
            </span>
          </div>

          <p className="mt-4 text-lg font-bold leading-snug">
            {recommendation.title}
          </p>
          <ul className="mt-2.5 space-y-2">
            {recommendation.advice.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-white/85">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sb-mint" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[11px] leading-relaxed text-white/50">
            Рекомендации не являются медицинской консультацией. При отклонениях
            обратитесь к врачу.
          </p>
        </section>
      </div>

      <div className="space-y-2 border-t border-slate-200 bg-white px-5 py-4">
        <Button
          onClick={onSave}
          className="h-12 w-full rounded-2xl bg-sb-mint text-base font-bold text-white shadow-cta hover:brightness-95"
        >
          Сохранить в историю
        </Button>
        <Button
          variant="ghost"
          onClick={onDiscard}
          className="h-11 w-full rounded-2xl text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-700"
        >
          Закрыть без сохранения
        </Button>
      </div>
    </div>
  );
}
