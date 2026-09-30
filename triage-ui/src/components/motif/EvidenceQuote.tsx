import { Lozenge } from "@/components/ui/Lozenge";

/*
 * EvidenceQuote — ground truth. Always monospace, always attributed.
 * This is the visual guarantee behind Rules.md §1.1 (zero hallucination).
 */
export function EvidenceQuote({
  quote,
  customer,
  tier,
  arr,
  source,
  index,
}: {
  quote: string;
  customer?: string | null;
  tier?: string | null;
  arr?: number;
  source?: string | null;
  index?: number;
}) {
  return (
    <figure className="rounded-sm border border-border bg-surface-sunken p-3">
      <blockquote className="font-mono text-xs leading-5 text-text">
        <span className="text-text-subtlest">“</span>
        {quote}
        <span className="text-text-subtlest">”</span>
      </blockquote>
      <figcaption className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-subtlest">
        {index !== undefined && <span className="font-mono">[{String(index + 1).padStart(2, "0")}]</span>}
        {customer && <span className="font-medium text-text-subtle">{customer}</span>}
        {tier && <Lozenge tone="default">{tier}</Lozenge>}
        {arr !== undefined && arr > 0 && (
          <span className="font-mono tabular-nums">${arr.toLocaleString()} ARR</span>
        )}
        {source && <span>{source}</span>}
      </figcaption>
    </figure>
  );
}
