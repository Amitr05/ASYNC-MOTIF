"use client";

import { Tabs } from "@/components/ui/Tabs";
import { Lozenge } from "@/components/ui/Lozenge";
import { cn } from "@/utils/cn";

/*
 * AppShell — the 56px Atlas-style top bar + page frame.
 * One row: brand, primary nav, search, environment status, account.
 */
export type ShellTab = "overview" | "triage" | "sources" | "benchmarks";

export function AppShell({
  children,
  tab,
  onTabChange,
  apiOnline = true,
  pendingCount = 0,
  userEmail,
  className,
}: {
  children: React.ReactNode;
  tab: ShellTab;
  onTabChange: (tab: ShellTab) => void;
  apiOnline?: boolean;
  pendingCount?: number;
  userEmail?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-screen flex-col bg-surface-sunken", className)}>
      <header className="sticky top-0 z-30 border-b border-border bg-surface">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 items-center justify-center rounded-sm bg-brand text-sm font-black text-white">
              m
            </span>
            <span className="text-base font-bold tracking-tight text-text">Motif</span>
          </div>

          <nav className="min-w-0 flex-1 overflow-hidden">
            <Tabs<ShellTab>
              className="[&>button]:py-4"
              value={tab}
              onChange={onTabChange}
              items={[
                { id: "overview", label: "Overview" },
                { id: "triage", label: "Triage", count: pendingCount },
                { id: "sources", label: "Sources" },
                { id: "benchmarks", label: "Benchmarks" },
              ]}
            />
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <button className="flex h-8 items-center gap-2 rounded-sm border border-border bg-surface px-2.5 text-xs text-text-subtlest transition hover:bg-surface-hover">
              <span aria-hidden>⌕</span>
              <span>Search</span>
              <kbd className="rounded-xs border border-border px-1 font-mono text-[11px]">⌘K</kbd>
            </button>
          </div>

          <Lozenge tone={apiOnline ? "success" : "high"}>
            {apiOnline ? "API connected" : "Offline mode"}
          </Lozenge>

          <span
            className="hidden size-8 items-center justify-center rounded-full bg-discovery-subtle text-xs font-bold text-discovery sm:flex"
            title={userEmail}
          >
            {(userEmail || "pm").slice(0, 2).toUpperCase()}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 border-b border-border pb-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-xs font-semibold tracking-wide text-text-subtlest uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-text">{title}</h1>
        {description && (
          <p className="mt-1 max-w-3xl text-sm leading-6 text-text-subtle">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
