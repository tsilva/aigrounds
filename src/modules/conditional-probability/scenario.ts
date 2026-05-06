import { type ScenarioId } from "./conditional-probability-engine";

export type ConditionalScenario = {
  id: ScenarioId;
  shortLabel: string;
  title: string;
  description: string;
  eventA: string;
  eventB: string;
  intuition: string;
};

export const conditionalScenarios: ConditionalScenario[] = [
  {
    id: "independent",
    shortLabel: "same chance",
    title: "Independent",
    description: "A changes the group, but B keeps the same rate.",
    eventA: "A = joined the study group",
    eventB: "B = solved the warmup",
    intuition: "Filtering by A leaves the chance of B unchanged.",
  },
  {
    id: "dependent",
    shortLabel: "chance moves",
    title: "Dependent",
    description: "B is much more common inside A than outside it.",
    eventA: "A = practiced with feedback",
    eventB: "B = passed the check",
    intuition: "Filtering by A changes the chance of B.",
  },
  {
    id: "base-rate",
    shortLabel: "rare event",
    title: "Base-rate shift",
    description: "A strong signal can still point to a small slice of everyone.",
    eventA: "A = positive signal",
    eventB: "B = rare condition",
    intuition: "The conditional rate can jump while the joint count stays small.",
  },
];

