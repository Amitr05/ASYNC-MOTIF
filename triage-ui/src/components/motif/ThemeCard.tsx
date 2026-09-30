"use client";

import SpotlightCard from "@/components/reactbits/SpotlightCard";
import { Button } from "@/components/ui/Button";
import { Lozenge, RiskLozenge, riskTone } from "@/components/ui/Lozenge";
import { cn } from "@/utils/cn";
import type { Theme } from "@/utils/types";

/*
 * ThemeCard — one discovered cluster in the triage queue.
 * Left rule = risk tier, body = AI synthesis, quote = ground-truth evidence in mono.
 */
const RULE: Record<string, string> = {
  critical: "bg-risk-critical",
  high: "bg-risk-high",
  low: "bg-sage",
};

export function ThemeCard({
  theme,
  selected,
  onSelect,
  onApprove,
  onReject,
  busy,
  rank,
}: {
  theme: Theme;
  selected?: boolean;
  onSelect?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  busy?: boolean;
  rank?: number;
}) {
  const tone = riskTone(theme.revenue_at_risk);
  const quote = theme.cited_quotes?.[0];
  const approved = theme.status === "approved";
  const rejected = theme.status === "rejected";

  return (
    <SpotlightCard
      spotlightColor={selected ? "rgba(30, 143, 213, 0.12)" : "rgba(12, 19, 16, 0.05)"}
      className={cn(
        "relative overflow-hidden rounded-md border bg-surface transition-colors duration-150 ease-standard",
        selected ? "border-accent" : "border-border hover:border-border-strong",
        (approved || rejected) && "opacity-80",
      )}
    >
      <div className="flex">
        <span aria-hidden className={cn("w-1 shrink-0", RULE[tone])} />
        <div className="min-w-0 flex-1 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              {rank !== undefined && (
                <span className="font-mono text-xs font-semibold tabular-nums text-text-subtlest">
                  {String(rank).padStart(2, "0")}
                </span>
              )}
              <button
                onClick={onSelect}
                className="truncate text-left text-sm font-bold text-text hover:text-accent-ink"
              >
                {theme.title}
              </button>
              <Lozenge tone="discovery" className="font-mono">
                CL-{String(theme.cluster_id).padStart(2, "0")}
              </Lozenge>
            </div>
            {approved ? (
              <Lozenge tone="success">Shipped</Lozenge>
            ) : rejected ? (
              <Lozenge tone="default">Rejected</Lozenge>
            ) : (
              <RiskLozenge revenue={theme.revenue_at_risk} accounts={theme.affected_accounts_count} />
            )}
          </div>

          <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-text-subtle">{theme.summary}</p>

          {quote && (
            <p className="mt-2.5 rounded-sm border border-border bg-surface-sunken px-3 py-2 font-mono text-xs leading-5 text-text">
              <span className="text-text-subtlest">“</span>
              {quote.quote_text.length > 148
                ? `${quote.quote_text.slice(0, 148)}…`
                : quote.quote_text}
              <span className="text-text-subtlest">”</span>
              <span className="mt-1 block font-sans text-[11px] text-text-subtlest">
                {[quote.customer_id, quote.customer_tier, quote.source_name]
                  .filter(Boolean)
                  .join(" · ") || "Customer"}
              </span>
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-subtlest">
            {theme.mention_count ? <span>{theme.mention_count} mentions</span> : null}
            {theme.source_count ? <span>{theme.source_count} sources</span> : null}
            <span className="flex items-center gap-1 text-success">
              <span aria-hidden>✓</span>
              {(theme.cited_quotes || []).length} quotes verbatim
            </span>
          </div>

          {!approved && !rejected && (
            <div className="mt-3.5 flex items-center gap-2">
              <Button variant="primary" size="sm" onClick={onApprove} loading={busy}>
                Approve &amp; ship
              </Button>
              <Button variant="secondary" size="sm" onClick={onSelect}>
                Review evidence
              </Button>
              <Button variant="subtle" size="sm" onClick={onReject} disabled={busy}>
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
}
