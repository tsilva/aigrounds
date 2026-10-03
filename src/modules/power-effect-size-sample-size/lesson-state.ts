import type { PowerState } from "./power-engine";
export function powerBaseline(index = 0): PowerState { return { gap: index === 2 || index === 3 ? 2 : 1, size: index >= 1 && index <= 3 ? 100 : 25 }; }
export function reachedPower(index: number, s: PowerState) {
  if (index === 0) return s.gap === 1 && s.size === 100;
  if (index === 1) return s.gap === 2 && s.size === 100;
  if (index === 2) return s.gap === -2 && s.size === 100;
  if (index === 3) return s.gap === 0 && s.size === 100;
  return s.gap === -1.5 && s.size === 64;
}
