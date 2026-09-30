# Motif UI Redesign Plan — "Calm Ops"
> Target look: **Atlassian.com / Jira-grade enterprise calm**. Motion source: **React Bits**. Art-direction reference: **Realevate (Awwwards SOTD)**.
> Scope: `triage-ui/` (Next.js 16 + React 19 + Tailwind 4). Backend and pipeline are untouched.
> Status: **Phase 0 + Phase 1 proof shipped in this branch** (design tokens, primitives, a live component lab). Phases 2–5 are planned below.

---

## 0. TL;DR — the three decisions

| Question | Answer |
| :--- | :--- |
| **Do we move from Next.js to plain React?** | **No.** Next.js 16 *is* React 19. Every React Bits component is an ordinary client component (`'use client'` + `motion`/`gsap`) and works unmodified in the App Router. Moving to Vite/React Router would cost us the `/api/v1/*` rewrite proxy, font optimisation, route-level code splitting and the dev-server preview — and buy us nothing. Details in [§7](#7-stack-decision-stay-on-nextjs-16). |
| **What does "look like Atlassian" mean concretely?** | Their *structure*, not their colours. Light, calm, dense, token-driven enterprise UI: one reserved brand colour for the single primary action, neutral surfaces, a Lozenge for every status, an 8px rhythm, a metric type scale for numbers, and typography that never drops below 12px. Motif's palette is its own — **sage, evergreen, ink black and bright marine**. Full token set in [§5](#5-design-language-v2--calm-ops). |
| **Where does React Bits fit?** | A **curated 12-component shortlist**, not all 210. Each component is copy-pasted from the React Bits registry (their own CLI format) into `src/components/reactbits/` with attribution. Only 4 are client-heavy; the rest are dropped, with reasons, in [§6](#6-react-bits--the-shortlist). Realevate-style scroll choreography is deliberately **rejected** for the product UI ([§4.3](#43-realevateagency--what-to-borrow-and-what-to-refuse)). |

---

## 1. Product recap — what the UI is actually for

Motif is a feedback-to-backlog pipeline: ingest reviews/emails/transcripts → embed → HDBSCAN clusters → LLM labels with **verbatim verified quotes** → rank by **revenue at risk** → a PM approves in a **triage cockpit** → a PRD becomes a **GitHub issue**.

Three design consequences, and they drive every decision below:

1. **This is a judgement surface, not a content site.** The PM decides under uncertainty. Hierarchy must make *"how much money is at risk, on what evidence, and what happens if I click"* readable in one glance.
2. **Evidence must outrank synthesis visually.** AI summary = sans-serif prose. Customer quote / ARR / cluster ID / Gherkin = monospace. That is a product principle (Rules.md §1.1), not styling.
3. **Demo-day legibility.** Metrics (P@3, acceptance rate, latency, citation validity) are judged live on a projector. Numbers need their own type scale and their own reserved band — exactly what Atlassian calls the *metric scale*.

---

## 2. Audit of the current UI

**Files:** `src/app/page.tsx` (596 lines, one client component: every screen, modal, flow, Web Speech recorder and localStorage sync), `src/app/login/page.tsx` (78), `src/components/Connectors.tsx` (202), `src/utils/*`.

| # | Problem | Evidence in code | Impact |
| :-- | :--- | :--- | :--- |
| 1 | **No design system.** Colours are hardcoded arbitrary values (`bg-[#0f766e]`, `text-slate-400`) scattered across JSX | `page.tsx` passim | Any restyle is a find-replace; contrast and hierarchy drift |
| 2 | **Design.md lies.** The spec mandates dark slate `#0B0F17` + indigo `#3B82F6` + JetBrains Mono; the build ships light grey `#f4f6f8` + emerald `#0f766e` | `Design.md` vs `globals.css` | Nobody can trust the spec; review debates restart every time |
| 3 | **Type is too small.** Micro-labels at `text-[10px]` / `text-[11px]` carry real information (ARR, accounts, status) | `page.tsx` 470–560 | Fails on a projector; below comfortable reading size; a11y issue |
| 4 | **Everything is a card, so nothing is.** Sources, roadmap map, queue, metrics are all white `rounded-2xl border` boxes with equal weight | `page.tsx` 471–590 | No visual hierarchy — the eye has nowhere to land |
| 5 | **Modal-only review.** Evidence, edit and approve all live inside one modal | `reviewTheme` modals | Cannot compare themes side-by-side, which is the actual PM job |
| 6 | **Duplicated layout paths** (`roadmapSection` rendered twice, demo vs project) | lines 497 & 576 | Divergence bugs |
| 7 | **No motion system and no state feedback.** Buttons have `disabled:opacity-50` and nothing else; pipeline progress is one thin bar | `progressPanel` | The "AI is working" moment — the demo's wow — reads as a browser loading bar |
| 8 | **Accessibility gaps.** `modal-backdrop` divs have no `role="dialog"`, `aria-modal`, focus trap or Escape handler; icon-only buttons lack labels; `slate-400` on white ≈ 2.6:1 | `globals.css`, `page.tsx` | Ships keyboard/screen-reader traps |
| 9 | **No pre-auth surface.** `login/page.tsx` is the only unauthenticated page | routing | Nothing sells the product before sign-in; no place for the Atlassian-style hero |
| 10 | **No dark mode, no skeletons, no empty-state kit** | — | Offline/degraded states look broken rather than intentional |

**What is already good and must survive the redesign:** the plain-language error copy, offline-first localStorage behaviour, the pipeline progress *stages* (`embedding → clustering → labelling → saving`), the "your users already wrote the roadmap" line, and the strict no-GitHub-token honesty banner.

---

## 3. Reference teardown: Atlassian.com (the target)

Atlassian's product design system (ADS) and their marketing site share one visual DNA. Facts we build on:

- **Colour:** one reserved brand blue — `Blue700 #1868DB` is the live `color.background.brand.bold`; `#0052CC` is the legacy AUI blue. Neutrals do the work: `#FFFFFF` surface, `#F7F8F9` subtle, `#DCDFE4` borders, `#172B4D` primary text, `#44546F` secondary. Status: green `#22A06B`, yellow `#B38600`, red `#CA3521`, purple `#6E5DC6`, teal `#1D7F8C`. [source](https://designmd.app/brands/atlassian/)
- **Typography:** product UI uses **Atlassian Sans / Atlassian Mono**; marketing uses the gated brand face **Charlie Sans**. Neither is publicly downloadable — so we substitute and document it ([§5.2](#52-typography)).
- **Type scale:** heading `32/28/24/20/16/14/12` (Bold) + a **separate metric scale** (`28/24/16` Bold) for dashboard numbers. Body `16/14/12` Regular. This is the single most copyable idea for Motif. [source](https://atlassian.design/foundations/typography)
- **Components:** Lozenge (status), Flag (low-interaction confirmation), Banner (top-of-screen), Badge (numeric tally). Reserved blue for the *single* primary action per view.
- **Layout:** 8px grid (`space.025 … space.1000`), four-plane elevation (sunken / default / raised / overlay), t-shirt radii.
- **Site structure we mirror for the marketing page:** hero + product claim → logo/social-proof marquee → "collections" cards → tabbed product sections → metric band → CTA → dense footer.

**Take:** tokens, metric scale, lozenges, 8px rhythm, one-primary-action rule, calm light surfaces, dense tables.
**Drop:** their colour values. Atlassian's blue stays theirs; Motif runs sage / evergreen / ink / marine ([§5.1](#51-colour-tokens--sage--evergreen--ink--marine)).
**Don't take:** their information architecture (a Motif workspace is not a Jira dashboard), their nav (we have two levels, not six), their marketing gradients.

---

## 4. Reference teardown: React Bits + Realevate

### 4.1 React Bits — how we consume it (verified against the live registry)

React Bits is **copy-paste / registry distribution**, not an npm library: [installation docs](https://reactbits.dev/get-started/installation). Two supported paths — manual copy, or the CLI (`npx jsrepo add …`). Every component is published as a shadcn-style registry entry at `public/r/<Name>-<TS|JS>-<TW|CSS>.json`, which is exactly what we pulled to vendor ours, so the code in `triage-ui/src/components/reactbits/` is byte-identical to the site's "Code" tab for the **TypeScript + Tailwind** variant.

- **License:** *MIT + Commons Clause License Condition v1.0*, © 2026 David Haz — the clause explicitly permits use **"as part of an application, website, or product"** and forbids reselling the components themselves. Attribution header is written into every vendored file and the README disclosure section is updated ([§9.3](#93-licensing--disclosure)).
- **Runtime deps:** per-component — `motion@^12.23.12` (BlurText, CountUp), `gsap@^3.13.0` (AnimatedContent, ScrollReveal…), and `ogl`/`three` for the heavier backgrounds. **Installed so far:** `motion`, `gsap`.
- **Categories:** Animations, Backgrounds, Components, Text Animations, Micro (all confirmed live).

### 4.2 Realevate.agency — the art-direction reference

Verified facts: Awwwards **Site of the Day (27 Sep 2026)**, Developer Award, built with **Node.js + GSAP + JavaScript**, tagged *Animation, Microinteractions, Fullscreen*. Documented elements: **loader**, **page transition between selection cards**, **horizontal navigation menus**, **scroll-driven selection page**, **full-bleed hero media**, **contact-page video**. [source](https://www.awwwards.com/sites/realevate) [GSAP collection](https://www.awwwards.com/websites/gsap/)

Its effect stack is a *cinematic narrative*: preload a counter to 100, land on a full-bleed image with one huge headline, scroll through 4 "collection" cards that morph into detail pages, animate every navigation as a horizontal slide.

**Borrow the craft, not the choreography:**
| Realevate move | Verdict for Motif | What we do instead |
| :--- | :--- | :--- |
| Preloader counter (`0123456789`) | ✅ transform | **Pipeline progress**: real stage-aware counter for `embedding → clustering → labelling → saving`, replacing the 1px bar |
| Card → detail page transition | ✅ transform | Theme card → **side inspector** that slides/anchor-expands; no route change, no lost scroll position |
| Horizontal full-bleed nav | ⚠️ partial | Keep the tab strip, make the **active indicator glide** (`LineSidebar`-style underline), never full-screen menus |
| Scroll-hijacked storytelling | ❌ refuse | A PM scans 12 themes; hijacked scroll is hostile. Native scroll + `AnimatedContent` reveals only |
| Full-screen imagery / WebGL everywhere | ❌ refuse in app | WebGL is allowed on the **landing page** only, lazily loaded, behind `prefers-reduced-motion` and a static fallback |
| Microinteraction polish | ✅ adopt | Hover spotlight, 120–200ms state transitions, spring-y approve confirmation, `GlareHover` on cards |

---

## 5. Design language v2 — "Calm Ops"

A single source of truth replaces both `Design.md` §2 and the ad-hoc classes. Implemented as Tailwind 4 `@theme` tokens in `src/app/globals.css` (no `tailwind.config.ts` needed in v4).

### 5.1 Colour tokens — sage · evergreen · ink · marine

Four families, no more. Structure and density follow Atlassian; the colours are Motif's.

| Family | Light | Role |
| :--- | :--- | :--- |
| **Evergreen** (existing brand) | `#0F766E` · hover `#0C655D` · tint `#E3F1EE` | **The one primary action per view** (`Approve & ship`, `Run analysis`), links to shipped issues, brand mark |
| **Marine** (US/Australian Open hard-court blue) | `#1E8FD5` · hover `#1877B4` · text-safe `#0B5C93` · tint `#E8F3FC` | The *intelligence* accent: discovered-theme pills, P@3/insight metrics, pipeline progress, focus rings, charts. Bright marine is a large-text/icon/fill colour (3.53:1 on white) — its `-ink` variant carries body-size text |
| **Sage** | `#9DAF8E` · text-safe `#5F7157` · tint `#F0F3EA` | Quiet neutral: low-risk tiers, sync/metadata chips, wells, selection |
| **Ink black** | `#0C1310` · raised `#161F1A` · border `#242E28` · on-ink `#FFFFFF` | Body text, and the optional **ink chrome** bar for demo/landing surfaces |
| Surfaces | `#FFFFFF` / sunken `#F6F8F2` (sage-tinted paper) / hover `#EEF2E7` | 4 elevation planes: sunken, default, raised, overlay |
| Lines | `#DCE3D3` · strong `#BFC9B2` | 1px hairlines, input borders |
| Text | `#0C1310` · subtle `#48544A` · subtlest `#6C7A6E` | Headings/body, secondary, metadata (all ≥ 4.5:1 on white) |
| Revenue-at-risk | critical `#BE3A2B` / `#FBE9E7` · high `#8A5F10` / `#FAF1DC` · low sage `#5F7157` / `#F0F3EA` | ≥$50k, $10k–50k, below |
| Verified / neutral | success sea-green `#1F6B41` / `#E7F3EA` · info sage · discovery marine | 100% verbatim citations, sync state, AI themes |

**Where marine earns its place:** the test of a good accent is that it is never decorative. Marine marks every place where *the machine inferred something* — the cluster pill (`CL-04`), the P@3 metric, the pipeline stepper, the AI-generated PRD block — while evergreen stays reserved for the human decision to ship. That split is the palette's whole argument.

**Two rules**
1. **Evergreen = decision, marine = inference.** Never swap them; never use both in one component's primary action.
2. **Large vs small text.** Marine and sage are fills/large-text colours; for body-size coloured text use `--accent-ink`, `--sage-ink`, `--brand` (evergreen), all of which clear 4.5:1.

**Filled-surface labels flip in dark mode.** `--on-brand` / `--on-accent` / `--on-ink` exist because in dark mode the greens and marine are *light*, so buttons take ink-black labels (`#0B100D`, 7.38:1) instead of white (which would be 2.60:1). Never hardcode `text-white` on a coloured fill.

**Dark mode** is a full token override (`[data-theme="dark"]`): surfaces `#0B100D` / `#070A08`, text `#E9EFE8`, evergreen `#35B39C`, marine `#4FA9E8`, sage `#8FA37F`, ink chrome stays dark (`#141C16`) because it is a surface, not a text colour. Default remains **light**.

**Audited, not eyeballed.** `npm run check:contrast` parses `globals.css`, mirrors the CSS cascade and fails the build script if any of the 34 token pairs (17 pairs × 2 themes) drops below its WCAG target — including the filled-button and risk-lozenge combinations that usually break.

### 5.2 Typography

| Role | Face | Size / weight |
| :--- | :--- | :--- |
| UI sans | **Inter** (substitute for Atlassian Sans — not publicly licensed) via `next/font` | heading 24/20/16 Bold; body 14/13 Regular; label 12 Medium |
| Mono | **JetBrains Mono** via `next/font` | quotes 13, ARR/metrics 13 SemiBold, IDs 12 |
| Marketing display (landing only) | Inter Tight 700, `-0.02em` | 40/56/72 |

**Hard floor: 12px.** Every `text-[10px]` and `text-[11px]` in the current build is promoted to `text-xs` (12px) or `text-sm` (14px) with `text-text-subtle`. Metric numbers get their own scale (`text-3xl font-bold tabular-nums`), matching ADS's "big numbers get their own scale".

### 5.3 Space, radius, elevation, focus

- **8px rhythm:** `2 4 6 8 12 16 20 24 32 40` — every gap/padding comes from it (density without clutter).
- **Radii:** `3px` (lozenge/checkbox), `6px` (buttons/inputs), `8px` (cards), `12px` (panels), `999px` (pills only).
- **Elevation:** 4 planes — `sunken` (wells, table stripes), `default` (cards, 1px border, no shadow), `raised` (dropdowns/popovers, `0 4px 8px -2px rgba(9,30,66,.25)`), `overlay` (modals + scrim `rgba(9,30,66,.54)`).
- **Focus:** visible 2px `--color-brand` ring with 2px offset on every interactive element (keyboard-first, required by the demo's "no mouse" moments).

### 5.4 Motion spec

| Token | Value | Used for |
| :--- | :--- | :--- |
| `--motion-fast` | 120ms `cubic-bezier(.2,0,0,1)` | hover, focus, lozenge state |
| `--motion-base` | 200ms | dropdowns, inspector slide, tab indicator |
| `--motion-slow` | 320ms `power3.out` (GSAP) | card reveal, panel expand |
| Stagger | 40ms, cap 8 items | list entrance (`AnimatedContent`) |
| Numbers | spring, 1.2s | `CountUp` for KPI/metrics only |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` → all transitions 1ms, GSAP/`motion` components render final state | accessibility |

**Rule of three:** only three things animate in the product UI — (1) *state change* (approve/reject/sync), (2) *arrival of new data* (themes appearing after a run), (3) *focus* (spotlight/glow on hover). Everything else is static. If an animation does not communicate one of those, it is deleted.

---

## 6. React Bits — the shortlist

Pulled from the live index ([all components](https://reactbits.dev/get-started/index)); *Deps* = extra runtime dependency.

### ✅ Vendored now (Phase 0/1, live in the lab)
| Component | URL | Deps | Where it goes |
| :--- | :--- | :--- | :--- |
| **SpotlightCard** | [c/components/spotlight-card](https://reactbits.dev/c/components/spotlight-card) | — | Every theme card: cursor-tracked radial highlight = "focus" motion, zero layout cost |
| **CountUp** | [c/text-animations/count-up](https://reactbits.dev/c/text-animations/count-up) | `motion` | Revenue-at-risk KPI, P@3, latency, citations |
| **BlurText** | [c/text-animations/blur-text](https://reactbits.dev/c/text-animations/blur-text) | `motion` | Page/panel titles — the one place text animation is allowed |
| **AnimatedContent** | [c/animations/animated-content](https://reactbits.dev/c/animations/animated-content) | `gsap` | Staggered entrance of the triage queue, connector list, metrics tiles |

### 🎯 Next up per surface (Phase 2–4)
| Surface | React Bits component(s) | Why |
| :--- | :--- | :--- |
| App shell nav | [Pill Nav](https://reactbits.dev/c/components/pill-nav) or [Glass Surface](https://reactbits.dev/c/components/glass-surface) + [Line Sidebar](https://reactbits.dev/c/components/line-sidebar) | Gliding active indicator, sticky translucent header that still reads on white |
| Triage queue | [Magic Bento](https://reactbits.dev/c/components/magic-bento), [Border Glow](https://reactbits.dev/c/components/border-glow) | Bento layout for the "top 3 themes by revenue at risk"; glow border reserved for the critical-risk card |
| Approve / shipping | [Specular Button](https://reactbits.dev/c/components/specular-button) + [Click Spark](https://reactbits.dev/c/animations/click-spark) | One specular primary ("Approve & ship"); spark is the *only* celebratory feedback, and it fires on the GitHub issue actually returning |
| Pipeline run | [Stepper](https://reactbits.dev/c/components/stepper) + [Counter](https://reactbits.dev/c/components/counter) | Replaces the 1px progress bar with 4 real stages + elapsed seconds |
| Evidence inspector | [Scroll Stack](https://reactbits.dev/c/components/scroll-stack), [Gradual Blur](https://reactbits.dev/c/animations/gradual-blur) | Quotes stack as verifiable cards; blur fades long evidence lists instead of a hard cut |
| Connectors grid | [Glass Icons](https://reactbits.dev/c/components/glass-icons), [Chroma Grid](https://reactbits.dev/c/components/chroma-grid) | Provider tiles (Slack/Notion/Drive/GitHub) with sync state |
| Metrics / benchmark band | CountUp + [Animated List](https://reactbits.dev/c/components/animated-list) | Demo-day KPI band + live decision feed |
| Onboarding / empty states | [Folder](https://reactbits.dev/c/components/folder), [Animated List](https://reactbits.dev/c/components/animated-list) | "Drop a folder" affordance that reads instantly |
| Landing page (public) | [Aurora](https://reactbits.dev/c/backgrounds/aurora) *or* [Dot Field](https://reactbits.dev/c/backgrounds/dot-field) (lazy, light), [Shiny Text](https://reactbits.dev/c/text-animations/shiny-text), [Scroll Reveal](https://reactbits.dev/c/text-animations/scroll-reveal), [Marquee-free logo row](https://reactbits.dev/c/components/circular-gallery) | The Atlassian-marketing moment: calm hero, one animated accent, product screenshots |
| Login | [Tilted Card](https://reactbits.dev/c/components/tilted-card) / static panel | Keep auth boring and fast |

### ❌ Explicitly rejected
[Antigravity](https://reactbits.dev/c/animations/antigravity), [Ballpit](https://reactbits.dev/c/backgrounds/ballpit), [Balatro](https://reactbits.dev/c/backgrounds/balatro), [Faulty Terminal](https://reactbits.dev/c/backgrounds/faulty-terminal), [Glitch Text](https://reactbits.dev/c/text-animations/glitch-text), [Decrypted Text](https://reactbits.dev/c/text-animations/decrypted-text) — playful/chaotic; they fight a revenue-risk narrative and cost bundle size + GPU. Reconsider only for the demo's loading screen, if at all.

---

## 7. Stack decision: stay on Next.js 16

**Recommendation: do not migrate.** Concretely:

| Factor | Next.js 16 (current) | Vite + React Router (proposed migration) |
| :--- | :--- | :--- |
| React Bits compatibility | Identical — components are `'use client'` + `motion`/`gsap` | Identical |
| Backend access | `rewrites()` already proxies `/api/v1/*` → FastAPI with 10-min timeout & 30 MB body limits (`next.config.ts`) | Must hand-roll a dev proxy plugin; lose prod-proxy parity |
| Fonts / images | `next/font` (self-hosted, zero CLS), `next/image` | Manual |
| Routing | File-based + nested layouts (needed for the app shell) | React Router config, more code |
| First paint | RSC shell streams immediately | Client-only SPA, blank until JS parses |
| Existing work | 3 routes, Supabase auth, localStorage sync | All rewritten |
| Cost | **0** | ~1 day of hackathon time, with new bugs, zero user-visible gain |

**When plain React would win:** a purely static brochure site, a no-backend widget, or a team that wants Vite's instant HMR and nothing else. None apply. The only "React-y" addition we need is a **component library** — and that is React Bits + our own primitives, both framework-agnostic.

> Also decided: **do not install `@atlaskit/*`.** It is a product-UI kit with its own theming runtime, CSS-in-JS and heavy peer tree; we replicate the tokens we need in Tailwind in ~120 lines, which keeps the bundle small and the visual language ours.

---

## 8. Screen-by-screen redesign

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│ ◉ Motif   [Overview] [Triage •7] [Sources] [Benchmarks]      ⌘K   ●API  A▾      │  ← 56px app bar, brand blue = only primary
├──────────────────────────────────────────────────────────────────────────────────┤
│ Roadmap signal                    Run analysis ▸  Review 3 themes ▸               │  ← page header: title (BlurText), 1 primary + 1 link
│ $238,400 at risk · 21 accounts · last run 48s                                     │
├─────────────────────────────┬────────────────────────────────────────────────────┤
│ KPI band (CountUp)          │                                                    │
│ [ARR at risk][P@3][Accept][Cites]                                                 │
├─────────────────────────────┬────────────────────────────────────────────────────┤
│ TRIAGE QUEUE (sorted)       │  INSPECTOR (sticky, 420px)                          │
│ ☰ #CL-04 SAML login loop    │  Theme #CL-04 · Revenue at risk $142,500            │
│   ▲ $142,500 · 3 accounts   │  ── Evidence (3 quotes, 100% verified ✓) ──         │
│   "we literally cannot…"    │  │ "We literally cannot log in since Monday"        │
│   [Approve & ship] [Reject] │  │  Acme Corp · $90k ARR · App Store               │
│ ☰ #CL-07 Export timeouts    │  ── PRD preview (Gherkin, mono) ──                  │
│   ▲ $86,000 · 2 accounts    │  │ Given a SAML-configured workspace…              │
└─────────────────────────────┴────────────────────────────────────────────────────┘
```

**Phase 2 — Triage (the money screen).** Two-pane layout, no modal for review. Left: queue sorted by revenue at risk, each item a `SpotlightCard` with a left risk rule, cluster pill, ARR, accounts, top quote in mono, and two actions (`Approve & ship` primary *only on the focused card*; `Reject` quiet). Right: sticky inspector with three stacked sections — **Evidence** (verified quotes + provenance), **Synthesis** (AI summary, cluster cohesion), **PRD** (Gherkin in mono, copy button). Approve becomes a state transition *in place* (lozenge → Approved, GitHub link, decision appended to the audit feed) instead of opening another modal.

**Phase 3 — Sources & connectors.** Replace the stacked card with a two-column workspace: left = source table (name, kind, passages, sync lozenge, remove), right = connector tiles + "add sources" dropzone. Upload becomes a real queue with per-file status rows (`Animated List`) and honest failure copy that already exists.

**Phase 3b — Pipeline run.** `Stepper` with the four real stages, elapsed seconds counter, and a live line of what the model is doing; on completion the new theme cards stagger in and the revenue band counts up. Cancellable.

**Phase 4 — Benchmarks + landing.** Benchmark band (P@3, acceptance, latency, citations) with targets as quiet deltas; then a public landing page (Atlassian structure, Realevate restraint) so the project can be understood before login.

**Phase 5 — Polish.** Dark mode, keyboard shortcuts (`j/k` queue nav, `a` approve, `⌘K` command palette), skeletons for every async region, screenshot-based visual regression of `/design`, README/Design.md rewrite, a11y sweep.

---

## 9. Execution plan

### 9.1 Phases, effort, acceptance
| Phase | Work | Effort | Done when |
| :--- | :--- | :--- | :--- |
| **P0 — Tokens & shell** ✅ | `globals.css` token layer (sage/evergreen/ink/marine, light + dark), self-hosted Inter + JetBrains Mono, primitives glue, legacy classes preserved, `npm run check:contrast` | 3h | App still runs; no hardcoded hex in new code; contrast audit passes |
| **P1 — Primitives + lab** ✅ | `components/ui/*` (Lozenge, Button, Surface, MetricTile, SectionHeader, Tabs), `components/reactbits/*` (4 vendored), `/design` lab with dark-mode toggle | 4h | `/design` renders the full Calm Ops language with mock data; `npm run build` clean |
| **P2 — Triage board** | Two-pane queue + inspector, in-place approve/reject, `Magic Bento` top-3, `Stepper` run panel | 6–8h | A theme can be reviewed, edited, approved and shipped **without opening a modal**; keyboard-navigable |
| **P3 — Sources & connectors** | Source table, upload queue, connector tiles with sync lozenges | 4h | All existing flows (upload/folder/meeting/Drive/Notion/Slack/GitHub) preserved |
| **P4 — Benchmarks + landing** | KPI band with targets, decision feed, public landing page (lazy WebGL background) | 5h | Landing scores ≥95 Lighthouse perf; benchmark numbers readable from 3m away |
| **P5 — Polish & docs** | Dark mode, shortcuts, skeletons, a11y sweep, rewrite `Design.md`, visual regression | 4h | Zero `text-[10px]`; axe-core clean on the 4 main routes |

### 9.2 Implementation rules
1. **One primitive per intent.** If two buttons differ, they differ by *variant*, never by inline classes.
2. **`'use client'` at the leaf.** React Bits components are client-only; wrap them in server-rendered shells so pages stay RSC where possible.
3. **Lazy anything with a canvas.** `dynamic(() => import(...), { ssr: false })` + IntersectionObserver; no WebGL above the fold in the app.
4. **Budget:** ≤ 180 kB first-load JS on `/`, `motion` + `gsap` together ≤ 75 kB gzipped, and no route > 1 animated background.
5. **Respect `prefers-reduced-motion`** for every GSAP/`motion` component (`AnimatedContent` and `BlurText` already short-circuit; verify per component).
6. **Never animate layout properties**; transform/opacity only.
7. **Copy stays honest** — the emerald/amber "no GitHub token" banner is a feature; restyle it as an Atlassian Flag, do not delete it.

### 9.3 Licensing & disclosure
- Add to README §14: React Bits components (MIT + Commons Clause, © 2026 David Haz) vendored from `reactbits.dev` registry; `motion` (MIT); `gsap` (standard "no charge" license — free for this use, no commercial plugin used). Attribution headers live in each vendored file.

### 9.4 Risks
| Risk | Likelihood | Mitigation |
| :--- | :--- | :--- |
| `motion`/`gsap` bloat the initial bundle | Med | Import from `motion/react` at leaf components; dynamic-import canvas backgrounds; measure with `npm run build` route table |
| Next 16 + GSAP ScrollTrigger SSR issues | Med | `'use client'` + `useEffect`-only registration (already the pattern in vendored files); test `npm run build` not just `dev` |
| Redesign breaks the demo the day before judging | Med | Phases are additive; `page.tsx` keeps working until P2 lands behind the new shell; `/design` is the reference surface |
| Light theme conflicts with the existing dark `Design.md` | High | Flagged in §5.1 — rewrite the doc in P5; dark mode shipped as a toggle so neither lobby loses |
| Atlassian Sans unavailable | Certain | Documented substitution (Inter / JetBrains Mono); never ship the real brand faces without a license |
| Cookie-cutter "React Bits site" look | Med | Rule of three (§5.4) + max one effect per surface; the layout is Atlassian-dense, the motion is the garnish |

---

## 10. What we are NOT doing
- No migration away from Next.js (§7).
- No `@atlaskit/*`, no Jira-clone chrome, no Atlassian brand fonts/assets.
- No scroll hijacking, no full-screen preloader gate, no WebGL in the product UI, no sound, no confetti.
- No UI framework swap, no server-side rendering strategy change, no backend/API edits.
- No deleting existing behaviour for the sake of looks: offline mode, Web Speech capture, localStorage sync, audit-log honesty all stay.

---

## 11. Open questions for the team
1. **Light or dark as the product default?** Plan assumes light (Atlassian look) with a dark toggle. `Design.md` currently says dark.
2. **Is there a public landing page?** Currently only `/login` exists pre-auth. Atlassian's site implies one; it costs ~5h (P4).
3. **Do we keep the "demo benchmark workspace" pinned in the sidebar** as a first-class nav item, or fold it into the project switcher?
4. **Demo-day screen:** if it is a projector, we should raise the base font size one step globally (body 15px) — cheap, decided in P5.
