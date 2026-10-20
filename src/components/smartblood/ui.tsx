import { cn } from "@/lib/utils";
import type { MetricStatus } from "@/lib/smartblood/metrics";

const STATUS_LABEL: Record<MetricStatus, string> = {
  normal: "Норма",
  high: "Выше нормы",
  low: "Ниже нормы",
};

const STATUS_CLASS: Record<MetricStatus, string> = {
  normal: "bg-sb-mint/10 text-emerald-600",
  high: "bg-sb-error/10 text-sb-error",
  low: "bg-sb-primary/10 text-sb-primary",
};

const DOT_CLASS: Record<MetricStatus, string> = {
  normal: "bg-sb-mint",
  high: "bg-sb-error",
  low: "bg-sb-primary",
};

export function StatusPill({
  status,
  className,
}: {
  status: MetricStatus;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        STATUS_CLASS[status],
        className,
      )}
    >
      <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", DOT_CLASS[status])} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function StatusDot({ status }: { status: MetricStatus }) {
  return <span className={cn("h-2 w-2 rounded-full", DOT_CLASS[status])} />;
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </h2>
  );
}

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-100 bg-white p-4 shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}
