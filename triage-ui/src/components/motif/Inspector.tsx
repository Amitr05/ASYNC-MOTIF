"use client";

import { EvidenceQuote } from "@/components/motif/EvidenceQuote";
import { Button } from "@/components/ui/Button";
import { Lozenge, RiskLozenge } from "@/components/ui/Lozenge";
import { Surface } from "@/components/ui/Surface";
import type { Theme } from "@/utils/types";

/*
 * Inspector — the evidence + PRD rail next to the queue. Sticky, never a modal:
 * a PM compares themes side by side, so the decision controls must not cover the list.
 */
export function Inspector({
  theme,
  onApprove,
  onReject,
  busy,
}: {
  theme: Theme | null;
  onApprove?: () => void;
  onReject?: () => void;
  busy?: boolean;
}) {
  if (!theme) {
    return (
      <Surface className="p-6 text-center">
        <p className="text-sm font-semibold text-text">Select a theme</p>
        <p className="mt-1 text-xs leading-5 text-text-subtlest">
          Pick a theme from the queue to inspect its verified quotes, provenance and generated PRD.
        </p>
      </Surface>
    );
  }

  const quotes = theme.cited_quotes || [];

  return (
    <div className="space-y-3">
      <Surface className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Lozenge tone="discovery" className="font-mono">
                CL-{String(theme.cluster_id).padStart(2, "0")}
              </Lozenge>
              <span className="text-xs text-text-subtlest">Discovered theme</span>
            </div>
            <h2 className="mt-2 text-lg leading-6 font-bold tracking-tight text-text">
              {theme.title}
            </h2>
          </div>
          {theme.status === "approved" ? <Lozenge tone="success">Shipped</Lozenge> : null}
        </div>

        <p className="mt-2 text-sm leading-6 text-text-subtle">{theme.summary}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <RiskLozenge revenue={theme.revenue_at_risk} accounts={theme.affected_accounts_count} />
          {theme.mention_count ? <Lozenge tone="default">{theme.mention_count} mentions</Lozenge> : null}
          {theme.source_count ? <Lozenge tone="default">{theme.source_count} sources</Lozenge> : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <Button
            variant="primary"
            size="sm"
            onClick={onApprove}
            loading={busy}
            disabled={theme.status === "approved"}
          >
            {theme.github_issue_url ? "Re-ship to GitHub" : "Approve & create GitHub issue"}
          </Button>
          <Button variant="subtle" size="sm" onClick={onReject} disabled={busy}>
            Reject
          </Button>
        </div>
      </Surface>

      <Surface>
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <h3 className="text-sm font-bold text-text">Evidence</h3>
          <span className="flex items-center gap-1 text-xs font-semibold text-success">
            <span aria-hidden>✓</span> 100% verbatim verified
          </span>
        </div>
        <div className="space-y-2 p-3">
          {quotes.length ? (
            quotes.map((quote, index) => (
              <EvidenceQuote
                key={index}
                index={index}
                quote={quote.quote_text}
                customer={quote.customer_id}
                tier={quote.customer_tier}
                arr={quote.arr_value}
                source={quote.source_name}
              />
            ))
          ) : (
            <p className="px-1 py-2 text-xs text-text-subtlest">
              No quotes were attached to this theme.
            </p>
          )}
        </div>
      </Surface>

      {theme.prd_markdown ? (
        <Surface>
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <h3 className="text-sm font-bold text-text">Generated PRD</h3>
            <Button variant="link" size="sm">
              Copy markdown
            </Button>
          </div>
          <pre className="max-h-72 overflow-auto p-4 font-mono text-xs leading-5 whitespace-pre-wrap text-text-subtle">
            {theme.prd_markdown}
          </pre>
        </Surface>
      ) : null}
    </div>
  );
}
