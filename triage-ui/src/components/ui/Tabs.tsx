"use client";

import { cn } from "@/utils/cn";

/*
 * Tabs — a calm top-level nav with a gliding indicator (the useful half of
 * React Bits' LineSidebar, without the full-screen menu).
 */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: { id: T; label: string; count?: number }[];
  value: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div role="tablist" className={cn("flex items-stretch gap-1 overflow-x-auto", className)}>
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors duration-150 ease-standard",
              active
                ? "text-brand"
                : "text-text-subtle hover:bg-surface-hover hover:text-text",
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  "rounded-xs px-1 py-0.5 font-mono text-[11px] font-semibold tabular-nums",
                  active ? "bg-brand-subtle text-brand" : "bg-surface-hover text-text-subtlest",
                )}
              >
                {item.count}
              </span>
            )}
            {active && (
              <span
                aria-hidden
                className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
