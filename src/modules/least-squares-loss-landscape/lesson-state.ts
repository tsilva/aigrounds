import { landscapePreset, type LandscapeState } from "./landscape-engine";
export function landscapeBaseline(index = 0): LandscapeState { return landscapePreset(index === 1 ? "balanced" : index === 2 ? "other" : "far"); }
export function reachedLandscape(index: number, s: LandscapeState) {
  if (index === 0) return s.slope === .4 && s.intercept === 2.8;
  if (index === 1) return s.slope === 1.2 && s.intercept === 1.2;
  if (index === 2) return s.slope === .8 && s.intercept === 2;
  return s.slope === .5 && s.intercept === 2.6;
}
