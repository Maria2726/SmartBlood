import { useId } from "react";
import type { MetricMeta } from "@/lib/smartblood/metrics";

export interface TrendPoint {
  /** Подпись по оси X, например «12.05» */
  label: string;
  value: number;
}

const W = 320;
const H = 150;
const PAD_X = 14;
const PAD_TOP = 16;
const PAD_BOTTOM = 26;

/**
 * Лёгкий SVG-график динамики (аналог fl_chart из Flutter-версии):
 * линия последних измерений + выделенная зона нормы.
 */
export function TrendChart({
  points,
  meta,
}: {
  points: TrendPoint[];
  meta: MetricMeta;
}) {
  const gradientId = useId();
  if (points.length < 2) return null;

  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOTTOM;
  const axisMin = meta.chartMin;
  const axisMax = meta.chartMax;

  const x = (index: number) =>
    PAD_X + (index / (points.length - 1)) * innerW;
  const y = (value: number) =>
    PAD_TOP + (1 - (value - axisMin) / (axisMax - axisMin)) * innerH;

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`)
    .join(" ");
  const area = `${line} L ${x(points.length - 1).toFixed(1)} ${H - PAD_BOTTOM} L ${PAD_X} ${H - PAD_BOTTOM} Z`;

  const last = points[points.length - 1];
  const lastX = x(points.length - 1);
  const lastY = y(last.value);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Динамика: ${meta.name}, последние ${points.length} измерений`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00C48C" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00C48C" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Зона нормы */}
      <rect
        x={PAD_X}
        y={y(meta.max)}
        width={innerW}
        height={Math.max(2, y(meta.min) - y(meta.max))}
        rx={6}
        className="fill-sb-mint/10"
      />

      <path d={area} fill={`url(#${gradientId})`} />
      <path
        d={line}
        fill="none"
        stroke="#0A2540"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {points.map((p, i) => (
        <circle
          key={`${p.label}-${i}`}
          cx={x(i)}
          cy={y(p.value)}
          r={i === points.length - 1 ? 5 : 3}
          className={
            i === points.length - 1
              ? "fill-sb-mint stroke-white"
              : "fill-white stroke-sb-primary"
          }
          strokeWidth={2}
        />
      ))}

      {/* Подпись последнего значения */}
      <text
        x={Math.min(lastX, W - 30)}
        y={Math.max(12, lastY - 12)}
        textAnchor="middle"
        className="fill-sb-primary text-[13px] font-bold"
      >
        {last.value.toFixed(meta.decimals).replace(".", ",")}
      </text>

      {/* Оси */}
      <text x={PAD_X} y={H - 8} className="fill-slate-400 text-[10px]">
        {points[0].label}
      </text>
      <text
        x={W - PAD_X}
        y={H - 8}
        textAnchor="end"
        className="fill-slate-400 text-[10px]"
      >
        {last.label}
      </text>
      <text
        x={W - PAD_X}
        y={PAD_TOP - 4}
        textAnchor="end"
        className="fill-slate-400 text-[10px]"
      >
        норма {meta.min.toFixed(meta.decimals).replace(".", ",")}–
        {meta.max.toFixed(meta.decimals).replace(".", ",")} {meta.unit}
      </text>
    </svg>
  );
}
