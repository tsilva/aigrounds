import { initialSearchState, searchTransition, type SearchState, type SearchTransition } from "./mcts-engine";
import type { SearchProblemId } from "./scenario";
export type MctsState = { search: SearchState; c: number; budget: number; problem: SearchProblemId; last: SearchTransition | null; running: boolean };
export function mctsBaseline(index = 0): MctsState {
  const state: MctsState = { search: initialSearchState, c: index === 2 || index === 3 ? 2.5 : 1.4, budget: index === 3 || index === 4 ? 66 : 65, problem: "tic-tac-toe", last: null, running: false };
  if (index === 1) state.c = 2.5;
  if (index === 3) { const last = searchTransition(state.search, state.c); return { ...state, search: last.after, last }; }
  return state;
}
export function advanceMcts(state: MctsState): MctsState {
  if (state.search.rootVisits >= state.budget) return { ...state, running: false };
  const last = searchTransition(state.search, state.c);
  return { ...state, search: last.after, last, running: state.running && last.after.rootVisits < state.budget };
}
export function reachedMcts(index: number, s: MctsState) {
  if (s.running) return false;
  if (index === 0) return s.c === 1.4 && s.search.stepIndex === 1 && s.last?.branch === "d4";
  if (index === 1) return s.c === .1 && s.search.stepIndex === 0;
  if (index === 2) return s.c === 2.5 && s.search.stepIndex === 1 && s.last?.branch === "d4" && s.last.result;
  if (index === 3) return s.c === 2.5 && s.search.stepIndex === 2 && s.last?.branch === "d4" && !s.last.result;
  if (index === 4) return s.budget === 66 && s.search.rootVisits === 66 && s.search.stepIndex === 2;
  return s.problem === "grid-route" && s.c === .1 && s.budget === 66 && s.search.stepIndex === 2 && s.last?.branch === "a1";
}
