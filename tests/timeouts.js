/**
 * Centralized Timeout Configuration
 *
 * All timeout values are env-driven so they can be adjusted without code changes.
 * Override via environment variables in .env or CI secrets:
 *
 *   TEST_TIMEOUT           — per-test timeout (default 120 s) — mirrors playwright.config.js
 *   TIMEOUT_XS             — very quick checks, e.g. isVisible with catch (default 3 s)
 *   TIMEOUT_SHORT          — quick element checks (default 5 s)
 *   TIMEOUT_MEDIUM         — normal card / element visibility (default 10 s)
 *   TIMEOUT_SEARCH         — search results, MS login redirect, waitForURL (default 15 s)
 *   TIMEOUT_ALERTS         — ADT alerts, risk card title visibility (default 20 s)
 *   TIMEOUT_LONG           — slow card loads, short waitForLoadState (default 30 s)
 *   TIMEOUT_NETWORK_IDLE   — waitForLoadState('networkidle') after patient load (default 45 s)
 *   TIMEOUT_DOM_LOAD       — waitForLoadState('domcontentloaded'), long networkidle (default 60 s)
 */

const env = (key, fallback) => parseInt(process.env[key]) || fallback;

export const TIMEOUTS = {
  /** Per-test timeout — mirrors TEST_TIMEOUT in playwright.config.js */
  test: env('TEST_TIMEOUT', 120_000),

  /** Very quick checks, e.g. isVisible({ timeout }) with .catch() */
  xs: env('TIMEOUT_XS', 3_000),

  /** Quick element checks (element should already be in the DOM) */
  short: env('TIMEOUT_SHORT', 5_000),

  /** Normal card / element visibility */
  medium: env('TIMEOUT_MEDIUM', 10_000),

  /** Search results, MS login redirect, short waitForURL */
  search: env('TIMEOUT_SEARCH', 15_000),

  /** ADT alerts, risk card title, modal year-selector visibility */
  alerts: env('TIMEOUT_ALERTS', 20_000),

  /** Slow card loads, short waitForLoadState('domcontentloaded') */
  long: env('TIMEOUT_LONG', 30_000),

  /** waitForLoadState('networkidle') after patient load */
  networkIdle: env('TIMEOUT_NETWORK_IDLE', 45_000),

  /** waitForLoadState('domcontentloaded') on initial load, long networkidle */
  domLoad: env('TIMEOUT_DOM_LOAD', 60_000),
};
