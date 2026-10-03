import type { TestingState } from "./testing-engine";
export function testingBaseline(index = 0): TestingState {
  return { difference: index === 1 || index === 3 ? 2.5 : index === 2 ? 1 : 0, size: 25, alpha: 5 };
}
export function reachedTesting(index: number, s: TestingState) {
  if (index === 0) return s.difference === 2.5 && s.size === 25 && s.alpha === 5;
  if (index === 1) return s.difference === 2.5 && s.size === 25 && s.alpha === 1;
  if (index === 2) return s.difference === 1 && s.size === 400 && s.alpha === 5;
  if (index === 3) return s.difference === -2.5 && s.size === 25 && s.alpha === 5;
  return s.difference === -1.5 && s.size === 100 && s.alpha === 1;
}
