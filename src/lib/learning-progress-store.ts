"use client";

import { useMemo, useSyncExternalStore } from "react";

const storageKey = "aigrounds.learning.v1";
const changeEvent = "aigrounds-learning-changed";

export type LearningProgress = {
  visited: string[];
  reviewed: string[];
  transfers: Record<string, number>;
  testPasses: Record<string, number>;
  last?: { slug: string; path?: string };
};
const emptyProgress: LearningProgress = { visited: [], reviewed: [], transfers: {}, testPasses: {} };
let memorySnapshot = "";

export function readLearningProgress(raw: string, isKnownPath: (path: string) => boolean): LearningProgress {
  try {
    const value: unknown = JSON.parse(raw);
    if (!value || typeof value !== "object") return emptyProgress;
    const p = value as Record<string, unknown>;
    const slugs = (items: unknown) => Array.isArray(items)
      ? [...new Set(items.filter((item): item is string => typeof item === "string" && /^[a-z0-9-]+$/.test(item)))] : [];
    const transfers: Record<string, number> = {};
    if (p.transfers && typeof p.transfers === "object") {
      for (const [slug, time] of Object.entries(p.transfers)) {
        if (/^[a-z0-9-]+$/.test(slug) && typeof time === "number" && Number.isFinite(time) && time > 0) transfers[slug] = time;
      }
    }
    const testPasses: Record<string, number> = {};
    if (p.testPasses && typeof p.testPasses === "object") {
      for (const [slug, time] of Object.entries(p.testPasses)) {
        if (/^[a-z0-9-]+$/.test(slug) && typeof time === "number" && Number.isFinite(time) && time > 0) testPasses[slug] = time;
      }
    }
    const last = p.last && typeof p.last === "object" ? p.last as Record<string, unknown> : undefined;
    return { visited: slugs(p.visited), reviewed: slugs(p.reviewed), transfers, testPasses,
      last: typeof last?.slug === "string" && /^[a-z0-9-]+$/.test(last.slug)
        ? { slug: last.slug, path: typeof last.path === "string" && isKnownPath(last.path) ? last.path : undefined } : undefined };
  } catch { return emptyProgress; }
}
export function readSnapshot() {
  try { return window.localStorage.getItem(storageKey) ?? memorySnapshot; }
  catch { return memorySnapshot; }
}
function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(changeEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(changeEvent, onChange);
  };
}
export function useLearningProgress(learningPathIds: readonly string[]) {
  const snapshot = useSyncExternalStore(subscribe, readSnapshot, () => "");
  return useMemo(() => readLearningProgress(snapshot, path => learningPathIds.includes(path)), [learningPathIds, snapshot]);
}
export function writeSnapshot(serialized: string) {
  if (serialized === readSnapshot()) return;
  memorySnapshot = serialized;
  try { window.localStorage.setItem(storageKey, serialized); } catch { /* Session-only progress remains available. */ }
  window.dispatchEvent(new Event(changeEvent));
}
