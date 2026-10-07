/**
 * Backend connection config. One place to flip from mock to real backend.
 *
 * - Local/demo: leave NEXT_PUBLIC_QILA_API_URL empty. getApi() returns mock.
 * - Backend ready: set NEXT_PUBLIC_QILA_API_URL to the backend origin,
 *   e.g. https://api.qilapay.example, and implement the endpoints in
 *   architecture.md. getApi() returns the HTTP client.
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_QILA_API_URL?.replace(/\/$/, "") ?? "";

export const USE_MOCK_API = API_BASE_URL.length === 0;

/** localStorage keys used ONLY by the mock adapter. */
export const MOCK_KEYS = {
  session: "qila_session",
  account: "qila_account",
  transfers: "qila_transfers",
  day: "qila_day",
} as const;
