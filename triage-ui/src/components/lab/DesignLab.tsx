"use client";

import { useMemo, useState } from "react";
import AnimatedContent from "@/components/reactbits/AnimatedContent";
import BlurText from "@/components/reactbits/BlurText";
import { AppShell, PageHeader, type ShellTab } from "@/components/motif/AppShell";
import { Inspector } from "@/components/motif/Inspector";
import { ThemeCard } from "@/components/motif/ThemeCard";
import { Button } from "@/components/ui/Button";
import { Lozenge } from "@/components/ui/Lozenge";
import { MetricTile } from "@/components/ui/MetricTile";
import { SectionHeader, Surface } from "@/components/ui/Surface";
import type { EvalMetrics, Theme } from "@/utils/types";

/*
 * /design — the Calm Ops reference surface.
 * Mock data only, no API calls: this page exists so the whole team can see and
 * review the target look (Atlassian-dense, React Bits motion) before the real
 * screens are migrated in Phases 2–4. Everything here comes from src/components/ui
 * and src/components/reactbits, so migrating a real screen is composition, not redesign.
 */

const THEMES: Theme[] = [
  {
    id: "t1",
    cluster_id: 4,
    title: "Enterprise SAML/SSO login failure loop",
    summary:
      "Customers on SAML SSO are locked out after the Monday identity-provider rotation. Sessions are rejected before MFA completes and retrying loops back to the login screen, so admins cannot reach any workspace content.",
    revenue_at_risk: 142500,
    affected_accounts_count: 3,
    status: "pending_review",
    mention_count: 14,
    source_count: 3,
    cited_quotes: [
      {
        quote_text:
          "We literally cannot log in since Monday. Our whole ops team is locked out and we are evaluating alternatives.",
        customer_id: "Acme Corp",
        customer_tier: "Enterprise",
        arr_value: 90000,
        source_name: "Support email",
      },
      {
        quote_text:
          "SSO redirects to the IdP, returns, and then bounces me straight back to the login page with no error.",
        customer_id: "Globex",
        customer_tier: "Enterprise",
        arr_value: 52500,
        source_name: "Call transcript",
      },
      {
        quote_text: "Our admins cannot export anything because nobody can complete sign-in.",
        customer_id: "Initech",
        customer_tier: "Business",
        arr_value: 18000,
        source_name: "App Store review",
      },
    ],
  },
  {
    id: "t2",
    cluster_id: 7,
    title: "Silent export timeout on datasets over 50k rows",
    summary:
      "Scheduled and manual CSV exports over ~50k rows hang at 90% and fail at the 60-second gateway timeout without an error surfaced to the user or a retry, which blocks finance close.",
    revenue_at_risk: 86000,
    affected_accounts_count: 2,
    status: "pending_review",
    mention_count: 9,
    source_count: 2,
    cited_quotes: [
      {
        quote_text:
          "The export spinners run forever and time out at 60 seconds. Our finance team's quarterly close is blocked.",
        customer_id: "Halcyon Bank",
        customer_tier: "Enterprise",
        arr_value: 60000,
        source_name: "Support email",
      },
    ],
  },
  {
    id: "t3",
    cluster_id: 11,
    title: "Android 14 background crash on app resume",
    summary:
      "After the OS upgrade, the Android client crashes in the background when the device is unlocked, losing unsaved work. Volume is high across individual plan users but ARR impact is low.",
    revenue_at_risk: 12000,
    affected_accounts_count: 42,
    status: "pending_review",
    mention_count: 42,
    source_count: 1,
    cited_quotes: [
      {
        quote_text: "App crashes immediately on phone unlock after the Android 14 update.",
        customer_id: "Individual plan",
        customer_tier: "Free",
        arr_value: 0,
        source_name: "App Store review",
      },
    ],
  },
  {
    id: "t4",
    cluster_id: 2,
    title: "Offline edits overwrite each other on reconnect",
    summary:
      "Two teammates editing the same record offline silently overwrite each other on reconnect with no conflict prompt or version history entry.",
    revenue_at_risk: 34000,
    affected_accounts_count: 1,
    status: "approved",
    github_issue_url: "https://github.com/acme/product/issues/142",
    github_issue_number: 142,
    mention_count: 6,
    source_count: 2,
    prd_markdown: `# Offline conflict detection

## Problem
Two teammates editing one record offline overwrite each other silently on reconnect.

## Acceptance criteria
\`\`\`gherkin
Given two devices edit the same record while offline
When both reconnect
Then the second sync must surface a conflict prompt
And both versions must be retrievable from version history
\`\`\`

## Evidence
- "We lost a day of edits when two reps synced the same account." — Norhtwind, $34,000 ARR`,
    cited_quotes: [
      {
        quote_text:
          "We lost a day of edits because two reps synced the same account from the field and one overwrote the other.",
        customer_id: "Northwind",
        customer_tier: "Business",
        arr_value: 34000,
        source_name: "Interview notes",
      },
    ],
  },
];

const CONNECTORS = [
  { name: "Slack", detail: "#product-feedback", status: "active" as const, count: 812 },
  { name: "Notion", detail: "Discovery database", status: "active" as const, count: 164 },
  { name: "Google Drive", detail: "Research / interviews", status: "syncing" as const, count: 57 },
  { name: "GitHub", detail: "acme/product", status: "active" as const, count: 12 },
];

const METRICS: EvalMetrics = {
  project_id: null,
  precision_at_3: 94.2,
  target_precision_at_3: 90,
  ground_truth_top_3: [],
  top_3_breakdown: [],
  acceptance_rate: 85,
  target_acceptance_rate: 70,
  pm_decisions_count: 27,
  citation_validity: 100,
  target_citation_validity: 100,
  verified_quotes_count: 96,
  total_quotes_count: 96,
  total_feedback_items: 300,
  total_themes_discovered: 12,
  approved_themes_count: 9,
  rejected_themes_count: 3,
  pending_themes_count: 3,
  total_revenue_at_risk: 274500,
};

export default function DesignLab() {
  const [tab, setTab] = useState<ShellTab>("triage");
  const [themes, setThemes] = useState<Theme[]>(THEMES);
  const [selectedId, setSelectedId] = useState<string>(THEMES[0].id);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [dark, setDark] = useState(false);

  const queue = useMemo(
    () =>
      [...themes].sort((a, b) => {
        const order = (theme: Theme) => (theme.status === "pending_review" ? 0 : 1);
        return order(a) - order(b) || b.revenue_at_risk - a.revenue_at_risk;
      }),
    [themes],
  );
  const selected = themes.find((theme) => theme.id === selectedId) || null;
  const pending = themes.filter((theme) => theme.status === "pending_review").length;

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
  };

  const approve = (theme: Theme) => {
    setBusyId(theme.id);
    // Stand-in for POST /api/v1/themes/{id}/approve — the lab never calls the API.
    setTimeout(() => {
      setThemes((current) =>
        current.map((item) =>
          item.id === theme.id
            ? {
                ...item,
                status: "approved",
                github_issue_number: 143,
                github_issue_url: "https://github.com/acme/product/issues/143",
              }
            : item,
        ),
      );
      setBusyId(null);
    }, 900);
  };

  return (
    <AppShell
      tab={tab}
      onTabChange={setTab}
      apiOnline={false}
      pendingCount={pending}
      userEmail="pm@motif.dev"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <BlurText
          text="Your users already wrote the roadmap."
          animateBy="words"
          delay={55}
          className="text-sm font-medium text-text-subtlest"
        />
        <div className="flex items-center gap-2">
          <Lozenge tone="info">Design lab · mock data</Lozenge>
          <Button variant="secondary" size="sm" onClick={toggleTheme}>
            {dark ? "Light" : "Dark"} theme
          </Button>
        </div>
      </div>

      <PageHeader
        eyebrow="Phase 1 · reference surface"
        title="Triage queue"
        description="Themes ranked by revenue at risk. Every claim carries a verbatim source quote; nothing ships without a human approval."
        actions={
          <>
            <Button variant="secondary" size="md">
              Add sources
            </Button>
            <Button variant="primary" size="md">
              Run analysis
            </Button>
          </>
        }
      />

      {/* KPI band — the metric type scale, counting up once on mount */}
      <Surface className="mb-5 grid grid-cols-2 divide-border lg:grid-cols-4 lg:divide-x">
        <MetricTile
          label="Revenue at risk"
          value={METRICS.total_revenue_at_risk}
          prefix="$"
          tone="critical"
          hint="Sum of unique accounts, counted once"
        />
        <MetricTile
          label="Precision @3"
          value={METRICS.precision_at_3}
          suffix="%"
          target={METRICS.target_precision_at_3}
          hint="vs. hand-labelled ground truth"
        />
        <MetricTile
          label="Accepted as-is"
          value={METRICS.acceptance_rate}
          suffix="%"
          target={METRICS.target_acceptance_rate}
          hint={`${METRICS.pm_decisions_count} PM decisions`}
        />
        <MetricTile
          label="Citations verified"
          value={METRICS.citation_validity}
          suffix="%"
          target={METRICS.target_citation_validity}
          tone="success"
          hint={`${METRICS.verified_quotes_count}/${METRICS.total_quotes_count} quotes verbatim`}
        />
      </Surface>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
        {/* Queue */}
        <div className="min-w-0">
          <Surface className="overflow-hidden">
            <SectionHeader
              title="Discovered themes"
              count={queue.length}
              description="HDBSCAN clusters, labelled by the LLM, ranked by revenue at risk — never by mention count."
              actions={
                <>
                  <Lozenge tone="default">All sources</Lozenge>
                  <Lozenge tone="default">Any ARR</Lozenge>
                </>
              }
            />
            <div className="space-y-2.5 p-3">
              {queue.map((theme, index) => (
                <AnimatedContent
                  key={theme.id}
                  distance={16}
                  duration={0.45}
                  delay={index * 0.06}
                  threshold={0.05}
                  initialOpacity={0}
                >
                  <ThemeCard
                    theme={theme}
                    rank={index + 1}
                    selected={theme.id === selectedId}
                    onSelect={() => setSelectedId(theme.id)}
                    onApprove={() => approve(theme)}
                    onReject={() =>
                      setThemes((current) =>
                        current.map((item) =>
                          item.id === theme.id ? { ...item, status: "rejected" } : item,
                        ),
                      )
                    }
                    busy={busyId === theme.id}
                  />
                </AnimatedContent>
              ))}
            </div>
          </Surface>
        </div>

        {/* Inspector rail */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Inspector
            theme={selected}
            busy={busyId === selected?.id}
            onApprove={() => selected && approve(selected)}
            onReject={() =>
              selected &&
              setThemes((current) =>
                current.map((item) =>
                  item.id === selected.id ? { ...item, status: "rejected" } : item,
                ),
              )
            }
          />
        </aside>
      </div>

      {/* Connectors */}
      <Surface className="mt-5 overflow-hidden">
        <SectionHeader
          title="Sources & connectors"
          description="Opt-in scopes only — private DMs and unselected folders are rejected at ingestion (Rules.md §1.5)."
        />
        <div className="grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-2 lg:grid-cols-4">
          {CONNECTORS.map((connector, index) => (
            <AnimatedContent
              key={connector.name}
              distance={12}
              duration={0.4}
              delay={index * 0.05}
              threshold={0.05}
              initialOpacity={0}
            >
              <div className="flex items-center justify-between rounded-sm border border-border bg-surface p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text">{connector.name}</p>
                  <p className="truncate text-xs text-text-subtlest">{connector.detail}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Lozenge tone={connector.status === "active" ? "success" : "info"}>
                    {connector.status}
                  </Lozenge>
                  <span className="font-mono text-[11px] tabular-nums text-text-subtlest">
                    {connector.count} items
                  </span>
                </div>
              </div>
            </AnimatedContent>
          ))}
        </div>
      </Surface>

      <p className="mt-5 text-xs leading-5 text-text-subtlest">
        React Bits components live in <code className="font-mono">src/components/reactbits/</code>{" "}
        (SpotlightCard, CountUp, BlurText, AnimatedContent — MIT + Commons Clause, © 2026 David
        Haz) and the primitives in <code className="font-mono">src/components/ui/</code>. Plan and
        component mapping: <code className="font-mono">docs/ui/UI-REDESIGN-PLAN.md</code>.
      </p>
    </AppShell>
  );
}
