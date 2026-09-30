import { cn } from "@/utils/cn";

/*
 * Lozenge — the atomic unit of Motif's status language (Atlassian ADS pattern).
 * Status is always: coloured, uppercase, small, readable at 12px minimum.
 */
export type LozengeTone =
  | "default"
  | "brand"
  | "info"
  | "success"
  | "discovery"
  | "critical"
  | "high"
  | "low";

const TONES: Record<LozengeTone, string> = {
  default: "bg-surface-hover text-text-subtle",
  brand: "bg-brand-subtle text-brand",
  info: "bg-info-subtle text-info",
  success: "bg-success-subtle text-success",
  discovery: "bg-discovery-subtle text-discovery",
  critical: "bg-risk-critical-subtle text-risk-critical",
  high: "bg-risk-high-subtle text-risk-high",
  low: "bg-risk-low-subtle text-risk-low",
};

export function Lozenge({
  children,
  tone = "default",
  className,
}: {
  children: React.ReactNode;
  tone?: LozengeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-xs px-1.5 py-0.5 text-xs font-bold uppercase tracking-wide whitespace-nowrap",
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Revenue-at-risk tiers are used identically everywhere, so they live here. */
export function riskTone(revenue: number): LozengeTone {
  if (revenue >= 50000) return "critical";
  if (revenue >= 10000) return "high";
  return "low";
}

export function RiskLozenge({
  revenue,
  accounts,
  className,
}: {
  revenue: number;
  accounts?: number;
  className?: string;
}) {
  if (revenue <= 0) return null;
  return (
    <Lozenge tone={riskTone(revenue)} className={className}>
      <span className="font-mono tabular-nums">${revenue.toLocaleString()}</span>
      <span className="font-sans font-medium normal-case">
        at risk{accounts ? ` · ${accounts} ${accounts === 1 ? "account" : "accounts"}` : ""}
      </span>
    </Lozenge>
  );
}
