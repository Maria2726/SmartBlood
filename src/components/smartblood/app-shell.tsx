"use client";

// Каркас приложения: переключение экранов (Home / Measure / History),
// полноэкранный Result и хранение истории в localStorage.

import { useCallback, useEffect, useState } from "react";
import { Droplets, History as HistoryIcon, Home } from "lucide-react";
import { PhoneFrame } from "./phone-frame";
import { HomeScreen } from "./home-screen";
import { MeasureScreen } from "./measure-screen";
import { ResultScreen } from "./result-screen";
import { HistoryScreen } from "./history-screen";
import { type Measurement } from "@/lib/smartblood/metrics";
import { loadHistory, saveHistory } from "@/lib/smartblood/storage";
import { seedHistory } from "@/lib/smartblood/simulator";

type Screen = "home" | "measure" | "history" | "result";

function NavItem({
  active,
  label,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex w-20 flex-col items-center gap-1 py-1 text-[11px] font-semibold transition-colors ${
        active ? "text-sb-primary" : "text-slate-400 hover:text-slate-600"
      }`}
    >
      {children}
      {label}
    </button>
  );
}

export function SmartBloodApp() {
  const [history, setHistory] = useState<Measurement[] | null>(null);
  const [screen, setScreen] = useState<Screen>("home");
  // Результат текущего анализа до сохранения в историю
  const [pending, setPending] = useState<Measurement | null>(null);

  // Первый запуск: демо-история, чтобы прототип сразу был показательным.
  // Чтение хранилища асинхронное — клиентские данные появляются после гидрации.
  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      const stored = loadHistory();
      if (stored.length > 0) {
        setHistory(stored);
      } else {
        const seeded = seedHistory();
        setHistory(seeded);
        saveHistory(seeded);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleMeasureComplete = useCallback((measurement: Measurement) => {
    setPending(measurement);
    setScreen("result");
  }, []);

  const handleSave = useCallback(() => {
    if (!pending || !history) return;
    const next = [...history, pending].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
    setHistory(next);
    saveHistory(next);
    setPending(null);
    setScreen("home");
  }, [pending, history]);

  const handleDiscard = useCallback(() => {
    setPending(null);
    setScreen("home");
  }, []);

  return (
    <PhoneFrame>
      <main className="relative flex min-h-0 flex-1 flex-col">
        {screen === "home" && (
          <HomeScreen
            history={history}
            onStartMeasure={() => setScreen("measure")}
          />
        )}
        {screen === "measure" && (
          <MeasureScreen
            onComplete={handleMeasureComplete}
            onCancel={() => setScreen("home")}
          />
        )}
        {screen === "history" && <HistoryScreen history={history ?? []} />}
        {screen === "result" && pending && (
          <ResultScreen
            measurement={pending}
            onSave={handleSave}
            onDiscard={handleDiscard}
          />
        )}
      </main>

      {screen !== "result" && (
        <nav
          aria-label="Основная навигация"
          className="absolute inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-4 pb-5 pt-2 backdrop-blur"
        >
          <div className="flex items-end justify-around">
            <NavItem
              active={screen === "home"}
              label="Главная"
              onClick={() => setScreen("home")}
            >
              <Home className="h-5 w-5" />
            </NavItem>

            <NavItem
              active={screen === "measure"}
              label="Анализ"
              onClick={() => setScreen("measure")}
            >
              <span className="-mt-7 flex h-14 w-14 items-center justify-center rounded-full bg-sb-mint text-white shadow-cta ring-4 ring-white">
                <Droplets className="h-6 w-6" />
              </span>
            </NavItem>

            <NavItem
              active={screen === "history"}
              label="История"
              onClick={() => setScreen("history")}
            >
              <HistoryIcon className="h-5 w-5" />
            </NavItem>
          </div>
        </nav>
      )}
    </PhoneFrame>
  );
}
