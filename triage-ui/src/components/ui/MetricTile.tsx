"use client";

import CountUp from "@/components/reactbits/CountUp";
import { cn } from "@/utils/cn";

/*
 * MetricTile — dashboard numbers get their own type scale (Atlassian's "Metric"
 * style): big, bold, tabular. The value counts up once when it scrolls into view.
 */
export function MetricTile({
  label,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  hint,
  target,
  tone = "default",
  animate = true,
  className,
}: {
  label: string;
  value: number | null;
  prefix?: string;
  suffix?: string;
  /** Used by the static (no-animation) fallback only. */
  decimals?: number;
  hint?: React.ReactNode;
  /** Benchmark target; when given, the tile shows whether we meet it. */
  target?: number;
  tone?: "default" | "brand" | "accent" | "success" | "critical";
  animate?: boolean;
  className?: string;
}) {
  const meetsTarget = value !== null && target !== undefined && value >= target;
  const valueTone =
    tone === "critical"
      ? "text-risk-critical"
      : tone === "success"
        ? "text-success"
        : tone === "accent"
          ? "text-accent-ink"
          : tone === "brand"
            ? "text-brand"
            : "text-text";

  return (
    <div className={cn("px-4 py-3.5", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold tracking-wide text-text-subtle uppercase">
          {label}
        </span>
        {target !== undefined && value !== null && (
          <span
            className={cn(
              "rounded-xs px-1 py-0.5 font-mono text-[11px] font-semibold tabular-nums",
              meetsTarget
                ? "bg-success-subtle text-success"
                : "bg-risk-high-subtle text-risk-high",
            )}
          >
            {meetsTarget ? "meets" : "below"} {prefix}
            {target}
            {suffix}
          </span>
        )}
      </div>
      <div className={cn("mt-1.5 flex items-baseline text-3xl leading-none font-bold tracking-tight tabular-nums", valueTone)}>
        {value === null ? (
          <span className="text-text-subtlest">—</span>
        ) : (
          <>
            {prefix && <span>{prefix}</span>}
            {animate ? (
              <CountUp to={value} from={0} duration={1.2} separator="," />
            ) : (
              <span>
                {value.toLocaleString(undefined, {
                  minimumFractionDigits: decimals,
                  maximumFractionDigits: decimals,
                })}
              </span>
            )}
            {suffix && <span>{suffix}</span>}
          </>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-text-subtlest">{hint}</p>}
    </div>
  );
}
