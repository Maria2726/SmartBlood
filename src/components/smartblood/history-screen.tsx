"use client";

// Экран 4. History: список прошлых измерений; тап по записи раскрывает
// детали — все 6 показателей и рекомендацию ИИ для этого анализа.

import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronDown, Sparkles } from "lucide-react";
import { Card, SectionTitle, StatusDot } from "./ui";
import {
  type Measurement,
  type MetricKey,
  METRIC_ORDER,
  NORMS,
  deviationCount,
  formatMetricValue,
  metricStatus,
  normRangeLabel,
} from "@/lib/smartblood/metrics";
import { getRecommendations } from "@/lib/smartblood/recommendations";

const PREVIEW_METRICS: MetricKey[] = ["glucose", "cholesterol", "hemoglobin"];

function HistoryCard({
  item,
  open,
  onToggle,
}: {
  item: Measurement;
  open: boolean;
  onToggle: () => void;
}) {
  const deviations = deviationCount(item.values);
  const recommendation = getRecommendations(item.values);

  return (
    <Card className="p-0">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="w-full px-4 pb-3 pt-4 text-left"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold capitalize text-sb-primary">
            {format(new Date(item.date), "d MMMM, HH:mm", { locale: ru })}
          </p>
          <span className="flex items-center gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                deviations === 0
                  ? "bg-sb-mint/10 text-emerald-600"
                  : "bg-sb-error/10 text-sb-error"
              }`}
            >
              {deviations === 0 ? "Все в норме" : `Отклонений: ${deviations}`}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform ${
                open ? "rotate-180" : ""
              }`}
            />
          </span>
        </div>

        <div className="mt-3 flex justify-between gap-2">
          {PREVIEW_METRICS.map((key) => {
            const meta = NORMS[key];
            const value = item.values[key];
            return (
              <div key={key} className="flex flex-col gap-1">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <StatusDot status={metricStatus(key, value)} />
                  {meta.short}
                </span>
                <span className="text-base font-bold text-sb-primary">
                  {formatMetricValue(meta, value)}
                  <span className="ml-0.5 text-[10px] font-medium text-slate-400">
                    {meta.unit}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </button>

      {open && (
        <div className="animate-sb-fade-up border-t border-slate-100 px-4 py-3">
          <ul>
            {METRIC_ORDER.map((key) => {
              const meta = NORMS[key];
              const value = item.values[key];
              const status = metricStatus(key, value);
              return (
                <li
                  key={key}
                  className="flex items-center justify-between py-1.5 text-sm"
                >
                  <span className="flex items-center gap-2 text-slate-600">
                    <StatusDot status={status} />
                    {meta.name}
                  </span>
                  <span className="font-semibold text-sb-primary">
                    {formatMetricValue(meta, value)}{" "}
                    <span className="text-xs font-normal text-slate-400">
                      {meta.unit} · норма {normRangeLabel(meta)}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-3 rounded-xl bg-slate-50 p-3">
            <p className="flex items-center gap-2 text-sm font-bold text-sb-primary">
              <Sparkles className="h-4 w-4 text-sb-mint" />
              {recommendation.title}
            </p>
            <ul className="mt-2 space-y-1.5">
              {recommendation.advice.map((advice) => (
                <li key={advice} className="text-xs leading-relaxed text-slate-500">
                  {advice}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </Card>
  );
}

export function HistoryScreen({ history }: { history: Measurement[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const newestFirst = [...history].reverse();

  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-28 pt-4">
      <header>
        <h1 className="text-2xl font-bold text-sb-primary">История</h1>
        <p className="mt-1 text-sm text-slate-500">
          {history.length > 0
            ? `${history.length} ${history.length === 1 ? "измерение" : "измерений"} сохранено на устройстве`
            : "Данные хранятся только на устройстве"}
        </p>
      </header>

      {newestFirst.length === 0 ? (
        <Card className="text-sm text-slate-500">
          История пуста. Сделайте анализ — результат появится здесь.
        </Card>
      ) : (
        <SectionTitle>Все измерения</SectionTitle>
      )}

      {newestFirst.map((item) => (
        <HistoryCard
          key={item.id}
          item={item}
          open={openId === item.id}
          onToggle={() => setOpenId(openId === item.id ? null : item.id)}
        />
      ))}
    </div>
  );
}
