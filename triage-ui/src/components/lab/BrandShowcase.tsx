"use client";

import { Lozenge } from "@/components/ui/Lozenge";
import { MetricTile } from "@/components/ui/MetricTile";
import { SectionHeader, Surface } from "@/components/ui/Surface";

/*
 * Brand surface for the /design lab: the palette itself, and the ink-black
 * chrome variant where bright marine does its best work.
 */
const SWATCHES = [
  { name: "Sage", hex: "#9DAF8E", className: "bg-sage", note: "quiet neutral, low-risk tiers" },
  { name: "Sage tint", hex: "#F0F3EA", className: "bg-sage-tint", note: "metadata chips, wells" },
  { name: "Evergreen", hex: "#0F766E", className: "bg-evergreen", note: "brand — the one primary action" },
  { name: "Evergreen tint", hex: "#E3F1EE", className: "bg-evergreen-tint", note: "approval lozenges" },
  { name: "Ink", hex: "#0C1310", className: "bg-ink", note: "text, dark chrome" },
  { name: "Marine", hex: "#1E8FD5", className: "bg-marine", note: "AI themes, insight metrics, focus" },
  { name: "Marine ink", hex: "#0B5C93", className: "bg-marine-ink", note: "marine text on light surfaces" },
  { name: "Marine tint", hex: "#E8F3FC", className: "bg-marine-tint", note: "discovery lozenges" },
];

export function PaletteStrip() {
  return (
    <Surface className="overflow-hidden">
      <SectionHeader
        title="Palette"
        description="Sage · evergreen · ink black · bright marine (the US/Australian Open hard-court blue, #1E8FD5)."
      />
      <div className="grid grid-cols-2 gap-2.5 p-3 sm:grid-cols-4">
        {SWATCHES.map((swatch) => (
          <div key={swatch.name} className="overflow-hidden rounded-sm border border-border">
            <div className={`h-14 ${swatch.className}`} />
            <div className="bg-surface px-2.5 py-2">
              <p className="text-xs font-semibold text-text">{swatch.name}</p>
              <p className="font-mono text-[11px] text-text-subtlest">{swatch.hex}</p>
              <p className="mt-0.5 text-[11px] leading-4 text-text-subtlest">{swatch.note}</p>
            </div>
          </div>
        ))}
      </div>
    </Surface>
  );
}

export function InkBand() {
  return (
    <div className="overflow-hidden rounded-lg bg-ink">
      <div className="flex flex-col gap-4 border-b border-ink-border px-5 py-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs tracking-wider text-marine uppercase">
            Ink chrome variant
          </p>
          <h2 className="mt-1.5 max-w-xl text-2xl leading-8 font-bold tracking-tight text-on-ink">
            Your users already wrote the roadmap.
          </h2>
          <p className="mt-1.5 max-w-xl text-sm leading-6 text-on-ink/70">
            The same tokens, on ink black. Bright marine carries attention; evergreen still owns
            the single primary action.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Lozenge tone="marine">AI themes</Lozenge>
          <Lozenge tone="brand">Approved</Lozenge>
          <Lozenge tone="critical">$142,500 at risk</Lozenge>
        </div>
      </div>
      <div className="grid grid-cols-2 divide-ink-border *:text-on-ink lg:grid-cols-4 lg:divide-x">
        <MetricTile label="Revenue at risk" value={274500} prefix="$" tone="critical" />
        <MetricTile label="Precision @3" value={94.2} suffix="%" tone="accent" />
        <MetricTile label="Accepted as-is" value={85} suffix="%" />
        <MetricTile label="Citations verified" value={100} suffix="%" tone="success" />
      </div>
    </div>
  );
}
