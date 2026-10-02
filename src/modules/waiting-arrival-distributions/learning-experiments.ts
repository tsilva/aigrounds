import { arrivalScenarios } from "./scenario";
import type { ArrivalScenarioId } from "./waiting-arrival-distributions-engine";
export type ArrivalState = { scenario: ArrivalScenarioId; p: number; window: number };
export const arrivalDefaults: ArrivalState = { scenario: "website", p: .02, window: 5 };
export const arrivalExperiments = [
  {
    title: "More chance, shorter wait", baseline: arrivalDefaults, target: { ...arrivalDefaults, p: .04 },
    question: "Raise Event chance per second from 2% to 4%. What happens to mean wait?",
    predictions: [{ id: "half", label: "It halves" }, { id: "double", label: "It doubles" }, { id: "fixed", label: "It stays fixed" }], correctPrediction: "half",
    action: "Set Event chance per second (%) to 4. Press Enter to apply the exact edit.",
    explanation: "Why did waits shorten while expected counts grew?",
    explanations: [{ id: "rate", label: "Mean wait is 1/p: 50 → 25 seconds. Expected count is 300p: 6 → 12 events." }, { id: "certain", label: "The next event is guaranteed exactly 25 seconds from now." }, { id: "probability", label: "Twelve expected events means a 12% chance of any event." }], correctExplanation: "rate",
    retry: "An average wait is not a schedule. Counts and probabilities have different units; compare the waiting tail and count bars.",
    takeaway: "Doubling the per-second chance halves mean wait and doubles expected count in the same window. The chance of waiting over 60 seconds falls from about 29.76% to 8.64%; individual waits still vary.",
  },
  {
    title: "More time, more counts", baseline: arrivalDefaults, target: { ...arrivalDefaults, window: 10 },
    question: "At 2% per second, increase Window from 5 to 10 minutes. Does the first-event waiting distribution change?",
    predictions: [{ id: "no", label: "No, the per-second chance stays fixed" }, { id: "half", label: "Yes, mean wait halves" }, { id: "double", label: "Yes, mean wait doubles" }], correctPrediction: "no",
    action: "Set Window (minutes) to 10. Keep Event chance per second (%) at 2.",
    explanation: "Which change comes from observing twice as long?",
    explanations: [{ id: "count", label: "Expected count doubles to 12. Mean wait remains 50 seconds and every waiting bar is unchanged." }, { id: "rate", label: "The event rate doubles because the window doubles." }, { id: "fixed", label: "A ten-minute window must contain exactly 12 events." }], correctExplanation: "count",
    retry: "Window changes the number of ticks counted, not their chance. A longer window changes count probabilities, not the first-event law.",
    takeaway: "Rate stays 1.2 events/minute; rate × time doubles from 6 to 12 expected events. Waiting time depends on p alone. In the optional fixed-seed sample, a longer window keeps earlier events and adds later ticks.",
  },
  {
    title: "When a shortcut is close", baseline: arrivalDefaults, target: { scenario: "defects", p: .001, window: 1 } as ArrivalState,
    question: "Switch from Website Visits to Rare Defects: 0.1% per second for one minute. Will expected count be a close estimate of the chance of at least one event?",
    predictions: [{ id: "close", label: "Yes, the expected count is small" }, { id: "exact", label: "Yes, expected count is always exactly that probability" }, { id: "never", label: "No, it can never approximate a probability" }], correctPrediction: "close",
    action: "Choose Rare Defects in the scenario toolbar.",
    explanation: "How do the three at-least-one estimates fit together?",
    explanations: [{ id: "approx", label: "Expected count is 0.06. The 6% shortcut is close to the exact tick probability ≈ 5.83% and Poisson approximation ≈ 5.82%, but neither shortcut is exact for ticks." }, { id: "clip", label: "Expected count is always a probability if we clip values above one." }, { id: "guarantee", label: "The 1,000-second mean guarantees no event in the first minute." }], correctExplanation: "approx",
    retry: "Small expected count makes multiple events unlikely. The linear shortcut is still an approximation; mean wait never guarantees a particular wait.",
    takeaway: "Rare Defects gives mean wait 1,000 seconds and about 94.17% chance of waiting over 60 seconds. The shortcut 0.06 = 6% is close because expected count is small. Rare p supports Poisson count approximation; small rate × time supports the separate linear probability shortcut.",
  },
];
export const arrivalTutorPlan = {
  intro: "Three predict–try–explain experiments separate waiting times, window counts and two distinct approximations, followed by a new-window transfer check.",
  whyItMatters: "Waiting and count models help reason about traffic, support capacity and rare-event risk without confusing expected counts with probabilities.",
  openingMessage: "You need independent Bernoulli trials, complementary probabilities and expected counts. This lesson assumes independent one-second ticks, each with the same event chance p and at most one event. A geometric distribution describes the number of ticks until the first event, counting the successful tick: possible waits are 1, 2, 3, … seconds. Mean wait 1/p is an average, not a guaranteed arrival time. Rate λ = 60p events/minute; expected count μ = 60 × Window × p. μ can exceed one because it is a count, not a probability.\n\nThe count bars show a Poisson approximation to this tick model, appropriate when per-tick p is small. Its at-least-one formula 1 − exp(−μ) is exact for Poisson, but approximate for our ticks. The exact tick probability is 1 − (1 − p)^(60 × Window). The separate linear shortcut μ estimates at-least-one probability only when μ is much smaller than one; values above one are explicitly invalid probabilities, never clipped. The 9+ bar pools all counts nine and above, so it is not a single most likely count. Waiting bars partition 1–10, 11–20, …, 51–60 and >60 seconds on a fixed 0–100% scale. Numeric labels provide the same data.\n\nUse Website Visits, Support Tickets or Rare Defects to load their stated parameters. Event chance per second (%) ranges from 0.1 to 10 in 0.1-point steps; Window (minutes) from 1 to 10. Both have native sliders and exact number editors: press Enter or leave the field to apply. Choosing a prediction restores that experiment’s starting parameters. Reset restarts the current experiment. First predict what doubling p from 2% to 4% does to mean wait, then edit and explain. Follow Next experiment through all three, then choose Support Tickets and set Window to 1 for the transfer check. Optional Sample tick timeline uses one fixed pseudorandom draw per tick; count can differ from expectation, and extending Window keeps its prefix. It is a single illustrative sample, not exact probability evidence. Formula details are optional.",
  masteryCriteria: ["Distinguishes a geometric mean wait from a guaranteed event time.", "Explains reciprocal wait and proportional expected count as p changes.", "Changes observation window without changing rate or the first-event waiting law.", "Separates exact tick probability, Poisson approximation and the small-μ linear shortcut.", "Transfers to a new scenario/window without equating a count with a probability."],
  steps: arrivalExperiments.map((experiment, index) => ({ title: experiment.title, experiment: `Choose a prediction to restore the starting parameters. ${experiment.action} Explain, then use ${index === 2 ? "Try the transfer check" : "Next experiment"}.`, predictionQuestion: experiment.question, observationPrompt: experiment.explanation, takeaway: experiment.takeaway })),
};
export function stateForScenario(id: string): ArrivalState {
  const scenario = arrivalScenarios.find((item) => item.id === id) ?? arrivalScenarios[0];
  return { scenario: scenario.id, p: scenario.pPerSecond, window: scenario.windowMinutes };
}
