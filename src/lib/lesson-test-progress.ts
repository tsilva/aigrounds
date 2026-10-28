"use client";

import { useMemo, useSyncExternalStore } from "react";
import { parseTestHistory, type TestBank, type TestHistory } from "./lesson-test";

const eventName = "aigrounds-test-changed";
const memory = new Map<string, string>();
const sessionOnly = new Set<string>();
const keyFor = (bank: TestBank) => `aigrounds.test.${bank.slug}.v${bank.version}`;
function read(key: string) {
  if (memory.has(key)) return memory.get(key)!;
  try { return window.localStorage.getItem(key) ?? ""; }
  catch { sessionOnly.add(key); return ""; }
}
function subscribe(key: string, notify: () => void) {
  function changed(event: StorageEvent) {
    if (event.key === key || event.key === null) { memory.delete(key); notify(); }
  }
  window.addEventListener("storage", changed);
  window.addEventListener(eventName, notify);
  return () => { window.removeEventListener("storage", changed); window.removeEventListener(eventName, notify); };
}
export function updateTestProgress(bank: TestBank, change: (history: TestHistory) => TestHistory) {
  const key = keyFor(bank);
  const serialized = JSON.stringify(change(parseTestHistory(read(key), bank)));
  memory.set(key, serialized);
  try { window.localStorage.setItem(key, serialized); sessionOnly.delete(key); }
  catch { sessionOnly.add(key); }
  window.dispatchEvent(new Event(eventName));
}
export function useTestProgress(bank: TestBank) {
  const key = keyFor(bank);
  const raw = useSyncExternalStore(notify => subscribe(key, notify), () => read(key), () => "");
  const history = useMemo(() => parseTestHistory(raw, bank), [raw, bank]);
  return { history, sessionOnly: sessionOnly.has(key) };
}
