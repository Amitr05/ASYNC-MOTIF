import { cn } from "@/utils/cn";

/*
 * Surface — the 4 elevation planes, so pages never invent their own card.
 *   sunken  | wells, table stripes, code blocks
 *   default | the standard panel (1px border, no shadow)
 *   raised  | popovers, dropdowns
 *   overlay | modals
 */
export type SurfaceElevation = "sunken" | "default" | "raised" | "overlay";

const ELEVATIONS: Record<SurfaceElevation, string> = {
  sunken: "bg-surface-sunken border border-border",
  default: "bg-surface border border-border",
  raised: "bg-surface-raised border border-border shadow-raised",
  overlay: "bg-surface-overlay border border-border shadow-overlay",
};

export function Surface({
  children,
  elevation = "default",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { elevation?: SurfaceElevation }) {
  return (
    <div
      {...props}
      className={cn("rounded-md", ELEVATIONS[elevation], className)}
    >
      {children}
    </div>
  );
}

export function SectionHeader({
  title,
  description,
  actions,
  count,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  count?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5",
        className,
      )}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-bold tracking-tight text-text">{title}</h2>
          {count !== undefined && count !== null && (
            <span className="rounded-xs bg-surface-hover px-1.5 py-0.5 font-mono text-xs font-semibold tabular-nums text-text-subtle">
              {count}
            </span>
          )}
        </div>
        {description && (
          <p className="mt-0.5 text-xs leading-5 text-text-subtlest">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
