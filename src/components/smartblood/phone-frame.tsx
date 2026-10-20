import { BatteryFull, Droplets, Sparkles, Wifi } from "lucide-react";

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pt-3 text-xs font-semibold text-sb-primary">
      <span>9:41</span>
      <span className="flex items-center gap-1.5 text-slate-700">
        <Wifi className="h-3.5 w-3.5" />
        <BatteryFull className="h-4 w-4" />
      </span>
    </div>
  );
}

function BrandPanel() {
  return (
    <aside className="hidden max-w-sm flex-col gap-6 lg:flex">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sb-primary text-white shadow-card">
          <Droplets className="h-6 w-6" />
        </span>
        <div>
          <p className="text-2xl font-bold text-sb-primary">SmartBlood</p>
          <p className="text-sm text-slate-500">MVP-прототип приложения</p>
        </div>
      </div>
      <p className="text-base leading-relaxed text-slate-600">
        Портативный анализатор крови: 6 показателей по капле 10&nbsp;мкл
        за&nbsp;5&nbsp;минут. Это интерактивный симулятор пользовательского
        пути — Bluetooth-подключение в MVP имитируется.
      </p>
      <ul className="flex flex-col gap-3 text-sm text-slate-700">
        {[
          "Глюкоза, холестерин, триглицериды, гемоглобин, мочевая кислота, СРБ",
          "Персональные рекомендации ИИ по каждому анализу",
          "История измерений и динамика показателей",
        ].map((item) => (
          <li key={item} className="flex items-start gap-2.5">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-sb-mint" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

/** Корпус телефона: на мобильных — во весь экран, на десктопе — макет устройства. */
export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-slate-100">
      <div className="mx-auto flex min-h-dvh max-w-6xl items-center justify-center gap-16 lg:px-10 lg:py-10">
        <BrandPanel />
        <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-sb-surface sm:h-[840px] sm:max-h-[94vh] sm:w-[400px] sm:rounded-[2.75rem] sm:border-[10px] sm:border-slate-900 sm:shadow-phone">
          <StatusBar />
          {children}
        </div>
      </div>
    </div>
  );
}
