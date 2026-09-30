#!/usr/bin/env node
/*
 * Contrast audit for the Motif design tokens.
 *
 * The palette lives in src/app/globals.css, so this script parses it directly and
 * checks the real token pairs in both themes, mirroring the CSS cascade
 * (aliases such as --brand: var(--evergreen) resolve against the dark overrides).
 *
 * Usage: npm run check:contrast      (exits 1 when any pair is below target)
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(here, "..", "src", "app", "globals.css"), "utf8");

const blockOf = (selector) => {
  const match = css.match(new RegExp(`${selector.replace(/[[\]"]/g, "\\$&")}\\s*\\{([\\s\\S]*?)\\n\\}`));
  return match ? match[1] : "";
};
const tokensOf = (text) =>
  Object.fromEntries([...text.matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));

const base = tokensOf(blockOf(":root"));
const dark = { ...base, ...tokensOf(blockOf('[data-theme="dark"]')) };

const resolve = (tokens, name, depth = 0) => {
  const value = tokens[name] ?? "#000000";
  const alias = /^var\(--([a-z0-9-]+)\)$/.exec(value);
  return alias && depth < 6 ? resolve(tokens, alias[1], depth + 1) : value;
};

const luminance = (hex) => {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const channel = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const ratio = (a, b) => {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

/** [label, foreground token, background token, minimum WCAG ratio] */
const PAIRS = [
  ["body text / page", "text", "surface-sunken", 4.5],
  ["body text / card", "text", "surface", 4.5],
  ["secondary text / card", "text-subtle", "surface", 4.5],
  ["metadata / card", "text-subtlest", "surface", 4.5],
  ["primary button label", "on-brand", "brand", 4.5],
  ["label on marine surface", "on-accent", "accent", 4.5],
  ["brand text / tint", "brand", "brand-subtle", 4.5],
  ["marine text / tint", "accent-ink", "accent-subtle", 4.5],
  ["marine accent (large text & icons)", "accent", "surface", 3],
  ["sage chip", "sage-ink", "sage-tint", 4.5],
  ["ink chrome text", "on-ink", "ink", 4.5],
  ["risk critical", "risk-critical", "risk-critical-subtle", 4.5],
  ["risk high", "risk-high", "risk-high-subtle", 4.5],
  ["risk low", "risk-low", "risk-low-subtle", 4.5],
  ["success", "success", "success-subtle", 4.5],
  ["info", "info", "info-subtle", 4.5],
  ["discovery", "discovery", "discovery-subtle", 4.5],
];

let failures = 0;
for (const [themeName, tokens] of [
  ["LIGHT", base],
  ["DARK", dark],
]) {
  console.log(`\n${themeName}`);
  for (const [label, fg, bg, min] of PAIRS) {
    const f = resolve(tokens, fg);
    const b = resolve(tokens, bg);
    const value = ratio(f, b);
    const ok = value >= min;
    if (!ok) failures += 1;
    console.log(
      `  ${ok ? "pass" : "FAIL"}  ${label.padEnd(32)} ${f} on ${b}  ${value.toFixed(2)}:1 (min ${min})`,
    );
  }
}

console.log(
  failures === 0
    ? `\nAll ${PAIRS.length * 2} token pairs meet their WCAG target.`
    : `\n${failures} pair(s) below target.`,
);
process.exit(failures === 0 ? 0 : 1);
