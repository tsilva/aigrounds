import { type EventRuleId, type RuleView } from "./probability-rules-engine";

export type EventOption = {
  id: EventRuleId;
  label: string;
  shortLabel: string;
  description: string;
};

export const eventAOptions: EventOption[] = [
  {
    id: "sum-seven",
    label: "Sum is 7",
    shortLabel: "sum = 7",
    description: "Six diagonal outcomes.",
  },
  {
    id: "sum-nine-plus",
    label: "Sum ≥ 9",
    shortLabel: "sum ≥ 9",
    description: "The upper-right corner.",
  },
  {
    id: "doubles",
    label: "Doubles",
    shortLabel: "same dice",
    description: "Both dice match.",
  },
];

export const eventBOptions: EventOption[] = [
  {
    id: "first-even",
    label: "First die even",
    shortLabel: "die 1 even",
    description: "Rows 2, 4, and 6.",
  },
  {
    id: "second-four-plus",
    label: "Second die ≥ 4",
    shortLabel: "die 2 ≥ 4",
    description: "Columns 4, 5, and 6.",
  },
  {
    id: "at-least-one-six",
    label: "At least one 6",
    shortLabel: "any 6",
    description: "The last row or column.",
  },
];

export const ruleViews: RuleView[] = [
  "a",
  "not-a",
  "intersection",
  "union",
  "a-only",
  "b-only",
];
