"use client";

// Экран 2. Measure: имитация анализа устройством.
// В Flutter-версии — Future.delayed(Duration(seconds: 5)) + Random();
// здесь тот же сценарий: 5 секунд прогресса и генерация результата.

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import type { Measurement } from "@/lib/smartblood/metrics";
import { createMeasurement } from "@/lib/smartblood/simulator";

const DURATION_MS = 5000; // имитация 5 минут анализа
const TICK_MS = 100;

const STAGES: ReadonlyArray<{ until: number; label: string }> = [
  { until: 0.34, label: "Забор капли крови (10 мкл)" },
  { until: 0.67, label: "Оптический анализ образца" },
  { until: 1.01, label: "Расчёт показателей" },
];

function stageLabel(progress: number): string {
  return (STAGES.find((stage) => progress < stage.until) ?? STAGES[2]).label;
}

function BloodDrop() {
  return (
    <div className="relative flex h-40 w-40 items-center justify-center">
      {/* Расходящиеся кольца «пульсации» */}
      <span className="absolute inset-0 rounded-full border-2 border-sb-error/40 animate-sb-ring" />
      <span
        className="absolute inset-0 rounded-full border-2 border-sb-error/30 animate-sb-ring"
        style={{ animationDelay: "0.8s" }}
      />
      <svg
        viewBox="0 0 24 24"
        className="h-24 w-24 animate-sb-pulse drop-shadow-[0_10px_20px_rgba(255,77,79,0.35)]"
        role="img"
        aria-label="Анимация капли крови"
      >
        <defs>
          <linearGradient id="sb-drop" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#FF6B6E" />
            <stop offset="1" stopColor="#D93636" />
          </linearGradient>
        </defs>
        <path
          d="M12 2.5C12 2.5 5.5 10.2 5.5 15a6.5 6.5 0 0 0 13 0C18.5 10.2 12 2.5 12 2.5Z"
          fill="url(#sb-drop)"
        />
        <path
          d="M9.4 13.6c-.6 1.9.2 3.6 1.6 4.3"
          stroke="#FFFFFF"
          strokeOpacity="0.55"
          strokeWidth="1.1"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </div>
  );
}

export function MeasureScreen({
  onComplete,
  onCancel,
}: {
  onComplete: (measurement: Measurement) => void;
  onCancel: () => void;
}) {
  const [progress, setProgress] = useState(0);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const value = Math.min(1, (Date.now() - startedAt) / DURATION_MS);
      setProgress(value);
      if (value >= 1) {
        window.clearInterval(timer);
        onCompleteRef.current(createMeasurement());
      }
    }, TICK_MS);
    return () => window.clearInterval(timer);
  }, []);

  const secondsLeft = Math.ceil((1 - progress) * (DURATION_MS / 1000));

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 pb-10 text-center">
      <BloodDrop />

      <h1 className="mt-10 animate-sb-fade-up text-2xl font-bold leading-snug text-sb-primary">
        Приложите палец к устройству SmartBlood
      </h1>
      <p className="mt-3 animate-sb-fade-up text-base text-slate-500">
        {stageLabel(progress)}
      </p>

      <div className="mt-10 w-full animate-sb-fade-up">
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <div
            className="h-full rounded-full bg-sb-mint transition-[width] duration-100 ease-linear"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
        <div className="mt-2.5 flex items-center justify-between text-sm font-medium text-slate-500">
          <span>{Math.round(progress * 100)}%</span>
          <span>осталось {secondsLeft} с</span>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-slate-400">
          В реальном устройстве анализ занимает 5 минут. В прототипе время
          сокращено до 5 секунд.
        </p>
      </div>

      <Button
        variant="ghost"
        onClick={onCancel}
        className="mt-10 h-11 rounded-2xl text-base text-slate-500 hover:bg-slate-200/60 hover:text-slate-700"
      >
        Отменить
      </Button>
    </div>
  );
}
