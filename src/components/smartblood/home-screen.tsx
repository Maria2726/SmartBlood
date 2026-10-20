"use client";

// Экран 1. Home (Дашборд): приветствие, последние показатели,
// график динамики за 7 измерений и большая кнопка «Сделать анализ».

import { useState } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, SectionTitle, StatusDot } from "./ui";
import { TrendChart, type TrendPoint } from "./trend-chart";
import {
  type Measurement,
  type MetricKey,
  type ValuesMap,
  NORMS,
  formatMetricValue,
  metricStatus,
} from "@/lib/smartblood/metrics";

const USER_NAME = "Анна";

const CARD_METRICS: MetricKey[] = ["glucose", "cholesterol", "hemoglobin"];
const CHART_METRICS: MetricKey[] = ["glucose", "cholesterol", "hemoglobin"];

function toTrendPoints(history: Measurement[], key: MetricKey): TrendPoint[] {
  return history.slice(-7).map((item) => ({
    label: format(new Date(item.date), "dd.MM"),
    value: item.values[key],
  }));
}

function MetricCard({ metricKey, values }: { metricKey: MetricKey; values: ValuesMap }) {
  const meta = NORMS[metricKey];
  const value = values[metricKey];
  return (
    <Card className="flex flex-col gap-2 p-3">
      <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
        <StatusDot status={metricStatus(metricKey, value)} />
        <span className="truncate">{meta.short}</span>
      </span>
      <span className="text-3xl font-bold leading-none text-sb-primary">
        {formatMetricValue(meta, value)}
        <span className="ml-1 align-baseline text-[10px] font-medium text-slate-400">
          {meta.unit}
        </span>
      </span>
    </Card>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse space-y-4 pt-2">
      <div className="h-8 w-56 rounded-xl bg-slate-200" />
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-200/70" />
        ))}
      </div>
      <div className="h-56 rounded-2xl bg-slate-200/70" />
    </div>
  );
}

export function HomeScreen({
  history,
  onStartMeasure,
}: {
  history: Measurement[] | null;
  onStartMeasure: () => void;
}) {
  const [chartKey, setChartKey] = useState<MetricKey>("glucose");
  const latest = history?.[history.length - 1];

  return (
    <div className="flex-1 space-y-5 overflow-y-auto px-5 pb-28 pt-4">
      {history === null ? (
        <Skeleton />
      ) : (
        <>
          <header>
            <h1 className="text-2xl font-bold text-sb-primary">
              Здравствуйте, {USER_NAME}
            </h1>
            <p className="mt-1 text-sm capitalize text-slate-500">
              {format(new Date(), "EEEE, d MMMM", { locale: ru })}
            </p>
          </header>

          {latest ? (
            <section className="space-y-3">
              <SectionTitle>Последние показатели</SectionTitle>
              <div className="grid grid-cols-3 gap-3">
                {CARD_METRICS.map((key) => (
                  <MetricCard key={key} metricKey={key} values={latest.values} />
                ))}
              </div>
              <p className="text-xs text-slate-400">
                Измерено {format(new Date(latest.date), "d MMMM в HH:mm", { locale: ru })}
              </p>
            </section>
          ) : (
            <Card className="text-sm text-slate-500">
              Пока нет измерений. Сделайте первый анализ, чтобы увидеть
              показатели здесь.
            </Card>
          )}

          {history.length >= 2 && (
            <section className="space-y-3">
              <SectionTitle>Динамика за 7 измерений</SectionTitle>
              <Card>
                <div className="mb-3 flex gap-2">
                  {CHART_METRICS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setChartKey(key)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        chartKey === key
                          ? "bg-sb-primary text-white"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                      }`}
                    >
                      {NORMS[key].short}
                    </button>
                  ))}
                </div>
                <TrendChart
                  points={toTrendPoints(history, chartKey)}
                  meta={NORMS[chartKey]}
                />
              </Card>
            </section>
          )}

          <Button
            onClick={onStartMeasure}
            className="h-14 w-full rounded-2xl bg-sb-mint text-lg font-bold text-white shadow-cta hover:brightness-95"
          >
            <Droplets className="mr-2 h-5 w-5" />
            Сделать анализ
          </Button>
        </>
      )}
    </div>
  );
}
